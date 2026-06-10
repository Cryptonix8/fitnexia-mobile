import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import type { StaffRosterEntry } from '@/services/api/institutions.api';

type StaffInstructorCardProps = {
  instructor: StaffRosterEntry;
  busy?: boolean;
  onInvite?: (instructor: StaffRosterEntry) => void;
  onCancel?: (instructor: StaffRosterEntry) => void;
  onRemove?: (instructor: StaffRosterEntry) => void;
};

export function StaffInstructorCard({
  instructor,
  busy = false,
  onInvite,
  onCancel,
  onRemove,
}: StaffInstructorCardProps) {
  const { colors } = useAppTheme();
  const hasStaffReview = Boolean(instructor.staffReview);
  const canReview = instructor.canLeaveStaffReview;
  const reviewPendingClass =
    instructor.staffStatus === 'linked' && !hasStaffReview && !instructor.hasCompletedClass;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Pressable
        style={styles.cardMain}
        onPress={() => router.push(`/instructor/${instructor.id}`)}>
        <UserAvatar size={44} kind="instructor" uri={instructor.photoUrl} />
        <View style={styles.cardBody}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
            {instructor.staffStatus === 'linked' ? (
              <View style={[styles.badge, { backgroundColor: colors.successMuted }]}>
                <Text style={[styles.badgeText, { color: colors.success }]}>Vinculado</Text>
              </View>
            ) : instructor.staffStatus === 'pending' ? (
              <View style={[styles.badge, { backgroundColor: colors.warningMuted }]}>
                <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Pendiente</Text>
              </View>
            ) : (
              <View style={[styles.badge, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
                <Text style={[styles.badgeText, { color: colors.textMuted }]}>Sin invitar</Text>
              </View>
            )}
          </View>
          <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
            {instructor.disciplines.join(', ') || 'Sin disciplinas'}
          </Text>
          <StarRating
            rating={instructor.averageRating}
            reviewCount={instructor.reviewCount}
            size={14}
          />
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>

      <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
        {instructor.staffStatus === 'linked' ? (
          <>
            {hasStaffReview || canReview ? (
              <Pressable
                style={[
                  styles.reviewChip,
                  hasStaffReview
                    ? { backgroundColor: colors.surface, borderColor: colors.border }
                    : { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/(gym)/review-instructor/[id]',
                    params: { id: instructor.id },
                  })
                }>
                <Ionicons
                  name={hasStaffReview ? 'document-text-outline' : 'create-outline'}
                  size={15}
                  color={hasStaffReview ? colors.textSecondary : colors.primary}
                />
                <Text
                  style={[
                    styles.reviewChipText,
                    { color: hasStaffReview ? colors.textSecondary : colors.primary },
                  ]}>
                  {hasStaffReview ? 'Ver reseña' : 'Dejar reseña'}
                </Text>
              </Pressable>
            ) : reviewPendingClass ? (
              <Text style={[styles.reviewHint, { color: colors.textMuted }]}>
                Reseña disponible después de una clase
              </Text>
            ) : null}
            {onRemove ? (
              <Button
                title="Desvincular"
                size="sm"
                variant="outline"
                disabled={busy}
                onPress={() => onRemove(instructor)}
              />
            ) : null}
          </>
        ) : instructor.staffStatus === 'pending' ? (
          onCancel ? (
            <Button
              title="Cancelar"
              size="sm"
              variant="outline"
              disabled={busy}
              onPress={() => onCancel(instructor)}
            />
          ) : null
        ) : onInvite ? (
          <Button
            title="Invitar"
            size="sm"
            disabled={busy}
            onPress={() => onInvite(instructor)}
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  cardBody: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  name: { fontWeight: '700', fontSize: 16 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 2 },
  reviewHint: { flex: 1, fontSize: 12, lineHeight: 16, marginRight: Spacing.sm },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  reviewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 'auto',
  },
  reviewChipText: { fontSize: 13, fontWeight: '600' },
});
