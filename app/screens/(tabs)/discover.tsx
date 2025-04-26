import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { lightTheme } from '../../../useTheme';
import { fetchRestaurantsWithDistance } from '../../services/restaurantService';
import { RestaurantWithDistance } from '../../services/restaurantType';

type FilterOptions = {
  cuisines: string[];
  priceRange: string[];
  distance: number;
  sortBy: 'rating' | 'distance' | 'price';
};

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

const DISTANCE_OPTIONS = [10, 20, 50, 70];

const SORT_OPTIONS = [
  { id: 'rating', label: 'Rating' },
  { id: 'distance', label: 'Distance/Time' },
  { id: 'price', label: 'Price' },
];

const DiscoverScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    cuisines: ['All'],
    priceRange: [],
    distance: 70,
    sortBy: 'rating',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurants, setRestaurants] = useState<RestaurantWithDistance[]>([]);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const restaurantsData = await fetchRestaurantsWithDistance();
      console.log("Fetched restaurants:", restaurantsData);
      
      if (!Array.isArray(restaurantsData)) {
        throw new Error('Invalid data format received');
      }

      setRestaurants(restaurantsData);
      setError(null);
    } catch (err) {
      console.error('Failed to load data:', err);
      setError('Failed to load restaurants. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRestaurants = restaurants.filter(restaurant => {
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
    if (restaurant.distance) {
      const distanceValue = parseFloat(restaurant.distance.split(' ')[0]);
      if (!isNaN(distanceValue) && distanceValue > filters.distance) {
        return false;
      }
    }

    return true;
  });

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    switch (filters.sortBy) {
      case 'rating':
        return (b.ratings?.average_rating || 0) - (a.ratings?.average_rating || 0);
      case 'distance':
        const aDistance = a.distance ? parseFloat(a.distance.split(' ')[0]) : Infinity;
        const bDistance = b.distance ? parseFloat(b.distance.split(' ')[0]) : Infinity;
        return aDistance - bDistance;
      case 'price':
        // Convert price symbols to numerical values ($=1, $$=2, etc.)
        const aPriceValue = a.price?.length || 2;
        const bPriceValue = b.price?.length || 2;
        return aPriceValue - bPriceValue;
      default:
        return 0;
    }
  });

  const toggleFavorite = (_id: string) => {
    setFavorites(prev => 
      prev.includes(_id) 
        ? prev.filter(id => id !== _id) 
        : [...prev, _id]
    );
  };

  const toggleCuisine = (cuisine: string) => {
    if (cuisine === 'All') {
      setFilters({ ...filters, cuisines: ['All'] });
    } else {
      const newCuisines = filters.cuisines.includes('All')
        ? [cuisine]
        : filters.cuisines.includes(cuisine)
        ? filters.cuisines.filter(c => c !== cuisine)
        : [...filters.cuisines, cuisine];
      
      setFilters({ ...filters, cuisines: newCuisines.length === 0 ? ['All'] : newCuisines });
    }
  };

  const togglePriceRange = (price: string) => {
    const newPriceRange = filters.priceRange.includes(price)
      ? filters.priceRange.filter(p => p !== price)
      : [...filters.priceRange, price];
    setFilters({ ...filters, priceRange: newPriceRange });
  };

  const applyFilters = () => setShowFilters(false);

  const resetFilters = () => {
    setFilters({
      cuisines: ['All'],
      priceRange: [],
      distance: 70,
      sortBy: 'rating',
    });
  };

  const activeFilterCount = [
    filters.cuisines.length > 0 && !(filters.cuisines.length === 1 && filters.cuisines[0] === 'All'),
    filters.priceRange.length > 0,
    filters.distance < 10,
  ].filter(Boolean).length;

  const renderRestaurantItem = ({ item }: { item: RestaurantWithDistance }) => (
    <View style={[styles.restaurantCard, { backgroundColor: lightTheme.colors.background }]}>
      <TouchableOpacity 
        onPress={() => router.push(`/screens/(tabs)/${item._id}`)}
        activeOpacity={0.9}
      >
        <Image 
          source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} 
          style={styles.restaurantImage}
          resizeMode="cover"
        />
        
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={(e) => {
            e.stopPropagation();
            toggleFavorite(item._id);
          }}
        >
          <Ionicons
            name={favorites.includes(item._id) ? "heart" : "heart-outline"}
            size={24}
            color={favorites.includes(item._id) ? lightTheme.colors.primary : "white"}
          />
        </TouchableOpacity>
      </TouchableOpacity>

      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={[styles.restaurantName, { color: lightTheme.colors.text }]}>
            {item.name}
          </Text>
          <View style={[styles.ratingContainer, { backgroundColor: lightTheme.colors.tabBar }]}>
            <Ionicons name="star" size={16} color={lightTheme.colors.primary} />
            <Text style={[styles.rating, { color: lightTheme.colors.text }]}>
              {item.ratings?.average_rating?.toFixed(1) || 'N/A'}
            </Text>
          </View>
        </View>
        
        <View style={styles.cuisineDistanceRow}>
          <Text style={[styles.cuisineText, { color: lightTheme.colors.primary }]}>
            {item.cuisine}
          </Text>
          <Text style={[styles.distanceText, { color: lightTheme.colors.text }]}>
            {item.distance || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.restaurantMeta}>
          <Text style={[styles.priceText, { color: lightTheme.colors.text }]}>
            {item.price || '$$'}
          </Text>
          <Text style={[styles.dotSeparator, { color: lightTheme.colors.text }]}>•</Text>
          <Text style={[styles.timeAwayText, { color: lightTheme.colors.text }]}>
            {item.duration || 'N/A'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: lightTheme.colors.background }]}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color={lightTheme.colors.primary} />
          <Text style={[styles.errorText, { color: lightTheme.colors.text }]}>{error}</Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: lightTheme.colors.primary }]}
            onPress={() => {
              setError(null);
              setIsLoading(true);
              loadData();
            }}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: lightTheme.colors.text }]}>Ready to explore?</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={20} color={lightTheme.colors.primary} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, { backgroundColor: lightTheme.colors.tabBar }]}>
          <Ionicons name="search" size={20} color={lightTheme.colors.text} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: lightTheme.colors.text }]}
            placeholder="Search restaurants or cuisines"
            placeholderTextColor={lightTheme.colors.text}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={[styles.separator, { backgroundColor: lightTheme.colors.border }]} />

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={[styles.resultsCount, { color: lightTheme.colors.text }]}>
          {sortedRestaurants.length} restaurants found
        </Text>
        <TouchableOpacity onPress={() => setShowFilters(true)}>
          <Text style={[styles.sortText, { color: lightTheme.colors.primary }]}>
            Sort: {SORT_OPTIONS.find(o => o.id === filters.sortBy)?.label}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Restaurant List */}
      <FlatList
        data={sortedRestaurants}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.restaurantList}
        renderItem={renderRestaurantItem}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="restaurant-outline" size={48} color={lightTheme.colors.primary} />
            <Text style={[styles.emptyText, { color: lightTheme.colors.text }]}>
              No restaurants found
            </Text>
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        animationType="slide"
        transparent={false}
        visible={showFilters}
        onRequestClose={() => setShowFilters(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: lightTheme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: lightTheme.colors.text }]}>Filter & Sort</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={24} color={lightTheme.colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Sort Section */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: lightTheme.colors.text }]}>Sort By</Text>
              <View style={styles.sortOptions}>
                {SORT_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.sortOption,
                      filters.sortBy === option.id && styles.sortOptionActive,
                      { backgroundColor: lightTheme.colors.tabBar },
                      filters.sortBy === option.id && { backgroundColor: lightTheme.colors.primary },
                    ]}
                    onPress={() => setFilters({ ...filters, sortBy: option.id as any })}
                  >
                    <Text
                      style={[
                        styles.sortOptionText,
                        { color: lightTheme.colors.text },
                        filters.sortBy === option.id && styles.sortOptionTextActive,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Cuisine Section */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: lightTheme.colors.text }]}>Cuisine</Text>
              <View style={styles.filterOptions}>
                {CUISINE_OPTIONS.map((cuisine) => (
                  <TouchableOpacity
                    key={cuisine}
                    style={[
                      styles.filterOption,
                      filters.cuisines.includes(cuisine) && styles.filterOptionActive,
                      { backgroundColor: lightTheme.colors.tabBar },
                      filters.cuisines.includes(cuisine) && { backgroundColor: lightTheme.colors.primary },
                    ]}
                    onPress={() => toggleCuisine(cuisine)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        { color: lightTheme.colors.text },
                        filters.cuisines.includes(cuisine) && styles.filterOptionTextActive,
                      ]}
                    >
                      {cuisine}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Section */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: lightTheme.colors.text }]}>Price Range</Text>
              <View style={styles.filterOptions}>
                {PRICE_RANGES.map((price) => (
                  <TouchableOpacity
                    key={price}
                    style={[
                      styles.filterOption,
                      filters.priceRange.includes(price) && styles.filterOptionActive,
                      { backgroundColor: lightTheme.colors.tabBar },
                      filters.priceRange.includes(price) && { backgroundColor: lightTheme.colors.primary },
                    ]}
                    onPress={() => togglePriceRange(price)}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        { color: lightTheme.colors.text },
                        filters.priceRange.includes(price) && styles.filterOptionTextActive,
                      ]}
                    >
                      {price}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Distance Section */}
            <View style={styles.filterSection}>
              <Text style={[styles.sectionTitle, { color: lightTheme.colors.text }]}>
                Maximum Distance ({filters.distance} km)
              </Text>
              <View style={styles.sliderContainer}>
                {DISTANCE_OPTIONS.map((distance) => (
                  <TouchableOpacity
                    key={distance}
                    style={[
                      styles.distanceOption,
                      filters.distance >= distance && styles.distanceOptionActive,
                      { backgroundColor: lightTheme.colors.tabBar },
                      filters.distance >= distance && { backgroundColor: lightTheme.colors.primary },
                    ]}
                    onPress={() => setFilters({ ...filters, distance })}
                  >
                    <Text
                      style={[
                        styles.distanceOptionText,
                        { color: lightTheme.colors.text },
                        filters.distance >= distance && styles.distanceOptionTextActive,
                      ]}
                    >
                      {distance}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.resetButton,
                { borderColor: lightTheme.colors.primary }
              ]}
              onPress={resetFilters}
            >
              <Text style={[styles.resetButtonText, { color: lightTheme.colors.primary }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.applyButton,
                { backgroundColor: lightTheme.colors.primary }
              ]}
              onPress={applyFilters}
            >
              <Text style={styles.applyButtonText}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
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
  // Add these new styles for error handling
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 20,
  },
  retryButton: {
    padding: 15,
    borderRadius: 8,
    width: '60%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  // Keep all your existing styles below exactly as they were
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginTop : 20
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
    backgroundColor: '#FF5252',
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
    paddingHorizontal: 0,  
    marginBottom: 2,
    marginLeft: 0,         
    paddingLeft: 0,        
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingLeft: 12,       // Only left padding for the icon
    paddingRight: 12,      // Right padding for balance
    marginLeft: 0,         // Explicitly set to 0
    marginBottom: 8,
    height: 40,
    backgroundColor: lightTheme.colors.tabBar,
  },
  searchIcon: {
    marginRight: 8,
    alignSelf: 'center',
    marginLeft: 0,         // Explicitly set to 0
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
    marginLeft: 0,         // Explicitly set to 0
  },

  separator: {
    height: 0.9, // Even thinner
    width: '90%',
    alignSelf: 'center',
    backgroundColor: lightTheme.colors.border,
    opacity: 0.9, // Slightly transparent
  },

  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 16,
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
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 6,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
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
  timeAwayText: {
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
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  sortOptionActive: {},
  sortOptionText: {
    fontSize: 14,
  },
  sortOptionTextActive: {
    color: '#fff',
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterOptionActive: {},
  filterOptionText: {
    fontSize: 14,
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  distanceOption: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
  },
  distanceOptionActive: {},
  distanceOptionText: {
    fontSize: 14,
  },
  distanceOptionTextActive: {
    color: '#fff',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resetButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    marginRight: 8,
  },
  resetButtonText: {
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    borderRadius: 12,
    marginLeft: 8,
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default DiscoverScreen;