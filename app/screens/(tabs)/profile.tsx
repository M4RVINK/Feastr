// app/(tabs)/profile.tsx
import { View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { lightTheme } from '../../../useTheme';

export default function ProfileScreen() {
  const profileOptions = [
    'Order History', 'Saved Items', 'Payment Methods', 
    'Settings', 'Help Center', 'Log Out'
  ];

  return (
    <View style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: 'https://placehold.co/200x200/9747FF/FFFFFF/png?text=BK' }} 
          style={styles.profileImage}
        />
        <Text style={[styles.name, { color: lightTheme.colors.text }]}>Brian Kazzi</Text>
        <Text style={[styles.email, { color: lightTheme.colors.text }]}>briankazzi@gmail.com</Text>
      </View>
      
      <View style={styles.optionsContainer}>
        {profileOptions.map((option) => (
          <TouchableOpacity 
            key={option} 
            style={[styles.optionButton, { borderBottomColor: 'rgba(151, 71, 255, 0.2)' }]}
          >
            <Text style={[styles.optionText, { color: lightTheme.colors.text }]}>{option}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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