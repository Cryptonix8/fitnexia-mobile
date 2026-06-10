import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { AUTH_LABELS } from '@/constants/labels';

type GoogleSignInButtonProps = {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
};

export function GoogleSignInButton({ onPress, disabled = false }: GoogleSignInButtonProps) {
  return (
    <Pressable
      style={[styles.google, disabled && styles.googleDisabled]}
      onPress={onPress}
      disabled={disabled}>
      <Ionicons name="logo-google" size={20} color={FitnexiaColors.gray700} />
      <Text style={styles.googleText}>{AUTH_LABELS.continueWithGoogle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: FitnexiaColors.white,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: Spacing.md,
  },
  googleDisabled: { opacity: 0.6 },
  googleText: { fontSize: 16, fontWeight: '600', color: FitnexiaColors.gray700 },
});
