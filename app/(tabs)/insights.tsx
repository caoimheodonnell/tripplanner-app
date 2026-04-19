import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable, tripsTable, usersTable } from '@/db/schema';
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
import { BarChart, PieChart } from 'react-native-gifted-charts';

// format date as YYYY-MM-DD 
function formatDate(date: Date) {
  return date.toISOString().split('T')[0];
} 
type Slice = { value: number; color: string; text: string; label: string };

export default function InsightsScreen() {
  // main stats
  const [tripCount, setTripCount]       = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [totalHours, setTotalHours]     = useState(0);
  // chart data
  const [pieData, setPieData]           = useState<Slice[]>([]);
  // streak of activities booked on the date
  const [streak, setStreak] = useState(0);
  const { colours } = useTheme();
  const [barData, setBarData] = useState<any[]>([]);

  
  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colours.background },
    content: { padding: 20, gap: 16, paddingTop: 60,  },
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
  backgroundColor: colours.primaryDim,
  borderColor: colours.primary,
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
  
  // load all data for the screen
  async function load() {
  const token = await AsyncStorage.getItem('sessionToken');
  if (!token) return;
  const [user] = await db.select().from(usersTable).where(eq(usersTable.sessionToken, token));
  const userId = user?.id;

  // if no user logged in reset everything
  if (!userId) {
    setTripCount(0);
    setActivityCount(0);
    setTotalHours(0);
    setPieData([]);
    setStreak(0);
    return;
  }

  // get all user data
  const trips = await db.select().from(tripsTable).where(eq(tripsTable.userId, userId));
  const acts  = await db.select().from(activitiesTable).where(eq(activitiesTable.userId, userId));
  const cats  = await db.select().from(categoriesTable);

  // bar chart with last 7 days
  const last7Days: Record<string, number> = {};
  for (let i = 0; i < 7; i++) {
  const d = new Date();
  d.setDate(d.getDate() - i);

  const key = formatDate(d); 
  last7Days[key] = 0;
}
  // count activities per day
  for (const a of acts) {
  const key = a.date; 

  if (last7Days[key] !== undefined) {
    last7Days[key]++;
  }
}

// chart layout
  const bars = Object.entries(last7Days).reverse().map(([date, count]) => ({
    value: count,
    label: new Date(date).toLocaleDateString('en-GB', { weekday: 'short' }),
  }));
  setBarData(bars);

   // basic stats
  setTripCount(trips.length);
  setActivityCount(acts.length);
  const mins = acts.reduce((sum, a) => sum + (a.durationMinutes ?? 0), 0);
  setTotalHours(Math.round((mins / 60) * 10) / 10);

  
  // group activities seperated by category for pie chart
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

  // calculate current streak of active days
  const uniqueDates = [...new Set(acts.map(a => a.date))]
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA');
  const startIndex = uniqueDates.includes(todayStr) ? 0 : 1;
  let streakCount = 0;
  for (let i = startIndex; i < uniqueDates.length + startIndex; i++) {
    const expected = new Date(today);
    expected.setDate(today.getDate() - i);
    if (uniqueDates.includes(expected.toLocaleDateString('en-CA'))) {
      streakCount++;
    } else {
      break;
    }
  }
  setStreak(streakCount);
}

// reload data 
useFocusEffect(
  useCallback(() => {
    load();
  }, [])
);

// export activities to CSV and share it
async function handleExport() {
  const token = await AsyncStorage.getItem('sessionToken');
  if (!token) { Alert.alert('Error', 'Not logged in'); return; }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.sessionToken, token));
  if (!user) { Alert.alert('Error', 'User not found'); return; }

  // get activities with category names
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
    .where(eq(activitiesTable.userId, user.id));

    // build CSV export string
  const header = 'Name,Date,Duration (mins),Category,Notes\n';
  const rows = acts.map(a =>
    `"${a.name}","${a.date}","${a.durationMinutes ?? ''}","${a.categoryName ?? ''}","${a.notes ?? ''}"`
  ).join('\n');

  // save file locally
  const path = (FileSystem as any).documentDirectory + 'tripplanner-export.csv';
  await FileSystem.writeAsStringAsync(path, header + rows, { encoding: 'utf8' });

  // share file if possible
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(path, { mimeType: 'text/csv', dialogTitle: 'Export your activities' });
  } else {
    Alert.alert('Exported', 'File saved to: ' + path);
  }
}
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Your travel journey so far...</Text>

        {/* main stats */}
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

        {/* current streak */}
        <View style={[styles.streakCard, streak > 0 && styles.streakCardActive]}>
  <Ionicons name="flame-outline" size={28} color={colours.primary} />
  <View>
    <Text style={styles.streakNum}>{streak} day{streak !== 1 ? 's' : ''}</Text>
    <Text style={styles.streakLabel}>
      {streak > 0 ? 'Current activity streak!' : 'You are one activity away from starting a streak!'}
    </Text>
  </View>
</View>

 {/* category breakdown */}       
<View style={styles.card}>
  <Text style={styles.cardLabel}>Activities by Category</Text>

  {pieData.length === 0 ? (
    <Text style={[styles.cardMuted, { textAlign: 'center', marginTop: 10 }]}>
      No activities logged yet
    </Text>
  ) : (
    <>
      <View style={styles.chartWrap}>
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={55}
          centerLabelComponent={() => (
        <View style={[styles.centerLabel, { backgroundColor: colours.surface, borderRadius: 55, padding: 10 }]}>
          <Text style={[styles.centerNum, { color: colours.textPrimary }]}>{activityCount}</Text>
          <Text style={[styles.centerSub, { color: colours.textSecondary }]}>total</Text>
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

  {/* export data  form trips*/}
  <TouchableOpacity
    style={styles.exportBtn}
    onPress={handleExport}
    accessibilityRole="button"
    accessibilityLabel="Export activities to CSV"
  >
    <Text style={styles.exportBtnText}>Export Activities as CSV</Text>
  </TouchableOpacity>
</View>


<View style={styles.card}>
  <Text style={styles.cardLabel}>Activities (Last 7 Days)</Text>

  {barData.length === 0 ? (
    <Text style={[styles.cardMuted, { textAlign: 'center', marginTop: 10 }]}>
      No activity in the last 7 days
    </Text>
  ) : (
    <View style={{ alignItems: 'center', paddingVertical: 10 }}>
      <BarChart
        data={barData}
        barWidth={16}
        spacing={20}
        roundedTop
        hideRules
        xAxisThickness={0}
        yAxisThickness={0}
        noOfSections={2}
        maxValue={Math.max(...barData.map(b => b.value), 1)}
        frontColor={colours.primary}
        yAxisTextStyle={{
          color: colours.textMuted,
          fontSize: 10,
        }}
        xAxisLabelTextStyle={{
          color: colours.textMuted,
          fontSize: 11,
        }}
        isAnimated
        animationDuration={600}
      />
    </View>
  )}

  <Text
    style={{
      textAlign: 'center',
      fontSize: 12,
      color: colours.textMuted,
      marginTop: 6,
    }}
  >
    Activity over the last 7 days
  </Text>
</View>
        
      </ScrollView>
    </SafeAreaView>
  );
}

