import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { FilterChip } from '@/components/ui/filter-chip';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
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
    setLoading(true);
    try {
      setSchedule(await fetchGymCourtSchedule({ date }));
    } catch {
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useFocusEffect(
    useCallback(() => {
      load();
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
      header={<Header title="Disponibilidad" showBack />}>
      <View style={styles.chips}>
        {dates.map((d) => (
          <FilterChip
            key={d}
            label={new Date(`${d}T12:00:00`).toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric' })}
            active={date === d}
            onPress={() => setDate(d)}
          />
        ))}
      </View>

      {schedule.map((day) => (
        <View key={day.court.id} style={{ marginBottom: Spacing.lg }}>
          <Text style={[styles.courtName, { color: colors.text }]}>{day.court.name}</Text>
          <View style={styles.slots}>
            {day.slots.map((slot) => (
              <View
                key={slot.startAt}
                style={[
                  styles.slot,
                  {
                    backgroundColor: slot.available ? colors.success + '22' : colors.error + '22',
                    borderColor: slot.available ? colors.success : colors.error,
                  },
                ]}>
                <Text style={{ color: colors.text, fontSize: 12 }}>
                  {new Date(slot.startAt).toLocaleTimeString('es-UY', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  courtName: { fontWeight: '700', fontSize: 16, marginBottom: Spacing.sm },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  slot: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
