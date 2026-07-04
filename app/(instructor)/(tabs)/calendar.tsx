import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BookingsCalendar } from '@/components/bookings-calendar';
import { RecurringClassBadge } from '@/components/recurring-class-badge';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, LOADING_LABELS, modalityLocationLabel } from '@/constants/labels';
import { formatClassDate } from '@/data/mock';
import type { ClassListItem } from '@/types/api';
import { startOfMonth, toDateKey } from '@/utils/calendar';
import { getLinkedInstructorId } from '@/utils/instructor';
import { APP_LOCALE } from '@/utils/locale';
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
  const { getClassesByInstructor, isLoading } = useClasses();
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

  const selectedLabel = selectedDate.toLocaleDateString(APP_LOCALE, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Screen
      scroll
      loading={isLoading && allEvents.length === 0}
      loadingMessage={LOADING_LABELS.classes}
      header={
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Calendario</Text>
          <Pressable
            onPress={() => router.push('/(instructor)/profile/availability')}
            hitSlop={8}>
            <Text style={[styles.manageLink, { color: colors.primary }]}>Gestionar disponibilidad</Text>
          </Pressable>
        </View>
      }>

      <View style={[styles.tabs, { backgroundColor: colors.surfaceMuted }]}>
        <Tab label="Próximas" active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Tab label="Pasadas" active={tab === 'past'} onPress={() => setTab('past')} />
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
        <EmptyState
          icon="calendar-outline"
          title="Todavía no tenés clases"
          description="Creá una clase desde la pestaña Clases o con el botón de abajo."
        />
      ) : events.length === 0 ? (
        <EmptyState
          compact
          icon="calendar-outline"
          title={tab === 'upcoming' ? 'Sin clases próximas' : 'Sin clases pasadas'}
          description={
            tab === 'upcoming'
              ? 'No tenés clases próximas en tu agenda.'
              : 'No tenés clases pasadas en tu agenda.'
          }
        />
      ) : dayEvents.length === 0 ? (
        <EmptyState
          compact
          icon="today-outline"
          title="Nada este día"
          description="Seleccioná una fecha marcada en el calendario o cambiá de pestaña."
        />
      ) : (
        dayEvents.map((c) => (
          <View
            key={c.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.time, { color: colors.primary }]}>{formatClassDate(c.startAt)}</Text>
            <View style={styles.eventTitleRow}>
              <Text style={[styles.eventTitle, { color: colors.text }]}>{c.title}</Text>
              <RecurringClassBadge item={c} compact />
            </View>
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              {modalityLocationLabel(c.modality, c.location?.label)}
              {c.classFormat === 'individual' ? ' · 1 a 1' : ''}
              {c.spotsLeft != null ? ` · ${c.spotsLeft} lugares disponibles` : ''}
            </Text>
            <View style={styles.actions}>
              <Pressable onPress={() => router.push(`/class/${c.id}`)}>
                <Text style={[styles.link, { color: colors.primary }]}>Ver</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push({ pathname: '/edit-class/[id]', params: { id: c.id } })}>
                <Text style={[styles.link, { color: colors.primary }]}>{BUTTON_LABELS.edit}</Text>
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
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  time: { fontSize: 13, fontWeight: '600' },
  eventTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: 4,
  },
  eventTitle: { fontSize: 17, fontWeight: '700', flexShrink: 1 },
  meta: { fontSize: 14, marginTop: 4, lineHeight: 20 },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  link: { fontSize: 14, fontWeight: '600' },
});
