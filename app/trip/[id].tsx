import EmptyState from '@/components/EmptyState';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { activitiesTable, categoriesTable, tripsTable } from '@/db/schema';
import { fetchWeather, WeatherData } from '@/utils/weather';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { and, desc, eq } from 'drizzle-orm';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Trip = typeof tripsTable.$inferSelect;
type Activity = typeof activitiesTable.$inferSelect & {
  categoryName: string;
  categoryColour: string;
};

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const { colours } = useTheme();

  const [weather, setWeather]             = useState<WeatherData | null>(null);
const [weatherLoading, setWeatherLoading] = useState(false);
const [weatherError, setWeatherError]   = useState('');

  
  const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: colours.background },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 20,
    },

    back: { color: colours.primary, 
      fontWeight: '600' },

    headerActions: { flexDirection: 'row',
       gap: 16 },

    actionText: { color: colours.primary },

    tripBanner: {
  margin: 20,
  padding: 20,
  borderRadius: 10,
  borderLeftWidth: 4,
  borderLeftColor: 'rgba(255,255,255,0.4)',
},

    tripName: { color: '#fff',
       fontSize: 22, 
       fontWeight: '800' },

    tripDest: { color: '#fff' },

    tripDates: { color: '#fff' },

    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
    },

    sectionTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colours.textPrimary,
    },

    addBtn: {
      backgroundColor: colours.primaryDim,
      padding: 10,
    },

    addBtnText: { color: colours.primary },

    list: { padding: 20, gap: 10 },

    activityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colours.surface,
      padding: 14,
      borderRadius: 12,
      gap: 10,
    },

    catDot: { width: 10, height: 10, borderRadius: 5 },

    activityInfo: { flex: 1 },

    activityName: {
      fontWeight: '600',
      color: colours.textPrimary,
    },

    activityMeta: {
      color: colours.textSecondary,
      fontSize: 13,
    },

    pillContainer: {
      flexDirection: 'row',
      padding: 20,
      gap: 8,
    },

    pill: {
      padding: 8,
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 8,
    },

    pillSelected: {
      backgroundColor: colours.textPrimary,
    },

    pillText: {
      color: colours.textPrimary,
    },

    dateRow: {
      flexDirection: 'row',
      padding: 20,
      gap: 8,
    },

    dateInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colours.border,
      padding: 8,
      borderRadius: 8,
      color: colours.textPrimary,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    weatherCard: {
  backgroundColor: colours.surface,
  borderRadius: 14,
  padding: 16,
  borderWidth: 1,
  borderColor: colours.border,
  marginHorizontal: 20,
  marginBottom: 12,
  gap: 4,
},

weatherTitle: {
  fontSize: 12,
  fontWeight: '700',
  color: colours.textSecondary,
  textTransform: 'uppercase',
  letterSpacing: 0.5,
  marginBottom: 4,
},

weatherMuted: {
  fontSize: 14,
  color: colours.textMuted,
  fontStyle: 'italic',
},

weatherTemp: {
  fontSize: 36,
  fontWeight: '900',
  color: colours.textPrimary,
},

weatherDesc: {
  fontSize: 15,
  color: colours.textSecondary,
  textTransform: 'capitalize',
},

weatherLocation: {
  fontSize: 12,
  color: colours.textMuted,
},
pillTextSelected: {
  color: '#fff',
},
  });

  async function load() {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) return;

    const [tripRow] = await db
      .select()
      .from(tripsTable)
      .where(
        and(
          eq(tripsTable.id, Number(id)),
          eq(tripsTable.userId, Number(userId))
        )
      );

    setTrip(tripRow ?? null);

    if (tripRow?.destination) {
  setWeatherLoading(true);
  setWeatherError('');

  fetchWeather(tripRow.destination)
    .then(setWeather)
    .catch(() =>
      setWeatherError('Weather unavailable for this destination')
    )
    .finally(() => setWeatherLoading(false));
}

    const rows = await db
      .select({
        id: activitiesTable.id,
        tripId: activitiesTable.tripId,
        categoryId: activitiesTable.categoryId,
        name: activitiesTable.name,
        date: activitiesTable.date,
        durationMinutes: activitiesTable.durationMinutes,
        count: activitiesTable.count,
        notes: activitiesTable.notes,
        createdAt: activitiesTable.createdAt,
        categoryName: categoriesTable.name,
        categoryColour: categoriesTable.colour,
      })
      .from(activitiesTable)
      .leftJoin(
        categoriesTable,
        eq(activitiesTable.categoryId, categoriesTable.id)
      )
      .where(
        and(
          eq(activitiesTable.tripId, Number(id)),
          eq(activitiesTable.userId, Number(userId))
        )
      )
      .orderBy(desc(activitiesTable.date));

    setActivities(rows as Activity[]);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function deleteTrip() {
    Alert.alert('Delete trip', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await db.delete(activitiesTable).where(eq(activitiesTable.tripId, Number(id)));
          await db.delete(tripsTable).where(eq(tripsTable.id, Number(id)));
          router.back();
        },
      },
    ]);
  }

  function clearFilters() {
  setSelectedCategory(null);
  setDateFrom('');
  setDateTo('');
}

  const filtered = activities
    .filter(a => selectedCategory ? a.categoryId === selectedCategory : true)
    .filter(a => dateFrom ? a.date >= dateFrom : true)
    .filter(a => dateTo ? a.date <= dateTo : true);

  const uniqueCategories = activities.filter(
    (a, i, arr) => arr.findIndex(b => b.categoryId === a.categoryId) === i
  );

  if (!trip) {
    return (
      <EmptyState
        title="Trip not found"
        subtitle="This trip may have been deleted or moved"
        actionLabel="Back to trips"
        onAction={() => router.back()}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <View style={styles.row}>
            <Ionicons name="arrow-back" size={16} color={colours.primary} />
            <Text style={styles.back}>Trips</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push(`/trip/${id}/edit`)}>
            <Text style={styles.actionText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={deleteTrip}>
            <Text style={[styles.actionText, { color: colours.error }]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Trip Banner */}
      <View style={[styles.tripBanner, { backgroundColor: trip.coverColour }]}>
        <Text style={styles.tripName}>{trip.name}</Text>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color="#fff" />
          <Text style={styles.tripDest}>{trip.destination}</Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={12} color="#fff" />
          <Text style={styles.tripDates}>
            {trip.startDate} - {trip.endDate}
          </Text>
        </View>
      </View>

{/* Weather */}
<View style={styles.weatherCard}>
  <Text style={styles.weatherTitle}>🌤 Current Weather</Text>

  {weatherLoading && (
    <Text style={styles.weatherMuted}>Loading weather...</Text>
  )}

  {weatherError !== '' && (
    <Text style={styles.weatherMuted}>{weatherError}</Text>
  )}

  {weather && !weatherLoading && (
    <>
      <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
      <Text style={styles.weatherDesc}>{weather.description}</Text>
      <Text style={styles.weatherLocation}>
        {weather.city}, {weather.country}
      </Text>
    </>
  )}
</View>

      {/* Header Row */}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>
          Activities ({filtered.length})
        </Text>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => router.push(`/trip/${id}/add-activity`)}
        >
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={styles.dateRow}>
        <TextInput
          style={styles.dateInput}
          placeholder="From YYYY-MM-DD"
          value={dateFrom}
          onChangeText={setDateFrom}
        />
        <TextInput
          style={styles.dateInput}
          placeholder="To YYYY-MM-DD"
          value={dateTo}
          onChangeText={setDateTo}
        />
      </View>

      {/* Categories */}
      <View style={styles.pillContainer}>
        <TouchableOpacity
          onPress={() => setSelectedCategory(null)}
          style={[styles.pill, !selectedCategory && styles.pillSelected]}
        >
          <Text
  style={[
    styles.pillText,
    !selectedCategory && styles.pillTextSelected
  ]}
>
  All
</Text>
        </TouchableOpacity>

        {uniqueCategories.map(a => (
          <TouchableOpacity
            key={a.categoryId}
            onPress={() => setSelectedCategory(a.categoryId)}
            style={[
              styles.pill,
              selectedCategory === a.categoryId && styles.pillSelected,
            ]}
          >
            <Text
            style={[
              styles.pillText,
              selectedCategory === a.categoryId && styles.pillTextSelected
            ]}
            >
            {a.categoryName}
          </Text>
          </TouchableOpacity>
        ))}
      </View>

      
      {filtered.length === 0 ? (
        <EmptyState
          title={activities.length === 0 ? "Nothing planned yet" : "No activities match"}
          subtitle={
            activities.length === 0
              ? "Start building your itinerary by adding your first activity"
              : "Try a different date range or category"
          }
          actionLabel={activities.length === 0 ? "Add activity" : "Clear filters"}
          onAction={activities.length === 0 ? () => router.push(`/trip/${id}/add-activity`) : clearFilters}
        />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                router.push({
                  pathname: '/trip/[id]/edit-activity',
                  params: { id, activityId: item.id },
                })
              }
            >
              <View style={styles.activityRow}>
                <View
                  style={[
                    styles.catDot,
                    { backgroundColor: item.categoryColour },
                  ]}
                />

                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{item.name}</Text>
                  <Text style={styles.activityMeta}>
                    {item.date} · {item.categoryName}
                    {item.durationMinutes
                      ? ` · ${item.durationMinutes} min`
                      : ''}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colours.textMuted}
                />
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

