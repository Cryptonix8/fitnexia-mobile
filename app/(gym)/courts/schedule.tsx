import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CourtScheduleGrid } from '@/components/courts/court-schedule-grid';
import { FilterChip } from '@/components/ui/filter-chip';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchGymCourtSchedule } from '@/services/api/courts.api';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function GymCourtScheduleScreen() {
  const { colors } = useAppTheme();
  const [date, setDate] = useState(todayIso());
  const [schedule, setSchedule] = useState<Awaited<ReturnType<typeof fetchGymCourtSchedule>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setSchedule(await fetchGymCourtSchedule({ date }));
    } catch {
      setSchedule([]);
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load().finally(() => setLoading(false));
    }, [load]),
  );

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Disponibilidad en tiempo real" showBack />}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Vista por cancha y día. Los turnos en verde están libres; los rojos ya tienen reserva.
      </Text>

      <View style={styles.chips}>
        {dates.map((d) => (
          <FilterChip
            key={d}
            label={new Date(`${d}T12:00:00`).toLocaleDateString('es-UY', {
              weekday: 'short',
              day: 'numeric',
            })}
            active={date === d}
            onPress={() => setDate(d)}
          />
        ))}
      </View>

      <CourtScheduleGrid schedule={schedule} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
});
