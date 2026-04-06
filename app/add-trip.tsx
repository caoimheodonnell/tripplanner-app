import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

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

  async function handleSave() {
    if (!name.trim() || !destination.trim() || !startDate || !endDate) {
      Alert.alert('Missing fields', 'Please fill in name, destination, and dates.');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');

    if (!userId) {
      Alert.alert('Error', 'User not logged in');
      return;
    }

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
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        {/* Header */}
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

        {/* Form */}
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
            placeholder="2025-07-01"
            placeholderTextColor={colours.textMuted}
            value={startDate}
            onChangeText={setStartDate}
            keyboardType="numeric"
          />
        </Field>

        <Field label="End date (YYYY-MM-DD)" required styles={styles} colours={colours}>
          <TextInput
            style={styles.input}
            placeholder="2025-07-10"
            placeholderTextColor={colours.textMuted}
            value={endDate}
            onChangeText={setEndDate}
            keyboardType="numeric"
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
    </SafeAreaView>
  );
}


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