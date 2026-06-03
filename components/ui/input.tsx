import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
};

export function Input({ label, error, style, ...rest }: InputProps) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, error && styles.inputError, style]}
        placeholderTextColor={FitnexiaColors.gray400}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: FitnexiaColors.gray700,
    marginBottom: Spacing.sm,
  },
  input: {
    backgroundColor: FitnexiaColors.white,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    color: FitnexiaColors.gray900,
  },
  inputError: { borderColor: FitnexiaColors.error },
  error: { fontSize: 12, color: FitnexiaColors.error, marginTop: Spacing.xs },
});
