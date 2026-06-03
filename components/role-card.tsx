import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import type { UserRole } from '@/types/api';

const ROLE_CONFIG: Record<
  UserRole,
  { icon: keyof typeof Ionicons.glyphMap; title: string; desc: string }
> = {
  athlete: {
    icon: 'fitness',
    title: 'Athlete',
    desc: 'Find and book classes near you',
  },
  instructor: {
    icon: 'school',
    title: 'Instructor',
    desc: 'Teach and manage your schedule',
  },
  institution: {
    icon: 'business',
    title: 'Gym / School',
    desc: 'Manage instructors and group classes',
  },
  admin: { icon: 'shield', title: 'Admin', desc: '' },
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
  const cfg = ROLE_CONFIG[role];
  if (role === 'admin') return null;

  return (
    <Pressable
      style={[styles.card, selected && styles.selected]}
      onPress={onPress}>
      <View style={[styles.iconWrap, selected && styles.iconSelected]}>
        <Ionicons
          name={cfg.icon}
          size={28}
          color={selected ? FitnexiaColors.white : FitnexiaColors.primary}
        />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, selected && styles.titleSelected]}>{cfg.title}</Text>
        <Text style={styles.desc}>{cfg.desc}</Text>
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
