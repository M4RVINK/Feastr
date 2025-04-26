// import * as Location from 'expo-location';
// import { Restaurant, RestaurantWithDistance } from './restaurantType';
// import { Config } from '../config/config'

// const GOOGLE_API_KEY = Config.GOOGLE_MAPS_API;
// const API_URL = Config.API_URL;


// const GET_API_ENDPOINT = `${API_URL}/api/restaurants/getRestaurant`;

// const extractKm = (distance?: string): number => {
//   if (!distance || distance === "N/A") return Infinity;
//   try {
//     // Handle cases like "1.5 km" or "1,5 km"
//     const numericValue = parseFloat(distance.replace(/[^\d.,]/g, '').replace(',', '.'));
//     return isNaN(numericValue) ? Infinity : numericValue;
//   } catch {
//     return Infinity;
//   }
// };

// const getPriceRange = (restaurant: Restaurant): string => {
//   if (!restaurant.menu || restaurant.menu.length === 0) return '$$';
  
//   const allItems = restaurant.menu.flatMap(section => section.items);
//   if (allItems.length === 0) return '$$';
  
//   const avgPrice = allItems.reduce((sum, item) => sum + item.price, 0) / allItems.length;
  
//   if (avgPrice < 10) return '$';
//   if (avgPrice < 20) return '$$';
//   if (avgPrice < 30) return '$$$';
//   return '$$$$';
// };

// export const fetchRestaurantsWithDistance = async (): Promise<RestaurantWithDistance[]> => {
//   try {
//     // 1. Get user location
//     const { status } = await Location.requestForegroundPermissionsAsync();
//     if (status !== 'granted') {
//       throw new Error('Location permission denied');
//     }
//     console.log("we got here 2");
//     console.log(API_URL);
//     const { coords } = await Location.getCurrentPositionAsync({
//       accuracy: Location.Accuracy.High
//     });
//     const userLocation = `${coords.latitude},${coords.longitude}`;

//     // 2. Fetch restaurants from backend
//     const response = await fetch(`${GET_API_ENDPOINT}?fields=name,cuisine,images,ratings,location,menu`);
//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const restaurants: Restaurant[] = await response.json();

//     // 3. Process in batches (google maps api ma fi ye2bal aktar men 25 locations per call)
//     const BATCH_SIZE = 25;
//     const results: RestaurantWithDistance[] = [];
    
//     for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
//       const batch = restaurants.slice(i, i + BATCH_SIZE);


//       console.log("Batch:", batch.map(r => ({
//         name: r.name,
//         lat: r.location?.lat,
//         lng: r.location?.lng
//       })));

//       const destinations = batch.map(r => `${r.location.lat},${r.location.lng}`).join('|');
//       const distanceResponse = await fetch(
//         `https://maps.googleapis.com/maps/api/distancematrix/json?` +
//         `units=metric&` +
//         `origins=${userLocation}&` +
//         `destinations=${destinations}&` +
//         `key=${GOOGLE_API_KEY}`
//       );
      
//       const distanceData = await distanceResponse.json();
      
//       batch.forEach((restaurant, index) => {
//         const element = distanceData.rows[0].elements[index];
        
//         if (!element || element.status !== "OK") {
//           console.warn(`Invalid data for ${restaurant.name}:`, element);
//           results.push({
//             ...restaurant,
//             distance: "N/A",
//             duration: "N/A",
//             price: getPriceRange(restaurant)
//             // Remove the id field - use _id instead
//           });
//           return;
//         }
      
//         results.push({
//           ...restaurant,
//           distance: element.distance?.text || "N/A",
//           duration: element.duration?.text || "N/A",
//           price: getPriceRange(restaurant)
//           // Remove the id field - use _id instead
//         });
//       });
//     }

//     return results.sort((a, b) => extractKm(a.distance) - extractKm(b.distance));

//   } catch (error) {
//     console.error('RestaurantService Error:', error);
//     throw error;
//   }
// };

import * as Location from 'expo-location';
import { Restaurant, RestaurantWithDistance } from './restaurantType';
import { Config } from '../config/config';

const GOOGLE_API_KEY = Config.GOOGLE_MAPS_API;
const API_URL = Config.API_URL;

const GET_API_ENDPOINT = `${API_URL}/api/restaurants/getRestaurant`;

// In-memory cache to store the restaurant data
let cachedRestaurants: RestaurantWithDistance[] | null = null;
let lastFetchTime: number | null = null;
const CACHE_EXPIRATION_TIME = 10 * 60 * 1000; // Cache expires after 10 minutes

const extractKm = (distance?: string): number => {
  if (!distance || distance === "N/A") return Infinity;
  try {
    const numericValue = parseFloat(distance.replace(/[^\d.,]/g, '').replace(',', '.'));
    return isNaN(numericValue) ? Infinity : numericValue;
  } catch {
    return Infinity;
  }
};

const getPriceRange = (restaurant: Restaurant): string => {
  if (!restaurant.menu || restaurant.menu.length === 0) return '$$';
  const allItems = restaurant.menu.flatMap(section => section.items);
  if (allItems.length === 0) return '$$';

  const avgPrice = allItems.reduce((sum, item) => sum + item.price, 0) / allItems.length;

  if (avgPrice < 10) return '$';
  if (avgPrice < 20) return '$$';
  if (avgPrice < 30) return '$$$';
  return '$$$$';
};

export const fetchRestaurantsWithDistance = async (): Promise<RestaurantWithDistance[]> => {
  try {
    // Check if data is cached and if cache is still valid
    const currentTime = Date.now();
    if (cachedRestaurants && lastFetchTime && currentTime - lastFetchTime < CACHE_EXPIRATION_TIME) {
      console.log('Returning cached restaurants');
      return cachedRestaurants;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const { coords } = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High
    });
    const userLocation = `${coords.latitude},${coords.longitude}`;

    const response = await fetch(`${GET_API_ENDPOINT}?fields=name,cuisine,images,ratings,location,menu`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const restaurants: Restaurant[] = await response.json();

    const BATCH_SIZE = 25;
    const results: RestaurantWithDistance[] = [];

    for (let i = 0; i < restaurants.length; i += BATCH_SIZE) {
      const batch = restaurants.slice(i, i + BATCH_SIZE);
      const destinations = batch.map(r => `${r.location.lat},${r.location.lng}`).join('|');
      
      const distanceResponse = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?` +
        `units=metric&` +
        `origins=${userLocation}&` +
        `destinations=${destinations}&` +
        `key=${GOOGLE_API_KEY}`
      );

      const distanceData = await distanceResponse.json();

      batch.forEach((restaurant, index) => {
        const element = distanceData.rows[0].elements[index];
        if (!element || element.status !== "OK") {
          console.warn(`Invalid data for ${restaurant.name}:`, element);
          results.push({
            ...restaurant,
            distance: "N/A",
            duration: "N/A",
            price: getPriceRange(restaurant)
          });
          return;
        }

        results.push({
          ...restaurant,
          distance: element.distance?.text || "N/A",
          duration: element.duration?.text || "N/A",
          price: getPriceRange(restaurant)
        });
      });
    }

    // Cache the results
    cachedRestaurants = results.sort((a, b) => extractKm(a.distance) - extractKm(b.distance));
    lastFetchTime = currentTime;

    return cachedRestaurants;

  } catch (error) {
    console.error('RestaurantService Error:', error);
    throw error;
  }
};
