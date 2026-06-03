import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { formatClassDate } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { getLinkedInstructorId } from '@/utils/instructor';

export default function InstructorCalendarScreen() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const { colors } = useAppTheme();
  const instructorId = getLinkedInstructorId(user);
  const events = getClassesByInstructor(instructorId);

  const monthLabel =
    events.length > 0
      ? new Date(events[0].startAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      : new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Agenda</Text>
        <Text
          style={[styles.manageLink, { color: colors.primary }]}
          onPress={() => router.push('/(instructor)/profile/availability')}>
          Manage availability
        </Text>
      </View>
      <Text style={[styles.sub, { color: colors.textMuted }]}>{monthLabel}</Text>

      {events.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No upcoming classes. Create one from the Classes tab.
        </Text>
      ) : (
        events.map((c, i) => (
          <View key={c.id} style={styles.event}>
            <View style={styles.dotCol}>
              <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              {i < events.length - 1 ? (
                <View style={[styles.line, { backgroundColor: colors.border }]} />
              ) : null}
            </View>
            <View style={[styles.eventBody, { backgroundColor: colors.surface }]}>
              <Text style={[styles.time, { color: colors.primary }]}>
                {formatClassDate(c.startAt)}
              </Text>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{c.title}</Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                {c.modality === 'online' ? 'Online' : c.location?.label ?? 'In person'}
                {c.classFormat === 'individual' ? ' · 1-on-1' : ''}
              </Text>
              <Text
                style={[styles.editLink, { color: colors.primary }]}
                onPress={() => router.push({ pathname: '/edit-class/[id]', params: { id: c.id } })}>
                Edit
              </Text>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: { fontSize: 26, fontWeight: '800' },
  manageLink: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 15, marginBottom: Spacing.lg },
  empty: { fontSize: 15, lineHeight: 22 },
  event: { flexDirection: 'row', marginBottom: Spacing.md },
  dotCol: { alignItems: 'center', width: 24 },
  dot: { width: 12, height: 12, borderRadius: 6 },
  line: { flex: 1, width: 2, marginTop: 4 },
  eventBody: {
    flex: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginLeft: Spacing.md,
  },
  time: { fontSize: 12, fontWeight: '600' },
  eventTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  meta: { fontSize: 13, marginTop: 4 },
  editLink: { fontSize: 14, fontWeight: '600', marginTop: Spacing.sm },
});
