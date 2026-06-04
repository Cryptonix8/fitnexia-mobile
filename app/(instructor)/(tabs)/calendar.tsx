import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookingsCalendar } from '@/components/bookings-calendar';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { formatClassDate } from '@/data/mock';
import type { ClassListItem } from '@/types/api';
import { startOfMonth, toDateKey } from '@/utils/calendar';
import { getLinkedInstructorId } from '@/utils/instructor';
import { isSameCalendarDay } from '@/utils/schedule';

function classEndAt(cls: ClassListItem): Date {
  const end = new Date(cls.startAt);
  end.setMinutes(end.getMinutes() + cls.durationMinutes);
  return end;
}

function isUpcomingClass(cls: ClassListItem): boolean {
  return classEndAt(cls).getTime() > Date.now();
}

export default function InstructorCalendarScreen() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const { colors } = useAppTheme();
  const instructorId = getLinkedInstructorId(user);
  const allEvents = getClassesByInstructor(instructorId);

  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  });

  const events = useMemo(
    () =>
      allEvents.filter((c) =>
        tab === 'upcoming' ? isUpcomingClass(c) : !isUpcomingClass(c),
      ),
    [allEvents, tab],
  );

  const markedDateKeys = useMemo(() => {
    const keys = new Set<string>();
    for (const cls of events) {
      keys.add(toDateKey(new Date(cls.startAt)));
    }
    return keys;
  }, [events]);

  const dayEvents = useMemo(
    () =>
      events.filter((c) => isSameCalendarDay(new Date(c.startAt), selectedDate)),
    [events, selectedDate],
  );

  const selectedLabel = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Calendar</Text>
        <Pressable
          onPress={() => router.push('/(instructor)/profile/availability')}
          hitSlop={8}>
          <Text style={[styles.manageLink, { color: colors.primary }]}>Manage availability</Text>
        </Pressable>
      </View>

      <View style={[styles.tabs, { backgroundColor: colors.surfaceMuted }]}>
        <Tab label="Upcoming" active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Tab label="Past" active={tab === 'past'} onPress={() => setTab('past')} />
      </View>

      <BookingsCalendar
        month={month}
        onMonthChange={setMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        markedDateKeys={markedDateKeys}
      />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>{selectedLabel}</Text>

      {allEvents.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No classes yet. Create one from the Classes tab.
        </Text>
      ) : events.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No {tab === 'upcoming' ? 'upcoming' : 'past'} classes in your schedule.
        </Text>
      ) : dayEvents.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No classes on this day. Select a highlighted date or switch tabs.
        </Text>
      ) : (
        dayEvents.map((c) => (
          <View
            key={c.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.time, { color: colors.primary }]}>{formatClassDate(c.startAt)}</Text>
            <Text style={[styles.eventTitle, { color: colors.text }]}>{c.title}</Text>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {c.modality === 'online' ? 'Online' : c.location?.label ?? 'In person'}
              {c.classFormat === 'individual' ? ' · 1-on-1' : ''}
              {c.spotsLeft != null ? ` · ${c.spotsLeft} spots left` : ''}
            </Text>
            <View style={styles.actions}>
              <Pressable onPress={() => router.push(`/class/${c.id}`)}>
                <Text style={[styles.link, { color: colors.primary }]}>View</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push({ pathname: '/edit-class/[id]', params: { id: c.id } })}>
                <Text style={[styles.link, { color: colors.primary }]}>Edit</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      style={[styles.tab, active && { backgroundColor: colors.surface }]}
      onPress={onPress}>
      <Text style={[styles.tabText, { color: colors.textMuted }, active && { color: colors.primary }]}>
        {label}
      </Text>
    </Pressable>
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
  manageLink: { fontSize: 14, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  tabText: { fontWeight: '600' },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  empty: { textAlign: 'center', marginBottom: Spacing.xl, lineHeight: 22 },
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  time: { fontSize: 13, fontWeight: '600' },
  eventTitle: { fontSize: 17, fontWeight: '700', marginTop: 4 },
  meta: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  link: { fontSize: 14, fontWeight: '600' },
});
