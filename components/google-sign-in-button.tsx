import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Spacing } from '@/constants/fitnexia';
import { AUTH_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

type GoogleSignInButtonProps = {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
};

export function GoogleSignInButton({ onPress, disabled = false }: GoogleSignInButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      style={[
        styles.google,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
        disabled && styles.googleDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}>
      <Ionicons name="logo-google" size={20} color={colors.textSecondary} />
      <Text style={[styles.googleText, { color: colors.textSecondary }]}>
        {AUTH_LABELS.continueWithGoogle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: Spacing.md,
  },
  googleDisabled: { opacity: 0.6 },
  googleText: { fontSize: 16, fontWeight: '600' },
});
