import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity, FlatList, Dimensions, Linking } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useRestaurantStore } from '../stores/restaurantStore';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../useTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { restaurants } = useRestaurantStore();
  const restaurant = restaurants.find(r => r._id === id);

  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState<'Info' | 'Menu' | 'Friends'>('Info');
  const [currentImage, setCurrentImage] = useState(0);

  if (!restaurant) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: lightTheme.colors.text }}>Restaurant not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButtonInline}>
          <Ionicons name="chevron-back" size={24} color={lightTheme.colors.primary} />
          <Text style={{ color: lightTheme.colors.primary }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleCallPress = () => {
    if (restaurant.contact_info?.phone_number) {
      Linking.openURL(`tel:${restaurant.contact_info.phone_number}`);
    }
  };

  const handleWebsitePress = () => {
    if (restaurant.contact_info?.website_url) {
      Linking.openURL(restaurant.contact_info.website_url);
    }
  };

  const onScroll = (event: any) => {
    const slide = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentImage(slide);
  };

  const renderMenuItem = ({ item }: { item: any }) => {
    const displayedTags = item.tags?.slice(0, 3) || [];
    const extraTagsCount = item.tags?.length > 3 ? item.tags.length - 3 : 0;

    return (
      <View style={styles.menuItem}>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuItemName}>{item.name}</Text>
          <View style={styles.starsContainer}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Ionicons
                key={index}
                name={index < Math.round(item.rating) ? 'star' : 'star-outline'}
                size={16}
                color={lightTheme.colors.primary}
              />
            ))}
          </View>
          <View style={styles.tagsContainer}>
            {displayedTags.map((tag: string, index: number) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
            {extraTagsCount > 0 && (
              <View style={styles.tag}>
                <Text style={styles.tagText}>+{extraTagsCount} more</Text>
              </View>
            )}
          </View>
        </View>
        <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <ScrollView style={{ backgroundColor: lightTheme.colors.background }}>
      {/* Gallery Section */}
      <View style={styles.galleryContainer}>
        <FlatList
          data={restaurant.images}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item, index) => `${item}-${index}`}
          onScroll={onScroll}
          renderItem={({ item }) => (
            <Image source={{ uri: item }} style={styles.galleryImage} />
          )}
        />
        {/* Back Button */}
        <TouchableOpacity style={styles.backButtonOverlay} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color="white" />
        </TouchableOpacity>
        {/* Dots */}
        <View style={styles.dotsContainer}>
          {restaurant.images.map((_, index) => (
            <View key={index} style={[styles.dot, currentImage === index && styles.activeDot]} />
          ))}
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text style={styles.restaurantName}>{restaurant.name}</Text>
        <View style={styles.rowInfo}>
          <Text style={styles.cuisineTag}>{restaurant.cuisine}</Text>
          <Text style={styles.priceTag}>{restaurant.price}</Text>
          <View style={styles.ratingTag}>
            <Ionicons name="star" size={16} color={lightTheme.colors.primary} />
            <Text style={styles.ratingText}>{restaurant.ratings?.average_rating?.toFixed(1)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleCallPress}>
            <Ionicons name="call-outline" size={20} color={lightTheme.colors.primary} />
            <Text style={styles.actionButtonText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-outline" size={20} color={lightTheme.colors.primary} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => setLiked(!liked)}>
            <Ionicons name={liked ? 'heart' : 'heart-outline'} size={20} color={liked ? lightTheme.colors.primary : lightTheme.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsRow}>
          {['Info', 'Menu', 'Friends'].map(tab => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab as any)} style={[styles.tabButton, activeTab === tab && styles.activeTab]}>
              <Text style={[styles.tabButtonText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === 'Info' && (
            <View>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.description}>{restaurant.description}</Text>

              {/* Contact Info */}
              <View style={styles.contactCard}>
                {restaurant.address?.street && (
                  <View style={styles.contactRow}>
                    <Ionicons name="location-outline" size={20} color={lightTheme.colors.primary} />
                    <Text style={styles.contactText}>{restaurant.address.street}, {restaurant.address.city}</Text>
                  </View>
                )}
                <View style={styles.contactRow}>
                  <Ionicons name="time-outline" size={20} color={lightTheme.colors.primary} />
                  <Text style={styles.contactText}>{restaurant.opening_times?.[0] || 'Opening hours not available'}</Text>
                </View>
                {restaurant.contact_info?.phone_number && (
                  <TouchableOpacity style={styles.contactRow} onPress={handleCallPress}>
                    <Ionicons name="call-outline" size={20} color={lightTheme.colors.primary} />
                    <Text style={styles.contactText}>{restaurant.contact_info.phone_number}</Text>
                  </TouchableOpacity>
                )}
                {restaurant.contact_info?.website_url && (
                  <TouchableOpacity style={styles.contactRow} onPress={handleWebsitePress}>
                    <Ionicons name="globe-outline" size={20} color={lightTheme.colors.primary} />
                    <Text style={[styles.contactText, { textDecorationLine: 'underline' }]}>Website</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {activeTab === 'Menu' && (
            <View>
              <Text style={styles.sectionTitle}>Popular Items</Text>
              <FlatList
                data={restaurant.menu?.[0]?.items || []}
                keyExtractor={(item, index) => `${item.name}-${index}`}
                renderItem={renderMenuItem}
                scrollEnabled={false}
              />
              {restaurant.menu?.[0]?.menu_pdf_link && (
                <TouchableOpacity style={styles.menuButton} onPress={() => Linking.openURL(restaurant.menu[0].menu_pdf_link)}>
                  <Text style={{ color: lightTheme.colors.primary }}>View Full Menu (PDF)</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {activeTab === 'Friends' && (
            <View>
              <Text style={styles.sectionTitle}>Friends who visited</Text>
              <Text style={styles.description}>Coming Soon...</Text>
            </View>
          )}
        </View>

        {/* Reservation Button */}
        <TouchableOpacity style={styles.reserveButton}>
          <Text style={styles.reserveButtonText}>Make a Reservation</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backButtonInline: { flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  galleryContainer: { position: 'relative' },
  galleryImage: { width: SCREEN_WIDTH, height: 200 },
  backButtonOverlay: { position: 'absolute', top: 50, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20 },
  dotsContainer: { position: 'absolute', bottom: 10, alignSelf: 'center', flexDirection: 'row' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.5)', marginHorizontal: 4 },
  activeDot: { backgroundColor: 'white' },
  infoContainer: { padding: 20 },
  restaurantName: { fontSize: 24, fontWeight: 'bold', marginBottom: 8 },
  rowInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 12 },
  cuisineTag: { fontSize: 12, backgroundColor: 'rgba(151,71,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20, color: lightTheme.colors.primary },
  priceTag: { fontSize: 14, color: lightTheme.colors.text },
  ratingTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: lightTheme.colors.tabBar, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  ratingText: { marginLeft: 4, fontSize: 14, fontWeight: '600', color: lightTheme.colors.text },
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16 },
  actionButton: { alignItems: 'center' },
  actionButtonText: { color: lightTheme.colors.primary, fontSize: 14, marginTop: 4 },
  tabsRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  tabButton: { paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: lightTheme.colors.primary },
  tabButtonText: { fontSize: 16, color: lightTheme.colors.text },
  activeTabText: { color: lightTheme.colors.primary, fontWeight: 'bold' },
  tabContent: { marginTop: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  description: { fontSize: 16, lineHeight: 22 },
  contactCard: { marginTop: 16, backgroundColor: lightTheme.colors.tabBar, borderRadius: 12, padding: 16 },
  contactRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  contactText: { marginLeft: 10, fontSize: 14, color: lightTheme.colors.text },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
  menuItemName: { fontSize: 14 },
  starsContainer: { flexDirection: 'row', marginTop: 4 },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  tag: { backgroundColor: 'rgba(151,71,255,0.1)', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2 },
  tagText: { fontSize: 10, color: lightTheme.colors.primary },
  menuItemPrice: { fontSize: 14, fontWeight: 'bold' },
  menuButton: { marginTop: 16, alignItems: 'center' },
  reserveButton: { marginTop: 30, backgroundColor: lightTheme.colors.primary, padding: 16, borderRadius: 10, alignItems: 'center' },
  reserveButtonText: { color: 'white', fontWeight: 'bold' },
});
