import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
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

type Category = { id: number; name: string; colour: string; icon: string };

export default function EditActivityScreen() {
  const { id, activityId } = useLocalSearchParams<{ id: string; activityId: string }>();
  const router = useRouter();
  const [name, setName]         = useState('');
  const [date, setDate]         = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes]       = useState('');
  const [categories, setCategories]   = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const { colours } = useTheme();

  const styles = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: colours.background },
  content: { padding: 20, gap: 20 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, paddingTop: 50 },
  cancel:  { fontSize: 16, color: colours.textSecondary },
  title:   { fontSize: 18, fontWeight: '700', color: colours.textPrimary },
  save:    { fontSize: 16, fontWeight: '700', color: colours.primary },
  field:   { gap: 6 },
  label:   { fontSize: 13, fontWeight: '600', color: colours.textSecondary, textTransform: 'uppercase', letterSpacing: 0.4 },
  input:   { backgroundColor: colours.surface, borderWidth: 1, borderColor: colours.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: colours.textPrimary },
  textarea: { height: 90, textAlignVertical: 'top', paddingTop: 12 },
  catRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catPill: { backgroundColor: colours.surface, borderWidth: 1, borderColor: colours.border, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8 },
  catPillText: { fontSize: 13, fontWeight: '600', color: colours.textPrimary },
  deleteBtn: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  deleteBtnText: { color: '#7F1D1D', fontWeight: '700', fontSize: 15 },
});

  useEffect(() => {
    async function load() {
      // load categories
      const cats = await db.select().from(categoriesTable);
      setCategories(cats);
      // load activity details
      const [act] = await db.select().from(activitiesTable)
        .where(eq(activitiesTable.id, Number(activityId)));

        // fill form with existing data
      if (act) {
        setName(act.name);
        setDate(act.date);
        setDuration(act.durationMinutes?.toString() ?? '');
        setNotes(act.notes ?? '');
        setSelectedCat(act.categoryId);
      }
    }
    load();
  }, [activityId]);

  // save changes to activity
  async function handleSave() {
    if (!name.trim() || !date || !selectedCat) {
      Alert.alert('Missing fields', 'Please fill in name, date and category.');
      return;
    }
     // validate date
  if (!isValidDate(date)) {
    Alert.alert('Invalid date', 'Use format YYYY-MM-DD (e.g. 2026-06-12)');
    return;
  }
    await db.update(activitiesTable).set({
      name: name.trim(), date,
      durationMinutes: duration ? Number(duration) : null,
      categoryId: selectedCat,
      notes: notes.trim() || null,
    }).where(eq(activitiesTable.id, Number(activityId)));
    router.back();
  }

  // delete activity
  async function handleDelete() {
    Alert.alert('Delete activity', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await db.delete(activitiesTable).where(eq(activitiesTable.id, Number(activityId)));
        router.back();
      }},
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* header with cancel and save */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.cancel}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Edit Activity</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.save}>Save</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Activity name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} accessibilityLabel="Activity name" />
        </View>
        {/* date */}
        <View style={styles.field}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} keyboardType="numeric" accessibilityLabel="Date" />
        </View>
        {/* category selection */}
        <View style={styles.field}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.catRow}>
            {categories.map(cat => (
              <TouchableOpacity key={cat.id} onPress={() => setSelectedCat(cat.id)}
                style={[styles.catPill, selectedCat === cat.id && { backgroundColor: cat.colour, borderColor: cat.colour }]}
                accessibilityLabel={`Select ${cat.name}`}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons
                  name={cat.icon as any}
                  size={14}
                  color={selectedCat === cat.id ? '#fff' : colours.textPrimary}
                />
                <Text style={[styles.catPillText, selectedCat === cat.id && { color: '#fff' }]}>
                  {cat.name}
                </Text>
              </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* duration */}
        <View style={styles.field}>
          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput style={styles.input} value={duration} onChangeText={setDuration} keyboardType="numeric" accessibilityLabel="Duration" />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>Notes (optional)</Text>
          <TextInput style={[styles.input, styles.textarea]} value={notes} onChangeText={setNotes} multiline numberOfLines={3} accessibilityLabel="Notes" />
        </View>
            {/* delete button */}
        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete activity"
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Ionicons name="trash-outline" size={18} color="#7F1D1D" />
            <Text style={styles.deleteBtnText}>Delete Activity</Text>
          </View>
</TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

