import React, { useState, useRef, useEffect } from 'react';
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
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { lightTheme } from '../../../useTheme';

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  price: string;
  distance: string;
  imageUrl: string;
  description: string;
  matchReason: string;
};

type Message = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  recommendations?: Restaurant[];
};

const AIRecsScreen = () => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your AI food guide. Tell me what you're craving or describe your perfect dining experience!",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    Keyboard.dismiss();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    const mockRecommendations: Restaurant[] = [
      {
        id: '1',
        name: 'Ocean View Bar & Grill',
        cuisine: 'Seafood',
        rating: 4.7,
        price: '$$$',
        distance: '0.8 mi',
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4',
        description: 'Stunning sea views with extensive seafood menu',
        matchReason: 'Perfect for groups with sea views and shrimp dishes'
      },
      {
        id: '2',
        name: 'The Coastal Taproom',
        cuisine: 'American',
        rating: 4.5,
        price: '$$',
        distance: '1.2 mi',
        imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5',
        description: 'Craft beer bar with oceanfront patio',
        matchReason: 'Cozy spot with great beer selection and seafood snacks'
      }
    ];

    // Add AI response
    const aiResponse: Message = {
      id: Date.now().toString(),
      text: `Based on your request for "${inputText}", I found these great options:`,
      isUser: false,
      timestamp: new Date(),
      recommendations: mockRecommendations
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsLoading(false);
  };

  const renderRestaurant = ({ item }: { item: Restaurant }) => (
    <View key={`restaurant-${item.id}`} style={[styles.restaurantCard, { backgroundColor: lightTheme.colors.tabBar }]}>
      <Image source={{ uri: item.imageUrl }} style={styles.restaurantImage} />
      <View style={styles.restaurantInfo}>
        <View style={styles.restaurantHeader}>
          <Text style={[styles.restaurantName, { color: lightTheme.colors.text }]}>{item.name}</Text>
          <View style={[styles.ratingContainer, { backgroundColor: lightTheme.colors.background }]}>
            <Ionicons name="star" size={16} color={lightTheme.colors.primary} />
            <Text style={[styles.rating, { color: lightTheme.colors.text }]}>{item.rating}</Text>
          </View>
        </View>
        <Text style={[styles.cuisineText, { color: lightTheme.colors.tabIconInactive }]}>{item.cuisine}</Text>
        <View style={styles.restaurantMeta}>
          <Text style={[styles.priceText, { color: lightTheme.colors.tabIconInactive }]}>{item.price}</Text>
          <Text style={[styles.dotSeparator, { color: lightTheme.colors.tabIconInactive }]}>•</Text>
          <Text style={[styles.distanceText, { color: lightTheme.colors.tabIconInactive }]}>{item.distance}</Text>
        </View>
        <Text style={[styles.matchReason, { color: lightTheme.colors.text }]}>
          <Text style={{ fontWeight: 'bold' }}>Why it matches: </Text>
          {item.matchReason}
        </Text>
      </View>
    </View>
  );

  const renderMessageItem = (item: Message) => (
    <View key={`message-${item.id}`} style={styles.messageContainer}>
      <View style={[
        styles.messageBubble,
        item.isUser 
          ? [styles.userBubble, { backgroundColor: lightTheme.colors.primary }]
          : [styles.aiBubble, { backgroundColor: lightTheme.colors.tabBar }]
      ]}>
        <Text style={[
          styles.messageText,
          item.isUser ? styles.userMessageText : { color: lightTheme.colors.text }
        ]}>
          {item.text}
        </Text>
      </View>
      
      {item.recommendations && (
        <FlatList
          data={item.recommendations}
          renderItem={renderRestaurant}
          keyExtractor={(restaurant) => restaurant.id}
          scrollEnabled={false}
          style={styles.recommendationsContainer}
        />
      )}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      {/* Messages grow from top */}
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.chatContainer}
        keyboardShouldPersistTaps="handled"
        // Disable auto-scrolling to maintain position
      >
        {messages.map(renderMessageItem)}
        
        {isLoading && (
          <View style={[styles.messageBubble, styles.aiBubble, { backgroundColor: lightTheme.colors.tabBar }]}>
            <ActivityIndicator color={lightTheme.colors.primary} />
          </View>
        )}
      </ScrollView>

      {/* Fixed input at bottom */}
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
          style={[styles.sendButton, { 
            backgroundColor: lightTheme.colors.primary,
            opacity: inputText.trim() ? 1 : 0.6
          }]}
          onPress={handleSend}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  chatContainer: {
    padding: 16,
    paddingBottom: 100, // Space for input
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    alignSelf: 'flex-end',
    marginLeft: '20%',
    marginBottom: 8,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    marginRight: '20%',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#fff',
  },
  recommendationsContainer: {
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: lightTheme.colors.tabIconInactive,
  },
  input: {
    flex: 1,
    backgroundColor: lightTheme.colors.background,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 120,
    minHeight: 48,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  restaurantCard: {
    borderRadius: 12,
    marginVertical: 8,
    overflow: 'hidden',
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
  cuisineText: {
    fontSize: 14,
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceText: {
    fontSize: 14,
  },
  dotSeparator: {
    marginHorizontal: 6,
  },
  distanceText: {
    fontSize: 14,
  },
  matchReason: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default AIRecsScreen;