import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ROLE_LABELS, Radius, Spacing } from '@/constants/fitnexia';
import { ROLE_DESCRIPTIONS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
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
  const { colors } = useAppTheme();

  if (role === 'admin') return null;

  const title = ROLE_LABELS[role as keyof typeof ROLE_LABELS] ?? role;
  const desc = ROLE_DESCRIPTIONS[role as keyof typeof ROLE_DESCRIPTIONS] ?? '';

  return (
    <Pressable
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.primaryMuted : colors.surface,
          borderColor: selected ? colors.primary : 'transparent',
        },
      ]}
      onPress={onPress}>
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: selected ? colors.primary : colors.primaryMuted },
        ]}>
        <Ionicons
          name={ROLE_ICONS[role]}
          size={28}
          color={selected ? colors.onPrimary : colors.primary}
        />
      </View>
      <View style={styles.text}>
        <Text
          style={[
            styles.title,
            { color: selected ? colors.primaryText : colors.text },
          ]}>
          {title}
        </Text>
        <Text style={[styles.desc, { color: colors.textMuted }]}>{desc}</Text>
      </View>
      {selected ? (
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 2,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, marginLeft: Spacing.md },
  title: { fontSize: 17, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 2 },
});
