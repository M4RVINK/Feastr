// app/(tabs)/menu_builder.tsx
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { lightTheme } from '../../../useTheme';

export default function MenuBuilderScreen() {
  const menuCategories = [
    'Breakfast', 'Lunch', 'Dinner', 'Drinks', 'Desserts'
  ];

  return (
    <View style={[styles.container, { backgroundColor: lightTheme.colors.background }]}>
      <Text style={[styles.title, { color: lightTheme.colors.text }]}>Build Your Menu</Text>
      
      <View style={styles.categoriesContainer}>
        {menuCategories.map((category) => (
          <TouchableOpacity 
            key={category} 
            style={[styles.categoryButton, { backgroundColor: 'rgba(151, 71, 255, 0.1)' }]}
          >
            <Text style={[styles.categoryText, { color: lightTheme.colors.text }]}>{category}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <TouchableOpacity style={[styles.createButton, { backgroundColor: lightTheme.colors.primary }]}>
        <Text style={styles.createButtonText}>Create Custom Dish</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '500',
  },
  createButton: {
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});