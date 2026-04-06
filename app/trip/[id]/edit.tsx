import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View,
} from 'react-native';

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [name, setName]               = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate]     = useState('');
  const [endDate, setEndDate]         = useState('');
  const [notes, setNotes]             = useState('');
  const { colours } = useTheme();

  const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colours.background },
  content: { padding: 20, gap: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 8, paddingTop: 50,
  },
  cancel: { fontSize: 16, color: colours.textSecondary },
  title:  { fontSize: 18, fontWeight: '700', color: colours.textPrimary },
  save:   { fontSize: 16, fontWeight: '700', color: colours.primary },
  saveDisabled: { color: colours.textMuted },
  field:  { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: colours.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  input: { backgroundColor: colours.surface, borderWidth: 1, borderColor: colours.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colours.textPrimary },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
});

  useEffect(() => {
    async function load() {
      const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, Number(id)));
      if (trip) {
        setName(trip.name);
        setDestination(trip.destination);
        setStartDate(trip.startDate);
        setEndDate(trip.endDate);
        setNotes(trip.notes ?? '');
      }
    }
    load();
  }, [id]);

  async function handleSave() {
    if (!name.trim() || !destination.trim() || !startDate || !endDate) {
      Alert.alert('Missing fields', 'Please fill in all required fields.');
      return;
    }
    await db.update(tripsTable).set({
      name: name.trim(),
      destination: destination.trim(),
      startDate,
      endDate,
      notes: notes.trim() || null,
    }).where(eq(tripsTable.id, Number(id)));
    router.back();
  }

  const canSave = name.trim() && destination.trim() && startDate && endDate;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Trip</Text>
          <TouchableOpacity onPress={handleSave} disabled={!canSave}>
            <Text style={[styles.save, !canSave && styles.saveDisabled]}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Trip name <Text style={{color: colours.error}}>*</Text></Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} accessibilityLabel="Trip name" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Destination <Text style={{color: colours.error}}>*</Text></Text>
          <TextInput style={styles.input} value={destination} onChangeText={setDestination} accessibilityLabel="Destination" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Start date (YYYY-MM-DD) <Text style={{color: colours.error}}>*</Text></Text>
          <TextInput style={styles.input} value={startDate} onChangeText={setStartDate} keyboardType="numeric" accessibilityLabel="Start date" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>End date (YYYY-MM-DD) <Text style={{color: colours.error}}>*</Text></Text>
          <TextInput style={styles.input} value={endDate} onChangeText={setEndDate} keyboardType="numeric" accessibilityLabel="End date" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} accessibilityLabel="Notes" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

