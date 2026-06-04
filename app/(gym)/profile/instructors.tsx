import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useReviews } from '@/contexts/reviews-context';
import { useAppTheme } from '@/contexts/theme-context';
import { MOCK_INSTRUCTORS, updateMockInstitution } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { getLinkedInstitutionId } from '@/utils/institution';

export default function GymManageInstructorsScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useAppTheme();
  const profile = user?.institutionProfile;
  const institutionId = getLinkedInstitutionId(user);
  const { getGymReviewForInstructor } = useReviews();

  const [instructorIds, setInstructorIds] = useState<string[]>(profile?.instructorIds ?? []);

  useEffect(() => {
    setInstructorIds(profile?.instructorIds ?? []);
  }, [profile?.instructorIds]);

  const linked = useMemo(
    () =>
      instructorIds
        .map((id) => MOCK_INSTRUCTORS.find((i) => i.id === id))
        .filter((i): i is (typeof MOCK_INSTRUCTORS)[number] => Boolean(i)),
    [instructorIds],
  );

  const available = useMemo(
    () => MOCK_INSTRUCTORS.filter((i) => !instructorIds.includes(i.id)),
    [instructorIds],
  );

  const persist = useCallback(
    (next: string[]) => {
      setInstructorIds(next);
      const instructors = next
        .map((id) => MOCK_INSTRUCTORS.find((i) => i.id === id))
        .filter((i): i is (typeof MOCK_INSTRUCTORS)[number] => Boolean(i))
        .map((i) => ({ id: i.id, displayName: i.displayName }));
      updateProfile({ institutionProfile: { instructorIds: next } });
      updateMockInstitution(institutionId, { instructors });
    },
    [institutionId, updateProfile],
  );

  const addInstructor = (id: string) => {
    persist([...instructorIds, id]);
  };

  const removeInstructor = (id: string, name: string) => {
    Alert.alert('Remove instructor', `Unlink ${name} from your gym?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: () => persist(instructorIds.filter((i) => i !== id)),
      },
    ]);
  };

  if (!profile) {
    return (
      <Screen>
        <Header title="Instructors" showBack />
        <Text style={{ color: colors.text }}>Profile not available</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title="Instructors" showBack />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Instructors linked to your gym appear on your profile and can teach group classes.
      </Text>

      <Text style={[styles.section, { color: colors.text }]}>Linked ({linked.length})</Text>
      {linked.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>No instructors linked yet.</Text>
      ) : (
        linked.map((i) => {
          const reviewed = Boolean(getGymReviewForInstructor(institutionId, i.id));
          return (
            <View
              key={i.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <UserAvatar size={48} kind="instructor" />
              <View style={styles.cardBody}>
                <Text style={[styles.name, { color: colors.text }]}>{i.displayName}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {i.disciplines.join(', ')}
                </Text>
              </View>
              <View style={styles.cardActions}>
                <Button
                  title={reviewed ? 'Review' : 'Rate'}
                  size="sm"
                  variant="outline"
                  onPress={() =>
                    router.push({
                      pathname: '/(gym)/review-instructor/[id]',
                      params: { id: i.id },
                    })
                  }
                />
                <Pressable onPress={() => removeInstructor(i.id, i.displayName)} hitSlop={8}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </Pressable>
              </View>
            </View>
          );
        })
      )}

      {available.length > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.text, marginTop: Spacing.lg }]}>
            Add instructor
          </Text>
          {available.map((i) => (
            <View
              key={i.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <UserAvatar size={48} kind="instructor" />
              <View style={styles.cardBody}>
                <Text style={[styles.name, { color: colors.text }]}>{i.displayName}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {i.disciplines.join(', ')}
                </Text>
              </View>
              <Button title="Add" size="sm" onPress={() => addInstructor(i.id)} />
            </View>
          ))}
        </>
      ) : null}

      <Button title="Done" variant="outline" onPress={() => router.back()} style={{ marginTop: Spacing.lg }} />
      <Button
        title="Invite by email"
        variant="outline"
        onPress={() => router.push('/(gym)/profile/invite-instructor')}
        style={{ marginTop: Spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg, lineHeight: 22 },
  section: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  empty: { fontSize: 14, marginBottom: Spacing.md },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
  },
  cardBody: { flex: 1 },
  cardActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  name: { fontWeight: '700', fontSize: 16 },
  meta: { fontSize: 13, marginTop: 2 },
});
