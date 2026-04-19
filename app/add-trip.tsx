import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { tripsTable, usersTable } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView, Platform,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';

// check if date is valid (YYYY-MM-DD)
function isValidDate(date: string) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;

  const [year, month, day] = date.split('-').map(Number);
  const d = new Date(year, month - 1, day);

  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

export default function AddTripScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const { colours } = useTheme();

  
  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colours.background },
    content: { padding: 20, gap: 20 },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
      paddingTop: 50,
    },

    cancel: { fontSize: 16, color: colours.textSecondary },
    title: { fontSize: 18, fontWeight: '700', color: colours.textPrimary },
    save: { fontSize: 16, fontWeight: '700', color: colours.primary },
    saveDisabled: { color: colours.textMuted },

    field: { gap: 6 },

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
      borderRadius: 6,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colours.textPrimary,
    },

    textarea: {
      height: 90,
      textAlignVertical: 'top',
      paddingTop: 12,
    },
  });

  // create a new trip
  async function handleSave() {
    if (!name.trim() || !destination.trim() || !startDate || !endDate) {
      Alert.alert('Missing fields', 'Please fill in name, destination, and dates.');
      return;
    }

    // validate both dates
  if (!isValidDate(startDate) || !isValidDate(endDate)) {
    Alert.alert('Invalid date', 'Use format YYYY-MM-DD (e.g. 2026-06-12)');
    return;
  }

  // check date order
  if (endDate < startDate) {
    Alert.alert('Invalid dates', 'End date must be after start date');
    return;
  }
    // get logged in user
    const token = await AsyncStorage.getItem('sessionToken');
if (!token) return;
const [authedUser] = await db.select().from(usersTable).where(eq(usersTable.sessionToken, token));
const userId = authedUser?.id;

if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }
// check for overlapping trips
const existingTrips = await db.select().from(tripsTable).where(eq(tripsTable.userId, userId));

const hasOverlap = existingTrips.some(t => startDate <= t.endDate && endDate >= t.startDate);

if (hasOverlap) {
  Alert.alert(
    'Date conflict',
    'You already have a trip during those dates. Please choose different dates.'
  );
  return;
}
     // save trip to database
    await db.insert(tripsTable).values({
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      coverColour: colours.primary,
      notes: notes.trim() || null,
      userId: Number(userId),
      createdAt: new Date().toISOString(),
    });

    router.back();
  }

  const canSave = name.trim() && destination.trim() && startDate && endDate;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* header with cancel and save */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.title}>New Trip</Text>

          <TouchableOpacity onPress={handleSave} disabled={!canSave}>
            <Text style={[styles.save, !canSave && styles.saveDisabled]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* trip form */}
        <Field label="Trip name" required styles={styles} colours={colours}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Summer in Lisbon"
            placeholderTextColor={colours.textMuted}
            value={name}
            onChangeText={setName}
          />
        </Field>

        <Field label="Destination" required styles={styles} colours={colours}>
          <TextInput
            style={styles.input}
            placeholder="e.g. Lisbon, Portugal"
            placeholderTextColor={colours.textMuted}
            value={destination}
            onChangeText={setDestination}
          />
        </Field>

        <Field label="Start date (YYYY-MM-DD)" required styles={styles} colours={colours}>
          <TextInput
            style={styles.input}
            placeholder="2026-07-01"
            placeholderTextColor={colours.textMuted}
            value={startDate}
            onChangeText={setStartDate}
      
          />
        </Field>

        <Field label="End date (YYYY-MM-DD)" required styles={styles} colours={colours}>
          <TextInput
            style={styles.input}
            placeholder="2026-07-10"
            placeholderTextColor={colours.textMuted}
            value={endDate}
            onChangeText={setEndDate}
          />
        </Field>

        <Field label="Notes (optional)" styles={styles} colours={colours}>
          <TextInput
            style={[styles.input, styles.textarea]}
            placeholder="Anything to remember..."
            placeholderTextColor={colours.textMuted}
            value={notes}
            onChangeText={setNotes}
            multiline
          />
        </Field>

      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// reusable form field 
function Field({
  label,
  required,
  children,
  styles,
  colours
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  styles: any;
  colours: any;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={{ color: colours.error }}> *</Text>}
      </Text>
      {children}
    </View>
  );
}