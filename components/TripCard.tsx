import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type Trip = {
  id: number;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  coverColour: string;
};

type Props = {
  trip: Trip;
  onPress: () => void;
};

// card showing a single trip
export default function TripCard({ trip, onPress }: Props) {
  const { colours } = useTheme(); 

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colours.surface,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colours.border,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
    },

    accent: {
      width: 6,
      alignSelf: 'stretch',
    },

    body: {
      flex: 1,
      padding: 16,
      gap: 3,
    },

    name: {
      fontSize: 17,
      fontWeight: '700',
      color: colours.textPrimary,
    },

    destination: {
      fontSize: 13,
      color: colours.textSecondary,
    },

    dates: {
      fontSize: 12,
      color: colours.textMuted,
      marginTop: 2,
    },

    arrow: {
      paddingRight: 16,
    },

    cardPressed: {
      opacity: 0.88,
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
  });

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      accessibilityRole="button"
      accessibilityLabel={`Trip to ${trip.destination}: ${trip.name}`}
    >
      <View style={[styles.accent, { backgroundColor: trip.coverColour }]} />

    {/* trip details */}
      <View style={styles.body}>
        <Text style={styles.name}>{trip.name}</Text>

      {/* destination */}
        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color={colours.textSecondary} />
          <Text style={styles.destination}>{trip.destination}</Text>
        </View>

      {/* dates */}
        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={12} color={colours.textMuted} />
          <Text style={styles.dates}>
            {trip.startDate}  → {trip.endDate}
          </Text>
        </View>
      </View>

      {/* arrow icon */}
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colours.textMuted}
        style={styles.arrow}
      />
    </Pressable>
  );
}