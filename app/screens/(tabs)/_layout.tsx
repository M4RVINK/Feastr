// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { lightTheme } from '../../../useTheme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: lightTheme.colors.primary,
        tabBarInactiveTintColor: lightTheme.colors.tabIconInactive,
        tabBarStyle: {
          backgroundColor: lightTheme.colors.tabBar,
          height: 80,
          paddingTop: 8,
          paddingBottom: 24,
          borderTopWidth: 0,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="ai_recs"
        options={{
          title: 'For You',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="robot" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="compass" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="rating_builder"
        options={{
          title: 'Menu Builder',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="chef-hat" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="account" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}