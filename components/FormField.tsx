import { useTheme } from '@/context/ThemeContext';
import { StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

// reusable input field 
export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: Props) {
  const { colours } = useTheme();

  
  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colours.textPrimary,
      marginBottom: 6,
    },
    input: {
      height: 48,
      backgroundColor: colours.surface,
      borderWidth: 1,
      borderColor: colours.border,
      borderRadius: 10,
      paddingHorizontal: 14,
      fontSize: 15,
      color: colours.textPrimary,
    },
    multiline: {
      height: 100,
      paddingTop: 12,
      textAlignVertical: 'top',
    },
  });

  return (
    <View style={styles.container}>
    
      <Text style={styles.label}>{label}</Text>
    {/* text input */}
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colours.textMuted}
        multiline={multiline}
        accessibilityLabel={label}
      />
    </View>
  );
}