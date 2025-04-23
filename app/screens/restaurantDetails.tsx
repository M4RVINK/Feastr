import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { lightTheme } from '../../useTheme';

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  price: string;
  distance: number;
  deliveryTime: string;
  imageUrl: string;
};

type FilterOptions = {
  cuisines: string[];
  priceRange: string[];
  distance: number;
  sortBy: 'rating' | 'distance' | 'price' | 'delivery';
};

// Random food image URLs from Unsplash
const FOOD_IMAGES = [
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38',
  'https://images.unsplash.com/photo-1565958011703-72f8580ce9d7',
  'https://images.unsplash.com/photo-1482049016688-2d3e1b311543',
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929',
  'https://images.unsplash.com/photo-1467003909585-2f8a72700288',
  'https://images.unsplash.com/photo-1544025162-d76694265947',
  'https://images.unsplash.com/photo-1559847844-5315695dadae',
];

const CUISINE_OPTIONS = [
  'All',
  'Japanese',
  'Italian',
  'Mexican',
  'Chinese',
  'Indian',
  'American',
  'Healthy',
  'Mediterranean',
];

const PRICE_RANGES = ['$', '$$', '$$$', '$$$$'];

const DISTANCE_OPTIONS = [1, 3, 5, 10];

const SORT_OPTIONS = [
  { id: 'rating', label: 'Rating' },
  { id: 'distance', label: 'Distance' },
  { id: 'price', label: 'Price' },
  { id: 'delivery', label: 'Delivery Time' },
];

// Generate random restaurants with random images
const generateRestaurants = (count: number): Restaurant[] => {
  return Array.from({ length: count }, (_, i) => {
    const cuisine = CUISINE_OPTIONS[Math.floor(Math.random() * (CUISINE_OPTIONS.length - 1)) + 1];
    const price = PRICE_RANGES[Math.floor(Math.random() * PRICE_RANGES.length)];
    const distance = Math.random() * 10;
    
    return {
      id: `${i + 1}`,
      name: `${cuisine} ${['Place', 'House', 'Garden', 'Bistro', 'Cafe', 'Kitchen'][Math.floor(Math.random() * 6)]} ${i + 1}`,
      cuisine,
      rating: Number((3.5 + Math.random() * 1.5).toFixed(1)),
      price,
      distance: Number(distance.toFixed(1)),
      deliveryTime: `${Math.floor(15 + Math.random() * 30)}-${Math.floor(30 + Math.random() * 30)} min`,
      imageUrl: `${FOOD_IMAGES[Math.floor(Math.random() * FOOD_IMAGES.length)]}?w=500&auto=format&fit=crop&id=${i}`,
    };
  });
};

const RESTAURANTS = generateRestaurants(20);

const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    cuisines: ['All'],
    priceRange: [],
    distance: 10,
    sortBy: 'rating',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleCuisine = (cuisine: string) => {
    if (cuisine === 'All') {
      setFilters({ ...filters, cuisines: ['All'] });
    } else {
      const newCuisines = filters.cuisines.includes('All')
        ? [cuisine]
        : filters.cuisines.includes(cuisine)
        ? filters.cuisines.filter(c => c !== cuisine)
        : [...filters.cuisines, cuisine];
      
      if (newCuisines.length === 0) {
        setFilters({ ...filters, cuisines: ['All'] });
      } else {
        setFilters({ ...filters, cuisines: newCuisines });
      }
    }
  };

  const togglePriceRange = (price: string) => {
    const newPriceRange = filters.priceRange.includes(price)
      ? filters.priceRange.filter(p => p !== price)
      : [...filters.priceRange, price];
    setFilters({ ...filters, priceRange: newPriceRange });
  };

  const applyFilters = () => {
    setShowFilters(false);
  };

  const resetFilters = () => {
    setFilters({
      cuisines: ['All'],
      priceRange: [],
      distance: 10,
      sortBy: 'rating',
    });
  };

  const filteredRestaurants = RESTAURANTS.filter(restaurant => {
    // Search filter
    if (searchQuery && 
        !restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !restaurant.cuisine.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Cuisine filter
    if (!filters.cuisines.includes('All') && !filters.cuisines.includes(restaurant.cuisine)) {
      return false;
    }

    // Price range filter
    if (filters.priceRange.length > 0 && !filters.priceRange.includes(restaurant.price)) {
      return false;
    }

    // Distance filter
    if (restaurant.distance > filters.distance) {
      return false;
    }

    return true;
  }).sort((a, b) => {
    // Sorting logic
    switch (filters.sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'distance':
        return a.distance - b.distance;
      case 'price':
        return b.price.length - a.price.length;
      case 'delivery':
        const aTime = parseInt(a.deliveryTime.split('-')[0]);
        const bTime = parseInt(b.deliveryTime.split('-')[0]);
        return aTime - bTime;
      default:
        return 0;
    }
  });

  const activeFilterCount = [
    filters.cuisines.length > 0 && !(filters.cuisines.length === 1 && filters.cuisines[0] === 'All'),
    filters.priceRange.length > 0,
    filters.distance < 10,
  ].filter(Boolean).length;

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity 
      style={[styles.restaurantCard, { backgroundColor: lightTheme.colors.background }]}
      onPress={() => router.push(`/restaurant/${item.id}`)}
    >
      <Image 
        source={{ uri: item.imageUrl }} 
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={[styles.restaurantName, { color: lightTheme.colors.text }]}>{item.name}</Text>
          <View style={[styles.ratingContainer, { backgroundColor: lightTheme.colors.tabBar }]}>
            <Ionicons name="star" size={16} color={lightTheme.colors.primary} />
            <Text style={[styles.rating, { color: lightTheme.colors.text }]}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.cuisineDistanceRow}>
          <Text style={[styles.cuisineText, { color: lightTheme.colors.primary }]}>{item.cuisine}</Text>
          <Text style={[styles.distanceText, { color: lightTheme.colors.text }]}>{item.distance.toFixed(1)} mi</Text>
        </View>
        <View style={styles.restaurantMeta}>
          <Text style={[styles.priceText, { color: lightTheme.colors.text }]}>{item.price}</Text>
          <Text style={[styles.dotSeparator, { color: lightTheme.colors.text }]}>•</Text>
          <Text style={[styles.deliveryText, { color: lightTheme.colors.text }]}>{item.deliveryTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: lightTheme.colors.background }]}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: lightTheme.colors.text }]}>Discover</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color={lightTheme.colors.primary} />
          {activeFilterCount > 0 && (
            <View style={[styles.filterBadge, { backgroundColor: lightTheme.colors.primary }]}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: lightTheme.colors.tabBar }]}>
          <Ionicons name="search" size={20} color={lightTheme.colors.tabIconInactive} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: lightTheme.colors.text }]}
            placeholder="Search restaurants or cuisines"
            placeholderTextColor={lightTheme.colors.tabIconInactive}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={lightTheme.colors.tabIconInactive} />
          <Text style={[styles.locationText, { color: lightTheme.colors.tabIconInactive }]}>New York, NY</Text>
        </View>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={[styles.resultsCount, { color: lightTheme.colors.tabIconInactive }]}>
          {filteredRestaurants.length} restaurants found
        </Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Text style={[styles.sortText, { color: lightTheme.colors.primary }]}>
            Sort: {SORT_OPTIONS.find(o => o.id === filters.sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant List */}
      <FlatList
        data={filteredRestaurants}
        keyExtractor={(item) => item.id}
        renderItem={renderRestaurantItem}
        contentContainerStyle={styles.restaurantList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={lightTheme.colors.primary} />
            <Text style={[styles.emptyText, { color: lightTheme.colors.text }]}>No restaurants found</Text>
            <Text style={[styles.emptySubtext, { color: lightTheme.colors.tabIconInactive }]}>
              Try adjusting your filters or search
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    marginLeft: 4,
    fontSize: 14,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  resultsCount: {
    fontSize: 14,
  },
  sortText: {
    fontSize: 14,
    fontWeight: '500',
  },
  restaurantList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  restaurantCard: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  restaurantImage: {
    width: '100%',
    height: 180,
  },
  restaurantInfo: {
    padding: 12,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rating: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
  cuisineDistanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: '600',
  },
  distanceText: {
    fontSize: 14,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
  },
  dotSeparator: {
    marginHorizontal: 6,
    fontSize: 14,
  },
  deliveryText: {
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
  },
});

export default DiscoverScreen;