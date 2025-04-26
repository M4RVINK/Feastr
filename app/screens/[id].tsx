//when we use [id].tsx, the bracket indicate that this is a dynamic route

import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../useTheme';

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams();
  
  // Temporary data - replace with your actual data fetching later
  const restaurant = {
    _id: id,
    name: "Sample Restaurant",
    cuisine: "Italian",
    distance: "1.2 km",
    duration: "20-30 min",
    price: "$$",
    images: ["https://images.unsplash.com/photo-1516100882582-96c3a05fe590"],
    description: "This is a sample restaurant description.",
    address: {
      street: "123 Main St",
      city: "New York",
      zip: "10001"
    },
    ratings: {
      average_rating: 4.5,
      total_reviews: 124
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      {/* Header Image */}
      <Image 
        source={{ uri: restaurant.images[0] }} 
        style={styles.headerImage}
        resizeMode="cover"
      />
      
      {/* Basic Info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: lightTheme.colors.text }]}>
          {restaurant.name}
        </Text>
        
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={20} color={lightTheme.colors.primary} />
          <Text style={[styles.rating, { color: lightTheme.colors.text }]}>
            {restaurant.ratings.average_rating} ({restaurant.ratings.total_reviews}+)
          </Text>
        </View>
        
        <Text style={[styles.cuisine, { color: lightTheme.colors.primary }]}>
          {restaurant.cuisine} • {restaurant.price} • {restaurant.distance}
        </Text>
      </View>
      
      {/* Details Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: lightTheme.colors.text }]}>
          About
        </Text>
        <Text style={[styles.description, { color: lightTheme.colors.text }]}>
          {restaurant.description}
        </Text>
      </View>
      
      {/* Address Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: lightTheme.colors.text }]}>
          Location
        </Text>
        <Text style={[styles.address, { color: lightTheme.colors.text }]}>
          {restaurant.address.street}
        </Text>
        <Text style={[styles.address, { color: lightTheme.colors.text }]}>
          {restaurant.address.city}, {restaurant.address.zip}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    width: '100%',
    height: 250,
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
  },
  cuisine: {
    fontSize: 16,
    marginBottom: 16,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  address: {
    fontSize: 16,
    marginBottom: 4,
  },
});