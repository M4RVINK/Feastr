// app/(tabs)/profile.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../config/firebase';
import { Config } from '../../config/config';
import { lightTheme } from '../../../useTheme';
import { Ionicons } from '@expo/vector-icons';


export default function ProfileScreen() {
  const [fullName, setFullName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const profileOptions = [
    'Order History', 
    'Favorite Restaurants', 
    'Payment Methods', 
    'Settings', 
    'Help Center', 
    'Log Out'
  ];

  useEffect(() => {
    const fetchUserProfile = async () => {
      const userId = auth.currentUser?.uid;
      if (!userId) return;

      try {
        const response = await fetch(`${Config.API_URL}/api/users/${userId}`);
        const userData = await response.json();
        setFullName(userData.fullName);
        setEmail(userData.email);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImage}>
          <Ionicons name="person-outline" size={50} color="#000" />
        </View>
        <Text style={[styles.name, { color: lightTheme.colors.text }]}>
          {fullName || 'Unknown User'}
        </Text>
        <Text style={[styles.email, { color: lightTheme.colors.text }]}>
          {email || 'No Email'}
        </Text>
      </View>


      {/* Profile Options */}
      <View style={styles.optionsContainer}>
        {profileOptions.map((option) => (
          <TouchableOpacity 
            key={option}
            style={[styles.optionButton, { borderBottomColor: 'rgba(151, 71, 255, 0.2)' }]}
            onPress={async () => {
              if (option === 'Favorite Restaurants') {
                router.push('/screens/favoriteRestaurants');
              } else if (option === 'Log Out') {
                try {
                  await signOut(auth);
                  router.replace('/'); // Go back to login page after logout
                } catch (error) {
                  console.error('Error signing out:', error);
                }
              }
              // Other options can be added later
            }}
          >
            <Text style={[styles.optionText, { color: lightTheme.colors.text }]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center'
  },
  container: {
    flex: 1,
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: lightTheme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
  },
  optionsContainer: {
    marginTop: 20,
  },
  optionButton: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  optionText: {
    fontSize: 16,
  },
});
