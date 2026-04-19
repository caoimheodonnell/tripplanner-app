import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { usersTable } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert, Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

export default function LoginScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { colours } = useTheme();

  
  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colours.background },

    content: {
      padding: 32,
      gap: 16,
      paddingTop: 80,
    },

    logo: {
      fontSize: 32,
      fontWeight: '900',
      color: colours.textPrimary,
      textAlign: 'center',
    },

    tagline: {
      fontSize: 14,
      color: colours.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },

    toggleRow: {
      flexDirection: 'row',
      backgroundColor: colours.surface,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colours.border,
      overflow: 'hidden',
      marginBottom: 8,
    },

    toggleBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
    },

    toggleActive: {
      backgroundColor: colours.primary,
    },

    toggleText: {
      fontWeight: '600',
      color: colours.textSecondary,
      fontSize: 15,
    },

    toggleTextActive: {
      color: '#fff',
    },

    field: {
      gap: 6,
    },

    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colours.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },

    input: {
      backgroundColor: colours.surface,
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colours.textPrimary,
    },

    button: {
      backgroundColor: colours.primary,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: 'center',
      marginTop: 8,
    },

    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: 16,
    },
  });

  // log user in
  async function handleLogin() {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Missing fields', 'Please enter your email and password.');
    return;
  }
  try {
    const [user] = await db.select().from(usersTable)
      .where(eq(usersTable.email, email.trim().toLowerCase()));

    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    if (!user || user.password !== hashedPassword) {
      Alert.alert('Login failed', 'Email or password is incorrect.');
      return;
    }

    const token = Math.random().toString(36).slice(2) + Date.now().toString(36);
    await db.update(usersTable)
      .set({ sessionToken: token })
      .where(eq(usersTable.id, user.id));

    await AsyncStorage.setItem('sessionToken', token);
    router.replace('/(tabs)');
  } catch (e) {
    console.log('Login error:', e);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
}

async function handleRegister() {
  if (!name.trim() || !email.trim() || !password.trim()) {
    Alert.alert('Missing fields', 'Please fill in all fields.');
    return;
  }
  try {
    const existing = await db.select().from(usersTable)
      .where(eq(usersTable.email, email.trim().toLowerCase()));
    if (existing.length > 0) {
      Alert.alert('Already registered', 'An account with that email already exists.');
      return;
    }

    const hashedPassword = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    await db.insert(usersTable).values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    });
    Alert.alert('Account created!', 'You can now log in.');
    setMode('login');
  } catch (e) {
    console.log('Register error:', e);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
}
  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* app logo */}
<Image
  source={require('../assets/images/Trip Planner.png')}
  style={{
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 10,
  }}
  resizeMode="contain"
/>

<Text style={styles.logo}>Trip Planner</Text>
        <Text style={styles.tagline}>Plan your adventures</Text>

        {/* login or register switch */}
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'login' && styles.toggleActive]}
            onPress={() => setMode('login')}
          >
            <Text style={[styles.toggleText, mode === 'login' && styles.toggleTextActive]}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, mode === 'register' && styles.toggleActive]}
            onPress={() => setMode('register')}
          >
            <Text style={[styles.toggleText, mode === 'register' && styles.toggleTextActive]}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* name input - register only */}
        {mode === 'register' && (
          <View style={styles.field}>
            <Text style={styles.label}>Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName}
              placeholder="Your name" placeholderTextColor={colours.textMuted}
              accessibilityLabel="Name" />
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail}
            placeholder="you@email.com" placeholderTextColor={colours.textMuted}
            keyboardType="email-address" autoCapitalize="none"
            accessibilityLabel="Email" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Password</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword}
            placeholder="Password" placeholderTextColor={colours.textMuted}
            secureTextEntry accessibilityLabel="Password" />
        </View>

        {/* submit button */}
        <TouchableOpacity
          style={styles.button}
          onPress={mode === 'login' ? handleLogin : handleRegister}
          accessibilityRole="button"
          accessibilityLabel={mode === 'login' ? 'Log in' : 'Create account'}
        >
          <Text style={styles.buttonText}>
            {mode === 'login' ? 'Log In' : 'Create Account'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

