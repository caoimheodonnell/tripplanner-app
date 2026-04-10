import { render, waitFor } from '@testing-library/react-native';
import React from 'react';

// mock async storage (pretend user is logged in)
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn().mockResolvedValue('1'),
  setItem:    jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));

// mock theme so styles don’t break
jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
    colours: {
      background:    '#F7F7F7',
      primary:       '#2563EB',
      primaryDim:    '#DBEAFE',
      surface:       '#FFFFFF',
      surfaceAlt:    '#F1EFE9',
      textPrimary:   '#111827',
      textSecondary: '#6B7280',
      textMuted:     '#9CA3AF',
      border:        '#D1D5DB',
      borderFocus:   '#2563EB',
      success:       '#16A34A',
      warning:       '#D97706',
      error:         '#DC2626',
    },
  }),
}));

// mock colours
jest.mock('@/constants/colours', () => ({
  colours: {
    background:    '#F7F7F7',
    primary:       '#2563EB',
    primaryDim:    '#DBEAFE',
    surface:       '#FFFFFF',
    surfaceAlt:    '#F1EFE9',
    textPrimary:   '#111827',
    textSecondary: '#6B7280',
    textMuted:     '#9CA3AF',
    border:        '#D1D5DB',
    borderFocus:   '#2563EB',
    success:       '#16A34A',
    warning:       '#D97706',
    error:         '#DC2626',
  },
  lightColours: {
    background:    '#F7F7F7',
    primary:       '#2563EB',
    primaryDim:    '#DBEAFE',
    surface:       '#FFFFFF',
    textPrimary:   '#111827',
    textSecondary: '#6B7280',
    textMuted:     '#9CA3AF',
    border:        '#D1D5DB',
    success:       '#16A34A',
    error:         '#DC2626',
  },
  darkColours: {
    background:    '#0F172A',
    primary:       '#3B82F6',
    primaryDim:    '#1E3A5F',
    surface:       '#1E293B',
    textPrimary:   '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted:     '#64748B',
    border:        '#334155',
    success:       '#22C55E',
    error:         '#EF4444',
  },
}));

// fake trip data
const MOCK_TRIPS = [
  {
    id: 1,
    name: 'Summer in Portugal',
    destination: 'Lisbon & Porto',
    startDate: '2024-07-10',
    endDate:   '2024-07-20',
    coverColour: '#E8A838',
    notes: 'First big solo trip',
    userId: 1,
    createdAt: '2024-07-01T00:00:00.000Z',
  },
  {
    id: 2,
    name: 'Weekend in Berlin',
    destination: 'Berlin, Germany',
    startDate: '2024-09-13',
    endDate:   '2024-09-15',
    coverColour: '#4A90D9',
    notes: 'City break with friends',
    userId: 1,
    createdAt: '2024-09-01T00:00:00.000Z',
  },
];
// mock database
jest.mock('@/db/client', () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
    run:    jest.fn().mockResolvedValue(undefined),
  },
}));

// mock schema 
jest.mock('@/db/schema', () => ({
  tripsTable:      { createdAt: 'createdAt', name: 'name', userId: 'userId' },
  categoriesTable: {},
  activitiesTable: {},
  targetsTable:    {},
  usersTable:      {},
}));


jest.mock('drizzle-orm', () => ({
  like: jest.fn(),
  desc: jest.fn(),
  eq:   jest.fn(),
  and:  jest.fn(),
}));

// mock navigation and focus effect
jest.mock('expo-router', () => ({
  useRouter:       () => ({ push: jest.fn(), back: jest.fn(), replace: jest.fn() }),
  useFocusEffect:  jest.fn().mockImplementation((cb) => {
    require('react').useEffect(cb, []);
  }),
}));

// mock TripCard
jest.mock('@/components/TripCard', () => {
  const { Text } = require('react-native');
  return ({ trip }: { trip: { name: string } }) => (
    <Text testID="trip-card">{trip.name}</Text>
  );
});

jest.mock('@/components/EmptyState', () => {
  const { Text } = require('react-native');
  return () => <Text testID="empty-state">No trips yet</Text>;
});


import TripsScreen from '@/app/(tabs)/index';
import { db } from '@/db/client';


describe('TripsScreen – integration tests', () => {

  beforeEach(() => {
    // reset mocks before each test
    jest.clearAllMocks();
    
// default DB response
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue(MOCK_TRIPS),
        }),
        orderBy: jest.fn().mockResolvedValue(MOCK_TRIPS),
      }),
    });
  });

  test('renders the screen heading', async () => {
    const { getByText } = render(<TripsScreen />);
    expect(getByText('My Trips')).toBeTruthy();
  });

  test('renders trip cards after DB loads', async () => {
    const { getAllByTestId } = render(<TripsScreen />);
    await waitFor(() => {
      expect(getAllByTestId('trip-card').length).toBe(2);
    });
  });

  test('displays the correct trip names', async () => {
    const { getByText } = render(<TripsScreen />);
    await waitFor(() => {
      expect(getByText('Summer in Portugal')).toBeTruthy();
      expect(getByText('Weekend in Berlin')).toBeTruthy();
    });
  });

  test('shows the Add Trip button', async () => {
    const { getByText } = render(<TripsScreen />);
    expect(getByText('+ New Trip')).toBeTruthy();
  });

  test('shows empty state when DB returns no trips', async () => {
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockResolvedValue([]),
        }),
        orderBy: jest.fn().mockResolvedValue([]),
      }),
    });

    const { getByTestId } = render(<TripsScreen />);
    await waitFor(() => {
      expect(getByTestId('empty-state')).toBeTruthy();
    });
  });
});
