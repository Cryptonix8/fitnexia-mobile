import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { MOCK_INSTRUCTORS } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';

export default function GymInstructorsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const instructorIds = user?.institutionProfile?.instructorIds ?? [];
  const linked = instructorIds
    .map((id) => MOCK_INSTRUCTORS.find((i) => i.id === id))
    .filter((i): i is (typeof MOCK_INSTRUCTORS)[number] => Boolean(i));

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Instructors</Text>
        <Button
          title="Manage"
          size="sm"
          onPress={() => router.push('/(gym)/profile/instructors')}
        />
      </View>

      {linked.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No instructors linked yet. Add them from your gym profile.
        </Text>
      ) : (
        linked.map((i) => (
          <Pressable
            key={i.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
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
        ))
      )}

      <Button
        title="Invite instructor"
        variant="outline"
        onPress={() => Alert.alert('Invite', 'Email invite flow (mock).')}
        style={{ marginTop: Spacing.lg }}
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
  empty: { fontSize: 15, lineHeight: 22 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
    borderWidth: 1,
  },
  name: { fontWeight: '700', fontSize: 16 },
  meta: { fontSize: 13, marginTop: 2 },
});
