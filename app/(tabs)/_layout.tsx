import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  const { colours } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colours.primary,
        tabBarInactiveTintColor: colours.textMuted,
        tabBarStyle: {
          backgroundColor: colours.surface,
          borderTopColor: colours.border,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
     <Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    tabBarIcon: ({ color }) => (
      <Ionicons name="home-outline" size={22} color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="profile"
  options={{
    title: 'Profile',
    tabBarIcon: ({ color }) => (
      <Ionicons name="person-outline" size={22} color={color} />
    ),
  }}
/>

<Tabs.Screen
  name="insights"
  options={{
    title: 'Insights',
    tabBarIcon: ({ color }) => (
      <Ionicons name="stats-chart-outline" size={22} color={color} />
    ),
  }}
/>
      <Tabs.Screen
  name="categories"
  options={{
    title: 'Categories',
    tabBarIcon: ({ color }) => (
      <Ionicons name="grid-outline" size={22} color={color} />
    ),
  }}
/>
    
    </Tabs>
  );
}

function TabIcon({ icon, color }: { icon: string; color: string }) {
  return <Text style={{ fontSize: 22, color }}>{icon}</Text>;
}