import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  // get colours from the theme so everything matches
  const { colours } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // colours for the tab icons/text
        tabBarActiveTintColor: colours.primary,
        tabBarInactiveTintColor: colours.textMuted,
        // background and border of the tab bar
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
       {/* main home screen */}
     <Tabs.Screen
  name="index"
  options={{
    title: 'Home',
    tabBarIcon: ({ color }) => (
      <Ionicons name="home-outline" size={22} color={color} />
    ),
  }}
/>

{/* user profile page */}
<Tabs.Screen
  name="profile"
  options={{
    title: 'Profile',
    tabBarIcon: ({ color }) => (
      <Ionicons name="person-outline" size={22} color={color} />
    ),
  }}
/>
{/* stats and insights screen */}
<Tabs.Screen
  name="insights"
  options={{
    title: 'Insights',
    tabBarIcon: ({ color }) => (
      <Ionicons name="stats-chart-outline" size={22} color={color} />
    ),
  }}
/>
      {/* where items are grouped into categories */}
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