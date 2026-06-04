import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useReviews } from '@/contexts/reviews-context';
import { useAppTheme } from '@/contexts/theme-context';
import { MOCK_INSTRUCTORS } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { resolveInstitutionId } from '@/utils/gym-classes';

export default function GymInstructorsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { getGymReviewForInstructor } = useReviews();
  const institutionId = resolveInstitutionId(user);
  const instructorIds = user?.institutionProfile?.instructorIds ?? [];
  const pendingInvites = user?.institutionProfile?.pendingInvites ?? [];
  const linked = instructorIds
    .map((id) => MOCK_INSTRUCTORS.find((i) => i.id === id))
    .filter((i): i is (typeof MOCK_INSTRUCTORS)[number] => Boolean(i));

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Staff</Text>
        <Button
          title="Manage"
          size="sm"
          onPress={() => router.push('/(gym)/profile/instructors')}
        />
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
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
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
                <UserAvatar size={48} kind="instructor" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.name, { color: colors.text }]}>{i.displayName}</Text>
                  <Text style={[styles.meta, { color: colors.textMuted }]}>
                    {i.disciplines.join(', ')}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
              </Pressable>
              <Button
                title={reviewed ? 'View review' : 'Leave review'}
                size="sm"
                variant={reviewed ? 'outline' : 'primary'}
                onPress={() =>
                  router.push({
                    pathname: '/(gym)/review-instructor/[id]',
                    params: { id: i.id },
                  })
                }
              />
            </View>
          );
        })
      )}

      <Button
        title="Invite instructor"
        onPress={() => router.push('/(gym)/profile/invite-instructor')}
        style={{ marginTop: Spacing.lg }}
      />
      <Button
        title="Add from roster"
        variant="outline"
        onPress={() => router.push('/(gym)/profile/instructors')}
        style={{ marginTop: Spacing.sm }}
      />
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
  section: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  pendingEmail: { fontSize: 14, fontWeight: '500' },
  empty: { fontSize: 15, lineHeight: 22 },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  name: { fontWeight: '700', fontSize: 16 },
  meta: { fontSize: 13, marginTop: 2 },
});
