import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useReviews } from '@/contexts/reviews-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { fetchLinkedInstructors } from '@/services/api/institutions.api';
import type { Instructor } from '@/types/api';
import { resolveInstitutionId } from '@/utils/gym-classes';

export default function GymInstructorsScreen() {
  const { user, refreshUser } = useAuth();
  const { colors } = useAppTheme();
  const { getGymReviewForInstructor } = useReviews();
  const institutionId = resolveInstitutionId(user);
  const pendingInvites = user?.institutionProfile?.pendingInvites ?? [];
  const [linked, setLinked] = useState<
    Pick<Instructor, 'id' | 'displayName' | 'disciplines' | 'verified' | 'averageRating' | 'reviewCount'>[]
  >([]);

  const loadStaff = useCallback(async () => {
    try {
      const [instructors] = await Promise.all([fetchLinkedInstructors(), refreshUser()]);
      setLinked(instructors);
    } catch {
      setLinked([]);
    }
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      loadStaff();
    }, [loadStaff]),
  );

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Staff</Text>
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.primaryMuted }]}
          onPress={() => router.push('/(gym)/profile/instructors')}>
          <Text style={[styles.headerActionText, { color: colors.primaryText }]}>Manage</Text>
        </Pressable>
      </View>

      {pendingInvites.length > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.textMuted }]}>
            Pending invites ({pendingInvites.length})
          </Text>
          {pendingInvites.map((invite) => (
            <View
              key={invite.id}
              style={[
                styles.pendingCard,
                { backgroundColor: colors.warningMuted, borderColor: colors.border },
              ]}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.pendingEmail, { color: colors.text }]}>{invite.email}</Text>
            </View>
          ))}
        </>
      ) : null}

      {linked.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No instructors linked yet. Invite staff or add from the roster.
        </Text>
      ) : (
        linked.map((i) => {
          const reviewed = Boolean(getGymReviewForInstructor(institutionId, i.id));
          return (
            <View
              key={i.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable
                style={styles.cardMain}
                onPress={() => router.push(`/instructor/${i.id}`)}>
                <UserAvatar size={44} kind="instructor" />
                <View style={styles.cardBody}>
                  <Text style={[styles.name, { color: colors.text }]}>{i.displayName}</Text>
                  <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
                    {i.disciplines.join(', ')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                <Pressable
                  style={[
                    styles.reviewChip,
                    reviewed
                      ? {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        }
                      : {
                          backgroundColor: colors.primaryMuted,
                          borderColor: colors.primary,
                        },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: '/(gym)/review-instructor/[id]',
                      params: { id: i.id },
                    })
                  }>
                  <Ionicons
                    name={reviewed ? 'document-text-outline' : 'create-outline'}
                    size={15}
                    color={reviewed ? colors.textSecondary : colors.primary}
                  />
                  <Text
                    style={[
                      styles.reviewChipText,
                      { color: reviewed ? colors.textSecondary : colors.primary },
                    ]}>
                    {reviewed ? 'View review' : 'Leave review'}
                  </Text>
                </Pressable>
              </View>
            </View>
          );
        })
      )}

      <View style={styles.bottomActions}>
        <Pressable
          style={[styles.bottomBtn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/(gym)/profile/invite-instructor')}>
          <Ionicons name="person-add-outline" size={18} color={colors.onPrimary} />
          <Text style={[styles.bottomBtnText, { color: colors.onPrimary }]}>Invite</Text>
        </Pressable>
        <Pressable
          style={[
            styles.bottomBtn,
            styles.bottomBtnOutline,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
          onPress={() => router.push('/(gym)/profile/instructors')}>
          <Ionicons name="people-outline" size={18} color={colors.primary} />
          <Text style={[styles.bottomBtnText, { color: colors.primary }]}>Roster</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 26, fontWeight: '800' },
  headerAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  headerActionText: { fontSize: 13, fontWeight: '600' },
  section: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  pendingEmail: { fontSize: 14, fontWeight: '500', flex: 1 },
  empty: { fontSize: 15, lineHeight: 22 },
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
  name: { fontWeight: '700', fontSize: 16 },
  meta: { fontSize: 13, marginTop: 2 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
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
  },
  reviewChipText: { fontSize: 13, fontWeight: '600' },
  bottomActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  bottomBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: Radius.md,
  },
  bottomBtnOutline: {
    borderWidth: 1,
  },
  bottomBtnText: { fontSize: 14, fontWeight: '600' },
});
