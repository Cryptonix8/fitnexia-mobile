import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';
import { formatClassDate, formatMoney } from '@/data/mock';
import type { ClassListItem } from '@/types/api';

export function ClassCard({ item, compact }: { item: ClassListItem; compact?: boolean }) {
  const { colors } = useAppTheme();
  const full = item.spotsLeft === 0;

  return (
    <Pressable
      style={[
        styles.card,
        compact && styles.compact,
        {
          backgroundColor: colors.surface,
          shadowColor: colors.shadow,
        },
      ]}
      onPress={() => router.push(`/class/${item.id}`)}>
      <UserAvatar size={72} kind="instructor" style={styles.thumb} />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          {full ? <Badge label="Full" variant="warning" /> : null}
        </View>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {item.discipline} · {formatClassDate(item.startAt)}
        </Text>
        <View style={styles.footer}>
          <Text style={[styles.instructor, { color: colors.textSecondary }]}>
            {item.instructor.displayName}
          </Text>
          <Text style={[styles.price, { color: colors.primary }]}>{formatMoney(item.price)}</Text>
        </View>
        <View style={styles.tags}>
          <View style={styles.tag}>
            <Ionicons
              name={item.modality === 'online' ? 'videocam' : 'location'}
              size={12}
              color={colors.textMuted}
            />
            <Text style={[styles.tagText, { color: colors.textMuted }]}>
              {item.modality === 'online' ? 'Online' : item.location?.label ?? 'In person'}
            </Text>
          </View>
          {item.spotsLeft != null && !full ? (
            <Text style={[styles.spots, { color: colors.primary }]}>
              {item.spotsLeft} spots left
            </Text>
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  compact: { marginBottom: Spacing.sm },
  thumb: {},
  body: { flex: 1, marginLeft: Spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  title: { flex: 1, fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  instructor: { fontSize: 13, fontWeight: '500' },
  price: { fontSize: 15, fontWeight: '700' },
  tags: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontSize: 12 },
  spots: { fontSize: 12, fontWeight: '500' },
});
