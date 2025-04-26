import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, ActivityIndicator, RefreshControl, Animated } from 'react-native';
import { useFavoriteStore } from '../stores/favoriteStore';
import { auth } from '../config/firebase';
import { Config } from '../config/config';
import { router } from 'expo-router';
import { lightTheme } from '../../useTheme';
import { Ionicons } from '@expo/vector-icons'; // ADD ICONS for Back Button

interface Restaurant {
  _id: string;
  name: string;
  images: string[];
  cuisine: string;
  price: string;
  ratings: {
    average_rating: number;
    total_reviews: number;
  };
}

export default function FavoriteRestaurantsScreen() {
  const [savedRestaurants, setSavedRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));

  const { fetchFavorites } = useFavoriteStore();
  const userId = auth.currentUser?.uid;

  const loadSavedRestaurants = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      await fetchFavorites(userId);

      const response = await fetch(`${Config.API_URL}/api/getFavorites/${userId}`);
      const restaurants = await response.json();
      setSavedRestaurants(restaurants);

      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
      
    } catch (error) {
      console.error('Error fetching saved restaurants:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSavedRestaurants();
  }, [loadSavedRestaurants]);

  const onRefresh = () => {
    setRefreshing(true);
    loadSavedRestaurants();
  };

  const renderRestaurantItem = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity 
      style={[styles.restaurantCard, { backgroundColor: lightTheme.colors.background }]}
      onPress={() => router.push({ pathname: `/screens/${item._id}`, params: { origin: 'favorites' } })}
      activeOpacity={0.9}
    >
      <Image 
        source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }}
        style={styles.restaurantImage}
        resizeMode="cover"
      />
      <View style={styles.restaurantInfo}>
        <Text style={[styles.restaurantName, { color: lightTheme.colors.text }]}>
          {item.name}
        </Text>
        <Text style={[styles.restaurantCuisine, { color: lightTheme.colors.primary }]}>
          {item.cuisine} • {item.price}
        </Text>
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingText, { color: lightTheme.colors.text }]}>
            ⭐ {item.ratings?.average_rating?.toFixed(1) || 'N/A'} ({item.ratings?.total_reviews || 0})
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.replace('/screens/(tabs)/profile')}>
          <Ionicons name="chevron-back" size={26} color={lightTheme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
      </View>

      {/* List or Empty State */}
      {savedRestaurants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: lightTheme.colors.text }]}>
            No favorite restaurants yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={savedRestaurants}
          keyExtractor={(item) => item._id}
          renderItem={renderRestaurantItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={lightTheme.colors.primary}
            />
          }
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  emptyText: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: lightTheme.colors.text,
  },
  listContent: { padding: 16 },
  restaurantCard: { marginBottom: 12, borderRadius: 12, overflow: 'hidden' },
  restaurantImage: { width: '100%', height: 160 },
  restaurantInfo: { padding: 10 },
  restaurantName: { fontSize: 17, fontWeight: 'bold' },
  restaurantCuisine: { fontSize: 13, marginTop: 4 },
  ratingContainer: { marginTop: 6 },
  ratingText: { fontSize: 13 },
});
