import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { seedIfEmpty } from '@/db/seed';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, LogBox, Platform, StyleSheet, Text, View } from 'react-native';

LogBox.ignoreLogs(['expo-notifications: Android Push']);

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}


function AppContent() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const { colours } = useTheme();

  const floatAnim = useRef(new Animated.Value(0)).current;

  
  const styles = StyleSheet.create({
    loading: {
      flex: 1,
      backgroundColor: colours.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 12,
    },
    loadingText: {
      fontSize: 16,
      color: colours.textSecondary,
      fontStyle: 'italic',
    },
  });

  useEffect(() => {
    // floating animation for loading icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    async function init() {
  try {
     if (Platform.OS === 'android') {                          // ← ADD THESE 5 LINES
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
          });
        } 
    seedIfEmpty().catch(console.log);
    const token = await AsyncStorage.getItem('sessionToken');
    setLoggedIn(!!token);
  } catch (e) {
    console.log('Init error:', e);
  } finally {
    setReady(true);
  }
}
    init();
  }, []);

  // show loading screen while app is loading
  if (!ready) {
    return (
      <View style={styles.loading}>
        <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
          <Ionicons name="briefcase-outline" size={48} color={colours.primary} />
        </Animated.View>
        <Text style={styles.loadingText}>Packing your bags...</Text>
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      initialRouteName={loggedIn ? '(tabs)' : 'login'}
    >
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add-trip" options={{ presentation: 'modal' }} />
      <Stack.Screen name="trip/[id]" />
      <Stack.Screen name="trip/[id]/edit" options={{ presentation: 'modal' }} />
      <Stack.Screen name="trip/[id]/add-activity" options={{ presentation: 'modal' }} />
      <Stack.Screen name="trip/[id]/edit-activity" options={{ presentation: 'modal' }} />
    </Stack>
  );
}