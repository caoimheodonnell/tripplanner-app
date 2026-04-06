import { colours } from '@/constants/colours';
import { Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  compact?: boolean;
};

export default function PrimaryButton({ label, onPress, variant = 'primary', compact = false }: Props) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        variant === 'danger' && styles.danger,
        compact && styles.compact,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[
        styles.label,
        variant === 'secondary' && styles.secondaryLabel,
        variant === 'danger' && styles.dangerLabel,
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colours.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  secondary: {
    backgroundColor: colours.surface,
    borderColor: colours.border,
    borderWidth: 1,
  },
  danger: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
  },
  compact: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pressed: { opacity: 0.85 },
  label: { color: '#fff', fontSize: 15, fontWeight: '600' },
  secondaryLabel: { color: colours.textPrimary },
  dangerLabel: { color: '#7F1D1D' },
});