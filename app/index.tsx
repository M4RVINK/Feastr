import React, { useEffect, useState } from 'react'; 
import { View, Text, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const SplashScreen = () => {
  const [fadeAnim] = useState(new Animated.Value(0)); // Initial opacity set to 0
  const [scaleAnim] = useState(new Animated.Value(0.8)); // Initial scale set to 0.8
  
  useEffect(() => {
    // Fade in and scale animation
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    
    const timer = setTimeout(() => {
      router.push('/screens/splash'); 
    }, 3000); // 3 seconds

    // Clear the timeout if the component unmounts before the timer completes
    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={['#1ABC9C', '#7B3FCC']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Animated.View style={[styles.logoCircle, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              <Ionicons name="restaurant" size={32} color="#1ABC9C" />
            </Animated.View>
            <Animated.Text style={[styles.title, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
              Feastr
            </Animated.Text>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
});
