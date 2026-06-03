import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

export function ProfileMenuItem({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      style={[styles.menuItem, { backgroundColor: colors.surface }]}
      onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.textSecondary} />
      <Text style={[styles.menuLabel, { color: colors.text }]}>{label}</Text>
      {value ? (
        <Text style={[styles.menuValue, { color: colors.textMuted }]} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  menuLabel: { flex: 1, fontSize: 16 },
  menuValue: { fontSize: 13, maxWidth: 120 },
});
