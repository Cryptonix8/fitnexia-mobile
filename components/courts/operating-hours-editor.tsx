import { Switch, StyleSheet, Text, View } from 'react-native';

import { DateTimeField } from '@/components/date-time-field';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import type { OpeningHours } from '@/types/api';
import {
  OPENING_HOUR_KEYS,
  OPENING_HOUR_LABELS,
  type OpeningHourKey,
  patchOperatingHour,
} from '@/utils/court-hours';
import { dateToTimeString, timeStringToDate } from '@/utils/schedule';

type Props = {
  value: OpeningHours;
  onChange: (hours: OpeningHours) => void;
};

export function OperatingHoursEditor({ value, onChange }: Props) {
  const { colors } = useAppTheme();

  const toggleDay = (key: OpeningHourKey, enabled: boolean) => {
    onChange(patchOperatingHour(value, key, { closed: !enabled }));
  };

  const updateTime = (key: OpeningHourKey, field: 'open' | 'close', date: Date) => {
    onChange(patchOperatingHour(value, key, { [field]: dateToTimeString(date) }));
  };

  return (
    <View style={styles.wrap}>
      {OPENING_HOUR_KEYS.map((key) => {
        const day = value[key];
        const enabled = !day?.closed;
        return (
          <View
            key={key}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.header}>
              <Text style={[styles.day, { color: colors.text }]}>{OPENING_HOUR_LABELS[key]}</Text>
              <Switch value={enabled} onValueChange={(v) => toggleDay(key, v)} />
            </View>
            {enabled ? (
              <View style={styles.times}>
                <DateTimeField
                  label="Apertura"
                  mode="time"
                  value={timeStringToDate(day?.open ?? '08:00')}
                  onChange={(d) => updateTime(key, 'open', d)}
                />
                <DateTimeField
                  label="Cierre"
                  mode="time"
                  value={timeStringToDate(day?.close ?? '22:00')}
                  onChange={(d) => updateTime(key, 'close', d)}
                />
              </View>
            ) : (
              <Text style={{ color: colors.textMuted, fontSize: 13 }}>Cerrado</Text>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm, marginBottom: Spacing.md },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  day: { fontSize: 16, fontWeight: '700' },
  times: { marginTop: Spacing.sm, gap: Spacing.sm },
});
