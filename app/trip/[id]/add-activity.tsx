import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable, usersTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

type Category = { id: number; name: string; colour: string; icon: string };

export default function AddActivityScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [name, setName]           = useState('');
  const [date, setDate]           = useState('');
  const [duration, setDuration]   = useState('');
  const [notes, setNotes]         = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
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
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: { backgroundColor: colours.surface, borderWidth: 1, borderColor: colours.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  catPillText: { fontSize: 13, fontWeight: '600', color: colours.textPrimary },
  categoryChip: {
  backgroundColor: colours.surface,
  borderWidth: 1,
  borderColor: colours.border,
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 8,
},

categoryContent: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
},

categoryText: {
  fontSize: 13,
  fontWeight: '600',
  color: colours.textPrimary,
},
});

  useEffect(() => {
    async function load() {
      const cats = await db.select().from(categoriesTable);
      setCategories(cats);
      if (cats.length > 0) setSelectedCat(cats[0].id);
    }
    load();
  }, []);

 // save activity
async function handleSave() {
  if (!name.trim() || !date || !selectedCat) {
    Alert.alert('Missing fields', 'Please fill in name, date and category.');
    return;
  }

  // get user from token
  const token = await AsyncStorage.getItem('sessionToken');
  if (!token) {
    Alert.alert('Error', 'Not logged in.');
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.sessionToken, token));

  const userId = user?.id;

  if (!userId) {
    Alert.alert('Error', 'User not found.');
    return;
  }

  await db.insert(activitiesTable).values({
    tripId: Number(id),
    userId, // correct now
    categoryId: selectedCat,
    name: name.trim(),
    date,
    durationMinutes: duration ? Number(duration) : null,
    notes: notes.trim() || null,
    createdAt: new Date().toISOString(),
  });

  router.back(); // go back
}

  const canSave = name.trim() && date && selectedCat;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Add Activity</Text>
          <TouchableOpacity onPress={handleSave} disabled={!canSave}>
            <Text style={[styles.save, !canSave && styles.saveDisabled]}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Activity name <Text style={{color: colours.error}}>*</Text></Text>
          <TextInput style={styles.input} placeholder="e.g. Visit the Louvre" placeholderTextColor={colours.textMuted} value={name} onChangeText={setName} accessibilityLabel="Activity name" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Date (YYYY-MM-DD) <Text style={{color: colours.error}}>*</Text></Text>
          <TextInput style={styles.input} placeholder="2026-06-12" placeholderTextColor={colours.textMuted} value={date} onChangeText={setDate} keyboardType="numeric" accessibilityLabel="Date" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Category <Text style={{color: colours.error}}>*</Text></Text>
          <View style={styles.catRow}>
  {categories.map(cat => {
    const selected = selectedCat === cat.id;

    return (
      <TouchableOpacity
        key={cat.id}
        onPress={() => setSelectedCat(cat.id)}
        style={[
          styles.categoryChip,
          selected && {
            backgroundColor: cat.colour,
            borderColor: cat.colour,
          },
        ]}
      >
        <View style={styles.categoryContent}>
          <Ionicons
            name={cat.icon as any}
            size={16}
            color={selected ? '#fff' : colours.textPrimary}
          />
          <Text
            style={[
              styles.categoryText,
              selected && { color: '#fff' },
            ]}
          >
            {cat.name}
          </Text>
        </View>
      </TouchableOpacity>
    );
  })}
</View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput style={styles.input} placeholder="e.g. 90" placeholderTextColor={colours.textMuted} value={duration} onChangeText={setDuration} keyboardType="numeric" accessibilityLabel="Duration in minutes" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput style={[styles.input, styles.textarea]} placeholder="Anything to remember..." placeholderTextColor={colours.textMuted} value={notes} onChangeText={setNotes} multiline numberOfLines={3} accessibilityLabel="Notes" />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

