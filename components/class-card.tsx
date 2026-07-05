import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { RecurringClassBadge } from '@/components/recurring-class-badge';
import { ClassMetaBadges } from '@/components/class-meta-badges';
import { Badge } from '@/components/ui/badge';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BADGE_LABELS, CLASS_CARD_LABELS, classFormatBadgeLabel, modalityLocationLabel, translateDisciplineLabel } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { formatClassDate, formatMoney } from '@/data/mock';
import type { ClassListItem } from '@/types/api';

export function ClassCard({
  item,
  compact,
  distanceLabel,
  institutionLogoUri,
}: {
  item: ClassListItem;
  compact?: boolean;
  distanceLabel?: string;
  /** Fallback gym logo when `item.institution.logoUrl` is missing (e.g. cached classes). */
  institutionLogoUri?: string | null;
}) {
  const { colors } = useAppTheme();
  const full = item.spotsLeft === 0;
  const isGymClass = Boolean(item.institution);
  const formatLabel = classFormatBadgeLabel(item.classFormat, {
    capacity: item.capacity,
    hasInstitution: isGymClass,
  });

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
      <UserAvatar
        size={72}
        kind={isGymClass ? 'institution' : 'instructor'}
        uri={
          isGymClass
            ? item.institution?.logoUrl ?? institutionLogoUri
            : item.instructor.photoUrl
        }
        style={styles.thumb}
      />
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.title}
          </Text>
          <RecurringClassBadge item={item} compact />
          {full ? <Badge label={BADGE_LABELS.full} variant="warning" /> : null}
        </View>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          {translateDisciplineLabel(item.discipline)} · {formatLabel} · {formatClassDate(item.startAt)}
        </Text>
        <View style={styles.footer}>
          <View style={styles.instructorRow}>
            <Text style={[styles.instructor, { color: colors.textSecondary }]}>
              {item.instructor.displayName}
            </Text>
            {item.instructor.verified ? (
              <Badge label={BADGE_LABELS.verified} variant="verified" />
            ) : null}
          </View>
          <Text style={[styles.price, { color: colors.primary }]}>{formatMoney(item.price)}</Text>
        </View>
        <View style={styles.tags}>
          <ClassMetaBadges item={item} />
          <View style={styles.tag}>
            <Ionicons
              name={item.modality === 'online' ? 'videocam' : 'location'}
              size={12}
              color={colors.textMuted}
            />
            <Text style={[styles.tagText, { color: colors.textMuted }]}>
              {modalityLocationLabel(item.modality, item.location?.label)}
              {distanceLabel ? ` · ${distanceLabel}` : ''}
            </Text>
          </View>
          {item.spotsLeft != null && !full ? (
            <Text style={[styles.spots, { color: colors.primary }]}>
              {CLASS_CARD_LABELS.spotsLeft(item.spotsLeft)}
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
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  title: { flex: 1, fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 4 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  instructorRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, flex: 1 },
  instructor: { fontSize: 13, fontWeight: '500' },
  price: { fontSize: 15, fontWeight: '700' },
  tags: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.md, flexWrap: 'wrap' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  tagText: { fontSize: 12 },
  spots: { fontSize: 12, fontWeight: '500' },
});
