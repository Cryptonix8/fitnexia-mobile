import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

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
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color={FitnexiaColors.gray700} />
      <Text style={styles.menuLabel}>{label}</Text>
      {value ? (
        <Text style={styles.menuValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={20} color={FitnexiaColors.gray400} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  menuLabel: { flex: 1, fontSize: 16, color: FitnexiaColors.gray900 },
  menuValue: { fontSize: 13, color: FitnexiaColors.gray500, maxWidth: 120 },
});
