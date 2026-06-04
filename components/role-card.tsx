import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ROLE_LABELS, FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { ROLE_DESCRIPTIONS } from '@/constants/labels';
import type { UserRole } from '@/types/api';

const ROLE_ICONS: Record<UserRole, keyof typeof Ionicons.glyphMap> = {
  athlete: 'fitness',
  instructor: 'school',
  institution: 'business',
  admin: 'shield',
};

export function RoleCard({
  role,
  selected,
  onPress,
}: {
  role: UserRole;
  selected: boolean;
  onPress: () => void;
}) {
  if (role === 'admin') return null;

  const title = ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role;
  const desc = ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS] ?? '';

  return (
    <Pressable
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}>
      <View style={[styles.iconWrap, selected && styles.iconSelected]}>
        <Ionicons
          name={ROLE_ICONS[role]}
          size={28}
          color={selected ? FitnexiaColors.white : FitnexiaColors.primary}
        />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{title}</Text>
        <Text style={styles.desc}>{desc}</Text>
      </View>
      {selected ? (
        <Ionicons name="checkmark-circle" size={24} color={FitnexiaColors.primary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: FitnexiaColors.primary,
    backgroundColor: FitnexiaColors.primaryLight,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: FitnexiaColors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconSelected: { backgroundColor: FitnexiaColors.primary },
  text: { flex: 1, marginLeft: Spacing.md },
  title: { fontSize: 17, fontWeight: '700', color: FitnexiaColors.gray900 },
  titleSelected: { color: FitnexiaColors.primaryDark },
  desc: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 2 },
});
