import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type BadgeVariant = 'default' | 'success' | 'warning' | 'verified';

export function Badge({
  label,
  variant = 'default',
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  const { colors, isDark } = useAppTheme();

  const palette = {
    default: { bg: colors.surfaceMuted, text: colors.textSecondary },
    success: { bg: colors.successMuted, text: isDark ? colors.success : '#166534' },
    warning: { bg: colors.warningMuted, text: isDark ? colors.warning : '#854D0E' },
    verified: { bg: colors.primaryMuted, text: colors.primaryText },
  }[variant];

  return (
    <View style={[styles.badge, { backgroundColor: palette.bg }]}>
      <Text style={[styles.text, { color: palette.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: { fontSize: 11, fontWeight: '600' },
});
