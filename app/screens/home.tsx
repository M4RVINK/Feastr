import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { auth } from '../config/firebase';
import axios from 'axios';
import { Config } from '../../app/config/config';
import { Ionicons } from '@expo/vector-icons';
import { useFavoriteStore } from '../stores/favoriteStore';
import { useAIRecStore } from '../stores/aiRecStore';

const HomeScreen = () => {
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial opacity: 0
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Initial scale: 0.8
  const user = auth.currentUser;
  const { fetchFavorites } = useFavoriteStore();
  const { resetStore } = useAIRecStore.getState();

  useEffect(() => {
    const fetchFullName = async () => {
      if (user?.uid) {
        try {
          const response = await axios.get(
            `${Config.API_URL}/api/users/${user.uid}`
          );
          setFullName(response.data.fullName);
          await fetchFavorites(user.uid);

          // Set AI Rec user id
          const { setUserId } = useAIRecStore.getState();
          setUserId(user.uid);
          resetStore(`Hi ${response.data.fullName}! I'm your AI food guide. Tell me what you're craving or describe your perfect dining experience!`);
        } catch (error) {
          console.error('Error fetching user data:', error);
          setFullName(null);
        } finally {
          setLoading(false);
          // Trigger welcome animation
          setShowWelcome(true);
          Animated.parallel([
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 800,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 800,
              easing: Easing.out(Easing.back(1.2)),
              useNativeDriver: true,
            })
          ]).start();
          
          // Redirect after 3 seconds
          setTimeout(() => {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 500,
              useNativeDriver: true,
            }).start(() => router.push('/screens/(tabs)/discover'));
          }, 1500);
        }
      } else {
        setLoading(false);
        router.push('/');
      }
    };

    fetchFullName();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#1ABC9C" />
        <Text>Loading your profile...</Text>
      </View>
    );
  }

  if (showWelcome) {
    return (
      <View style={styles.welcomeContainer}>
        <Animated.View 
          style={[
            styles.animatedContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.logoCircle}>
            <Ionicons name="restaurant" size={32} color="#1ABC9C" />
          </View>
          <Text style={styles.welcomeText}>
            Welcome, {fullName || user?.email || 'Guest'} !
          </Text>
        </Animated.View>
      </View>
    );
  }

  return null;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  welcomeContainer: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  animatedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#1ABC9C',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  button: {
    backgroundColor: '#1ABC9C',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;