import EmptyState from '@/components/EmptyState';
import TripCard from '@/components/TripCard';
import { useTheme } from '@/context/ThemeContext';
import { db } from '@/db/client';
import { tripsTable, usersTable } from '@/db/schema';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { and, desc, eq, like } from 'drizzle-orm';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  FlatList, Image, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Trip = typeof tripsTable.$inferSelect;

export default function TripsScreen() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const { colours } = useTheme();

  
  const styles = StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colours.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '800',
      color: colours.textPrimary,
    },
    addButton: {
      backgroundColor: colours.primary,
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 8,
    },
    addButtonText: {
      color: '#fff',
      fontWeight: '700',
    },
    searchRow: {
      flexDirection: 'row',
      marginHorizontal: 20,
      marginBottom: 10,
      alignItems: 'center',
      gap: 8,
    },
    searchInput: {
      flex: 1,
      backgroundColor: colours.surface,
      borderRadius: 12,
      paddingHorizontal: 14,
      height: 44,
      borderWidth: 1,
      borderColor: colours.border,
      color: colours.textPrimary,
    },
    clearText: {
      color: colours.primary,
      fontWeight: '600',
    },
    list: {
      paddingHorizontal: 20,
      gap: 12,
      paddingBottom: 20,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      color: colours.textMuted,
    },
  });


async function getLoggedInUserId(): Promise<number | null> {
  const token = await AsyncStorage.getItem('sessionToken');
  if (!token) return null;
  const [user] = await db.select().from(usersTable)
    .where(eq(usersTable.sessionToken, token));
  return user?.id ?? null;
}


async function loadTrips(query = '') {
  setLoading(true);

  const userId = await getLoggedInUserId();  // ← actually CALL it here
  if (!userId) {
    router.replace('/login');
    return;
  }

  let rows: Trip[];

  if (query.trim()) {
    rows = await db
      .select()
      .from(tripsTable)
      .where(
        and(
          eq(tripsTable.userId, userId),      // ← no Number() needed, already a number
          like(tripsTable.name, `%${query}%`)
        )
      )
      .orderBy(desc(tripsTable.createdAt));
  } else {
    rows = await db
      .select()
      .from(tripsTable)
      .where(eq(tripsTable.userId, userId))
      .orderBy(desc(tripsTable.createdAt));
  }

  setTrips(rows);
  setLoading(false);
}

  useFocusEffect(
    useCallback(() => {
      loadTrips(search);
    }, [search])
  );

  function handleSearch(text: string) {
    setSearch(text);
    loadTrips(text);
  }

  function clearSearch() {
    setSearch('');
    loadTrips('');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    
    <Image
      source={require('../../assets/images/Trip Planner.png')}
      style={{ width: 60, height: 60 }}
    />

    <Text style={styles.title}>
      Your Trips
    </Text>

  </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/add-trip')}
          accessibilityLabel="Add a new trip"
          accessibilityRole="button"
        >
          <Text style={styles.addButtonText}>+ New Trip</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search trips..."
          placeholderTextColor={colours.textMuted}
          value={search}
          onChangeText={handleSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {loading ? (
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      ) :trips.length === 0 ? (
  search.length > 0 ? (
    <EmptyState
      iconName="map-outline"
      iconLib="Ionicons"
      title={`No trips match "${search}"`}
      subtitle="Try a different destination or trip name"
      actionLabel="Clear search"
      onAction={clearSearch}
    />
  ) : (
    <EmptyState
      iconName="map-outline"
      iconLib="Ionicons"
      title="Ready for your next adventure?"
      subtitle="Tap below to add your first adventure"
      actionLabel="Plan a trip"
      onAction={() => router.push('/add-trip')}
    />
  )
) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onPress={() => router.push(`/trip/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

