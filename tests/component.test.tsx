// tests/component.test.tsx
// Component test: FormField renders its label and fires onChangeText correctly

import FormField from '@/components/FormField';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';


jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem:    jest.fn().mockResolvedValue(null),
  setItem:    jest.fn().mockResolvedValue(undefined),
  removeItem: jest.fn().mockResolvedValue(undefined),
}));


jest.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    isDark: false,
    toggleTheme: jest.fn(),
    colours: {
      textPrimary:   '#111827',
      textSecondary: '#6B7280',
      textMuted:     '#9CA3AF',
      surface:       '#FFFFFF',
      border:        '#D1D5DB',
      background:    '#F7F7F7',
      primary:       '#2563EB',
    },
  }),
}));


jest.mock('@/constants/colours', () => ({
  colours: {
    textPrimary:   '#111827',
    textSecondary: '#6B7280',
    textMuted:     '#9CA3AF',
    surface:       '#FFFFFF',
    border:        '#D1D5DB',
    background:    '#F7F7F7',
    primary:       '#2563EB',
  },
  lightColours: {
    textPrimary:   '#111827',
    textSecondary: '#6B7280',
    textMuted:     '#9CA3AF',
    surface:       '#FFFFFF',
    border:        '#D1D5DB',
    background:    '#F7F7F7',
    primary:       '#2563EB',
  },
  darkColours: {
    textPrimary:   '#F1F5F9',
    textSecondary: '#94A3B8',
    textMuted:     '#64748B',
    surface:       '#1E293B',
    border:        '#334155',
    background:    '#0F172A',
    primary:       '#3B82F6',
  },
}));



describe('FormField – component tests', () => {

  test('renders the label text', () => {
    const { getByText } = render(
      <FormField
        label="Trip Name"
        value=""
        onChangeText={jest.fn()}
      />
    );
    expect(getByText('Trip Name')).toBeTruthy();
  });

  test('renders with the correct initial value', () => {
    const { getByDisplayValue } = render(
      <FormField
        label="Destination"
        value="Lisbon"
        onChangeText={jest.fn()}
      />
    );
    expect(getByDisplayValue('Lisbon')).toBeTruthy();
  });

  test('calls onChangeText when the user types', () => {
    const mockOnChange = jest.fn();

    const { getByLabelText } = render(
      <FormField
        label="Trip Name"
        value=""
        onChangeText={mockOnChange}
        placeholder="Enter trip name"
      />
    );

    fireEvent.changeText(getByLabelText('Trip Name'), 'Weekend in Paris');

    expect(mockOnChange).toHaveBeenCalledWith('Weekend in Paris');
    expect(mockOnChange).toHaveBeenCalledTimes(1);
  });

  test('renders placeholder text when value is empty', () => {
    const { getByPlaceholderText } = render(
      <FormField
        label="Notes"
        value=""
        onChangeText={jest.fn()}
        placeholder="Add some notes..."
      />
    );
    expect(getByPlaceholderText('Add some notes...')).toBeTruthy();
  });
});
