import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  /** Show eye toggle when `secureTextEntry` is set. Defaults to true for password fields. */
  showPasswordToggle?: boolean;
};

export function Input({
  label,
  error,
  style,
  secureTextEntry,
  showPasswordToggle,
  ...rest
}: InputProps) {
  const { colors } = useAppTheme();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const passwordToggle = (showPasswordToggle ?? secureTextEntry) === true;

  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text> : null}
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            passwordToggle && styles.inputWithToggle,
            {
              backgroundColor: colors.input,
              borderColor: error ? colors.error : colors.border,
              color: colors.text,
            },
            style,
          ]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={passwordToggle ? !passwordVisible : secureTextEntry}
          {...rest}
        />
        {passwordToggle ? (
          <Pressable
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={styles.toggle}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={passwordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
            <Ionicons
              name={passwordVisible ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.textMuted}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  inputRow: {
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputWithToggle: {
    paddingRight: 48,
  },
  toggle: {
    position: 'absolute',
    right: Spacing.md,
    height: '100%',
    justifyContent: 'center',
  },
  error: { fontSize: 12, marginTop: Spacing.xs },
});
