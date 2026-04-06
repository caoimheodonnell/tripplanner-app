import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable, tripsTable } from '@/db/schema';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { eq } from 'drizzle-orm';
import * as FileSystem from 'expo-file-system/legacy';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useCallback, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

type Slice = { value: number; color: string; text: string; label: string };

export default function InsightsScreen() {
  const [tripCount, setTripCount]       = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [totalHours, setTotalHours]     = useState(0);
  const [pieData, setPieData]           = useState<Slice[]>([]);
  const [streak, setStreak] = useState(0);
  const { colours } = useTheme();

  
  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colours.background },
    content: { padding: 20, gap: 16 },
    title: { fontSize: 28, fontWeight: '800', color: colours.textPrimary },
    subtitle: { fontSize: 14, color: colours.textSecondary, marginBottom: 4 },

    statsRow: { flexDirection: 'row', gap: 10 },
    statCard: {
      backgroundColor: colours.surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colours.border,
      alignItems: 'center'
    },
    statLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colours.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    statValue: {
      fontSize: 30,
      fontWeight: '900',
      color: colours.textPrimary,
      marginTop: 4
    },

    card: {
      backgroundColor: colours.surface,
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor: colours.border,
      gap: 12
    },
    cardLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colours.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5
    },
    cardMuted: {
      fontSize: 14,
      color: colours.textMuted,
      fontStyle: 'italic'
    },

    chartWrap: { alignItems: 'center', paddingVertical: 8 },
    centerLabel: { alignItems: 'center' },
    centerNum: { fontSize: 26, fontWeight: '900', color: colours.textPrimary },
    centerSub: { fontSize: 12, color: colours.textSecondary },

    legend: { gap: 8 },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendLabel: { flex: 1, fontSize: 14, color: colours.textPrimary },
    legendValue: { fontSize: 14, fontWeight: '700', color: colours.textPrimary },

    streakCard: {
      backgroundColor: colours.surface,
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor: colours.border,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    streakCardActive: {
      backgroundColor: '#FFF7ED',
      borderColor: '#FED7AA',
    },
    streakEmoji: { fontSize: 36 },
    streakNum: { fontSize: 24, fontWeight: '900', color: colours.textPrimary },
    streakLabel: { fontSize: 13, color: colours.textSecondary },

    exportBtn: {
      backgroundColor: colours.surface,
      borderRadius: 14,
      padding: 18,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colours.border,
    },
    exportBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: colours.textPrimary,
    },
  });
  async function load() {
  const userId = await AsyncStorage.getItem('userId');

  if (!userId) {
    setTripCount(0);
    setActivityCount(0);
    setTotalHours(0);
    setPieData([]);
    setStreak(0);
    return;
  }

 
  const trips = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.userId, Number(userId)));

  const acts = await db
    .select()
    .from(activitiesTable)
    .where(eq(activitiesTable.userId, Number(userId)));

  const cats = await db.select().from(categoriesTable);

  
  setTripCount(trips.length);
  setActivityCount(acts.length);

  const mins = acts.reduce((sum, a) => sum + (a.durationMinutes ?? 0), 0);
  setTotalHours(Math.round((mins / 60) * 10) / 10);

  
  const grouped: Record<number, number> = {};
  for (const a of acts) {
    grouped[a.categoryId] = (grouped[a.categoryId] ?? 0) + 1;
  }

  const slices: Slice[] = Object.entries(grouped).map(([catId, count]) => {
    const cat = cats.find(c => c.id === Number(catId));
    return {
      value: count,
      color: cat?.colour ?? colours.primary,
      text: acts.length > 0 ? `${Math.round((count / acts.length) * 100)}%` : '0%',
      label: cat?.name ?? 'Unknown',
    };
  });

  setPieData(slices);

  //Streak calculation
  const uniqueDates = [...new Set(acts.map(a => a.date))]
  .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = new Date();
const todayStr = today.toLocaleDateString('en-CA');

const startIndex = uniqueDates.includes(todayStr) ? 0 : 1;

let streakCount = 0;

for (let i = startIndex; i < uniqueDates.length + startIndex; i++) {
  const expected = new Date(today);
  expected.setDate(today.getDate() - i);

  const expectedStr = expected.toLocaleDateString('en-CA');

  if (uniqueDates.includes(expectedStr)) {
    streakCount++;
  } else {
    break;
  }
}

  setStreak(streakCount);
}

useFocusEffect(
  useCallback(() => {
    load();
  }, [])
);

async function handleExport() {
  const userId = await AsyncStorage.getItem('userId');

  if (!userId) {
    Alert.alert('Error', 'User not logged in');
    return;
  }

  const acts = await db
    .select({
      name: activitiesTable.name,
      date: activitiesTable.date,
      durationMinutes: activitiesTable.durationMinutes,
      notes: activitiesTable.notes,
      categoryName: categoriesTable.name,
    })
    .from(activitiesTable)
    .leftJoin(categoriesTable, eq(activitiesTable.categoryId, categoriesTable.id))
    .where(eq(activitiesTable.userId, Number(userId)));

  const header = 'Name,Date,Duration (mins),Category,Notes\n';

  const rows = acts.map(a =>
    `"${a.name}","${a.date}","${a.durationMinutes ?? ''}","${a.categoryName ?? ''}","${a.notes ?? ''}"`
  ).join('\n');

  
const path = (FileSystem as any).documentDirectory + 'tripplanner-export.csv';

  await FileSystem.writeAsStringAsync(path, header + rows, {
    encoding: 'utf8',
  });

  const canShare = await Sharing.isAvailableAsync();

  if (canShare) {
    await Sharing.shareAsync(path, {
      mimeType: 'text/csv',
      dialogTitle: 'Export your activities',
    });
  } else {
    Alert.alert('Exported', 'File saved to: ' + path);
  }
}
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your travel journey so far...</Text>

        {/* Stat cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={styles.statLabel}>Trips</Text>
            <Text style={styles.statValue}>{tripCount}</Text>
          </View>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={styles.statLabel}>Activities</Text>
            <Text style={styles.statValue}>{activityCount}</Text>
          </View>
          <View style={[styles.statCard, { flex: 1 }]}>
            <Text style={styles.statLabel}>Hours</Text>
            <Text style={styles.statValue}>
            {totalHours}
            <Text style={{ fontSize: 16, fontWeight: '400' }}> hrs</Text>
          </Text>
          </View>
        </View>

        <View style={[styles.streakCard, streak > 0 && styles.streakCardActive]}>
  <Ionicons name="flame-outline" size={28} color={colours.primary} />
  <View>
    <Text style={styles.streakNum}>{streak} day{streak !== 1 ? 's' : ''}</Text>
    <Text style={styles.streakLabel}>
      {streak > 0 ? 'Current activity streak!' : 'Log an activity to start your streak'}
    </Text>
  </View>
</View>

        {/* Pie chart */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Activities by Category</Text>
          {pieData.length === 0 ? (
            <Text style={styles.cardMuted}>No activities logged yet</Text>
          ) : (
            <>
              <View style={styles.chartWrap}>
                <PieChart
                  data={pieData}
                  donut
                  radius={90}
                  innerRadius={55}
                  centerLabelComponent={() => (
                    <View style={styles.centerLabel}>
                      <Text style={styles.centerNum}>{activityCount}</Text>
                      <Text style={styles.centerSub}>total</Text>
                    </View>
                  )}
                />
              </View>

              
              <View style={styles.legend}>
                {pieData.map((s, i) => (
                  <View key={i} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: s.color }]} />
                    <Text style={styles.legendLabel}>{s.label}</Text>
                    <Text style={styles.legendValue}>{s.value}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
          <TouchableOpacity style={styles.exportBtn} onPress={handleExport}
  accessibilityRole="button" accessibilityLabel="Export activities to CSV">
  <Text style={styles.exportBtnText}>  Export Activities as CSV</Text>
</TouchableOpacity> 
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

