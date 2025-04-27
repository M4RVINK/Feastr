import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  SafeAreaView,
  Image,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../../useTheme';
import { Config } from '../../config/config';
import { useRestaurantStore } from '../../stores/restaurantStore';
import { useFavoriteStore } from '../../stores/favoriteStore';
import { useAIRecStore } from '../../stores/aiRecStore';
import { auth } from '../../config/firebase';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';

interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  rating: number;
  price: string;
  distance: string;
  images: string[];
  description: string;
  matchReason?: string;
}

interface StructuredTags {
  food_tags: string[];
  ambiance_tags: string[];
  price_tag: string;
  features: string[];
}

export default function AIRecsScreen() {
  const { restaurants } = useRestaurantStore();
  const { favoriteIds, toggleFavorite } = useFavoriteStore();
  const { messages, setMessages, inputText, setInputText } = useAIRecStore();
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const matchRestaurants = (structuredTags: StructuredTags): Restaurant[] => {
    const matched: { restaurant: any; score: number; reason: string[] }[] = [];

    restaurants.forEach((restaurant) => {
      let score = 0;
      const reasons: string[] = [];

      (structuredTags.food_tags || []).forEach(tag => {
        if (
          restaurant.tags?.some((rTag: string) => rTag.toLowerCase().includes(tag.toLowerCase())) ||
          restaurant.keywords?.some((rKeyword: string) => rKeyword.toLowerCase().includes(tag.toLowerCase())) ||
          restaurant.cuisine?.toLowerCase().includes(tag.toLowerCase())
        ) {
          score++;
          reasons.push(`Food: ${tag}`);
        }

        const hasMenuMatch = restaurant.menu?.some((menuSection: any) =>
          menuSection.items?.some((menuItem: any) =>
            menuItem.name.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (hasMenuMatch) {
          score++;
          reasons.push(`Menu item: ${tag}`);
        }
      });

      (structuredTags.ambiance_tags || []).forEach(tag => {
        if (
          restaurant.tags?.some((rTag: string) => rTag.toLowerCase().includes(tag.toLowerCase())) ||
          restaurant.description?.toLowerCase().includes(tag.toLowerCase()) ||
          restaurant.view?.some((view: string) => view.toLowerCase().includes(tag.toLowerCase()))
        ) {
          score++;
          reasons.push(`Ambiance: ${tag}`);
        }
      });

      if (structuredTags.price_tag) {
        const priceLevel = restaurant.price?.length || 2;
        if (
          (structuredTags.price_tag === 'under_20_per_person' && priceLevel <= 1) ||
          (structuredTags.price_tag === 'under_30_per_person' && priceLevel <= 2) ||
          (structuredTags.price_tag === 'under_50_per_person' && priceLevel <= 3) ||
          (structuredTags.price_tag === 'expensive' && priceLevel >= 3)
        ) {
          score++;
          reasons.push(`Price matches (${restaurant.price})`);
        }
      }

      if (score > 0) {
        matched.push({ restaurant, score, reason: reasons });
      }
    });

    matched.sort((a, b) => b.score - a.score);

    return matched.map(m => ({
      _id: m.restaurant._id,
      name: m.restaurant.name,
      cuisine: m.restaurant.cuisine,
      price: m.restaurant.price,
      distance: m.restaurant.distance,
      images: m.restaurant.images,
      description: m.restaurant.description,
      rating: m.restaurant.ratings?.average_rating || 4.5,
      matchReason: m.reason.join(', ')
    }));
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    const oldMessages = [...messages, userMessage];
    setMessages(oldMessages);
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);

    try {
      const response = await fetch(`${Config.API_URL}/api/ai/ai-recommendations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: inputText }),
      });

      const data = await response.json();
      const structuredTags: StructuredTags = data;

      const recommendations = matchRestaurants(structuredTags);

      const aiResponse = recommendations.length === 0
        ? {
            id: Date.now().toString(),
            text: `Sorry, I couldn't find a perfect match for your request: "${inputText}". Maybe try adjusting your query?`,
            isUser: false,
            timestamp: new Date(),
            recommendations: [],
          }
        : {
            id: Date.now().toString(),
            text: `Here are some great matches for your request: "${inputText}"`,
            isUser: false,
            timestamp: new Date(),
            recommendations,
          };

      setMessages([...oldMessages, aiResponse]);

    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <TouchableOpacity
      key={`restaurant-${item._id}`}
      style={[styles.restaurantCard, { backgroundColor: lightTheme.colors.tabBar }]}
      onPress={() => router.push({ pathname: `/screens/${item._id}`, params: { origin: 'ai_recs' } })}
    >
      <Image source={{ uri: item.images?.[0] || 'https://via.placeholder.com/150' }} style={styles.restaurantImage} />
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => {
          const userId = auth.currentUser?.uid;
          if (userId) {
            const isAlreadyFavorite = favoriteIds.includes(item._id);
            toggleFavorite(item._id, userId);

            Toast.show({
              type: 'success',
              text1: isAlreadyFavorite ? 'Removed from Favorites' : 'Added to Favorites',
              visibilityTime: 2000,
              props: {
                borderLeftColor: lightTheme.colors.primary,
              },
            });
          } else {
            console.log('User not logged in! Cannot favorite.');
          }
        }}
      >
        <Ionicons
          name={favoriteIds.includes(item._id) ? 'heart' : 'heart-outline'}
          size={24}
          color={favoriteIds.includes(item._id) ? lightTheme.colors.primary : 'white'}
        />
      </TouchableOpacity>

      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={[styles.restaurantName, { color: lightTheme.colors.text }]}>{item.name}</Text>
          <View style={[styles.ratingContainer, { backgroundColor: lightTheme.colors.background }]}>
            <Ionicons name="star" size={16} color={lightTheme.colors.primary} />
            <Text style={[styles.rating, { color: lightTheme.colors.text }]}>{item.rating.toFixed(1)}</Text>
          </View>
        </View>
        <Text style={[styles.cuisineText, { color: lightTheme.colors.tabIconInactive }]}>{item.cuisine}</Text>
        <View style={styles.restaurantMeta}>
          <Text style={[styles.priceText, { color: lightTheme.colors.tabIconInactive }]}>{item.price}</Text>
          <Text style={[styles.dotSeparator, { color: lightTheme.colors.tabIconInactive }]}>•</Text>
          <Text style={[styles.distanceText, { color: lightTheme.colors.tabIconInactive }]}>{item.distance}</Text>
        </View>
        <Text style={[styles.matchReason, { color: lightTheme.colors.text }]}>Why it matches: {item.matchReason}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = (item: any) => (
    <View key={`message-${item.id}`} style={styles.messageContainer}>
      <View style={[
        styles.messageBubble,
        item.isUser ? [styles.userBubble, { backgroundColor: lightTheme.colors.primary }] : [styles.aiBubble, { backgroundColor: lightTheme.colors.tabBar }]
      ]}>
        <Text style={[styles.messageText, item.isUser ? styles.userMessageText : { color: lightTheme.colors.text }]}>
          {item.text}
        </Text>
      </View>

      {item.recommendations && (
        <FlatList
          data={item.recommendations}
          renderItem={renderRestaurant}
          keyExtractor={(restaurant) => restaurant._id}
          scrollEnabled={false}
          style={styles.recommendationsContainer}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatContainer} keyboardShouldPersistTaps="handled">
        {/* Header Top Branding */}
        <View style={styles.headerContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="restaurant" size={32} color={lightTheme.colors.primary} />
          </View>
          <Text style={styles.headerTitle}>Feastr AI Recommendations</Text>
          <Text style={styles.headerSubtitle}>Discover your next meal</Text>
        </View>

        {messages.map(renderMessageItem)}
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: lightTheme.colors.tabBar }]}>
            <ActivityIndicator color={lightTheme.colors.primary} />
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: lightTheme.colors.tabBar }]}>
        <TextInput
          style={[styles.input, { color: lightTheme.colors.text }]}
          placeholder="Describe your perfect dining experience..."
          placeholderTextColor={lightTheme.colors.tabIconInactive}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: lightTheme.colors.primary, opacity: inputText.trim() ? 1 : 0.6 }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  headerContainer: { alignItems: 'center', marginBottom: 24, marginTop: 12 },
  logoCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'white', borderWidth: 2, borderColor: lightTheme.colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: lightTheme.colors.primary },
  headerSubtitle: { fontSize: 14, color: lightTheme.colors.tabIconInactive, marginTop: 4 },
  chatContainer: { padding: 16, paddingBottom: 100 },
  messageContainer: { marginBottom: 16 },
  messageBubble: { maxWidth: '80%', borderRadius: 16, padding: 12 },
  userBubble: { alignSelf: 'flex-end', marginLeft: '20%', marginBottom: 8, backgroundColor: lightTheme.colors.primary },
  aiBubble: { alignSelf: 'flex-start', marginRight: '20%', marginBottom: 8, backgroundColor: lightTheme.colors.tabBar },
  messageText: { fontSize: 16, lineHeight: 22 },
  userMessageText: { color: '#fff' },
  recommendationsContainer: { marginTop: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', padding: 12, position: 'absolute', bottom: 0, left: 0, right: 0, borderTopWidth: 1, borderTopColor: lightTheme.colors.tabIconInactive, backgroundColor: lightTheme.colors.tabBar },
  input: { flex: 1, backgroundColor: lightTheme.colors.background, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 10, marginRight: 8, fontSize: 16, maxHeight: 100, minHeight: 40 },
  sendButton: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', backgroundColor: lightTheme.colors.primary },
  restaurantCard: { borderRadius: 12, marginVertical: 8, overflow: 'hidden' },
  restaurantImage: { width: '100%', height: 180 },
  favoriteButton: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 20, zIndex: 10 },
  restaurantInfo: { padding: 12 },
  restaurantHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  restaurantName: { fontSize: 18, fontWeight: 'bold' },
  ratingContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  rating: { marginLeft: 4, fontSize: 14, fontWeight: '600' },
  cuisineText: { fontSize: 14, marginBottom: 4 },
  restaurantMeta: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  priceText: { fontSize: 14 },
  dotSeparator: { marginHorizontal: 6 },
  distanceText: { fontSize: 14 },
  matchReason: { fontSize: 14, marginTop: 8, fontStyle: 'italic' },
});
