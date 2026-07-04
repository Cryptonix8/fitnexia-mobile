import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import {
  WEEKDAYS_MON_FIRST,
  weekdayLabel,
  weekdayShortLabel,
} from '@/utils/schedule';

type RecurringClassSectionProps = {
  enabled: boolean;
  selectedWeekdays: number[];
  startDate: Date;
  onToggle: (enabled: boolean) => void;
  onToggleWeekday: (weekday: number) => void;
};

function formatStartDateHint(date: Date): string {
  const weekday = weekdayLabel(date.getDay());
  const day = date.getDate();
  const month = date.toLocaleDateString('es-UY', { month: 'short' }).replace('.', '');
  return `${weekday} ${day} ${month}`;
}

export function RecurringClassSection({
  enabled,
  selectedWeekdays,
  startDate,
  onToggle,
  onToggleWeekday,
}: RecurringClassSectionProps) {
  const { colors } = useAppTheme();
  const startWeekday = startDate.getDay();
  const startAligned = selectedWeekdays.includes(startWeekday);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.toggleRow}>
        <View style={styles.toggleCopy}>
          <Text style={[styles.title, { color: colors.text }]}>Clase recurrente</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Misma clase cada semana, sin fecha de fin
          </Text>
        </View>
        <Switch
          value={enabled}
          onValueChange={onToggle}
          trackColor={{ true: colors.primaryMuted, false: colors.border }}
          thumbColor={enabled ? colors.primary : colors.textMuted}
        />
      </View>

      {enabled ? (
        <View style={[styles.expanded, { borderTopColor: colors.border }]}>
          <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
            Días de la semana
          </Text>
          <View style={styles.weekdayRow}>
            {WEEKDAYS_MON_FIRST.map((day) => {
              const active = selectedWeekdays.includes(day);
              const isStartDay = day === startWeekday;
              return (
                <Pressable
                  key={day}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  accessibilityLabel={weekdayLabel(day)}
                  onPress={() => onToggleWeekday(day)}
                  style={[
                    styles.dayCircle,
                    {
                      backgroundColor: active ? colors.primary : colors.surfaceMuted,
                      borderColor: isStartDay && active ? colors.primary : colors.border,
                    },
                    isStartDay && styles.startDayCircle,
                  ]}>
                  <Text
                    style={[
                      styles.dayLetter,
                      { color: active ? colors.onPrimary : colors.textSecondary },
                    ]}>
                    {weekdayShortLabel(day)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={[styles.hint, { color: colors.textMuted }]}>
            El horario de arriba aplica a todos los días seleccionados.
          </Text>
          <Text
            style={[
              styles.hint,
              { color: startAligned ? colors.textMuted : colors.error },
            ]}>
            {startAligned
              ? `Primera clase: ${formatStartDateHint(startDate)}`
              : `La fecha de inicio (${formatStartDateHint(startDate)}) debe coincidir con un día seleccionado.`}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  toggleCopy: { flex: 1 },
  title: { fontSize: 16, fontWeight: '600' },
  subtitle: { fontSize: 13, lineHeight: 18, marginTop: 2 },
  expanded: { marginTop: Spacing.md, paddingTop: Spacing.md, borderTopWidth: StyleSheet.hairlineWidth },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: Spacing.sm },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startDayCircle: {
    borderWidth: 2,
  },
  dayLetter: { fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 13, lineHeight: 18, marginTop: Spacing.xs },
});
