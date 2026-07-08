import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';

export type HubAction = {
  id: string;
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  iconColor: string;
  onPress: () => void;
  featured?: boolean;
};

type Props = {
  actions: HubAction[];
};

export function ActionHubGrid({ actions }: Props) {
  const { colors } = useAppTheme();
  const featured = actions.find((a) => a.featured);
  const grid = actions.filter((a) => !a.featured);

  return (
    <View style={styles.wrap}>
      {featured ? (
        <Pressable
          onPress={featured.onPress}
          style={({ pressed }) => [
            styles.featured,
            {
              backgroundColor: colors.primary,
              opacity: pressed ? 0.92 : 1,
            },
          ]}>
          <View style={[styles.featuredIcon, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
            <Ionicons name={featured.icon} size={26} color={colors.surface} />
          </View>
          <View style={styles.featuredText}>
            <Text style={[styles.featuredLabel, { color: colors.surface }]}>{featured.label}</Text>
            <Text style={[styles.featuredSub, { color: 'rgba(255,255,255,0.85)' }]}>
              {featured.subtitle}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.9)" />
        </Pressable>
      ) : null}

      <View style={styles.grid}>
        {grid.map((action) => (
          <Pressable
            key={action.id}
            onPress={action.onPress}
            style={({ pressed }) => [
              styles.tile,
              {
                backgroundColor: action.tint,
                borderColor: colors.border,
                opacity: pressed ? 0.9 : 1,
              },
            ]}>
            <View style={[styles.tileIcon, { backgroundColor: colors.surface }]}>
              <Ionicons name={action.icon} size={22} color={action.iconColor} />
            </View>
            <Text style={[styles.tileLabel, { color: colors.text }]}>{action.label}</Text>
            <Text style={[styles.tileSub, { color: colors.textMuted }]} numberOfLines={2}>
              {action.subtitle}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md, marginBottom: Spacing.lg },
  featured: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
  },
  featuredIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featuredText: { flex: 1, gap: 4 },
  featuredLabel: { fontSize: 18, fontWeight: '800' },
  featuredSub: { fontSize: 13, lineHeight: 18 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tile: {
    width: '48.5%',
    flexGrow: 1,
    minWidth: '47%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  tileIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontSize: 15, fontWeight: '700' },
  tileSub: { fontSize: 12, lineHeight: 16 },
});
