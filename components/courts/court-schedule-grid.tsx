import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import type { CourtScheduleDay } from '@/services/api/courts.api';

type Props = {
  schedule: CourtScheduleDay[];
  selectable?: boolean;
  selected?: { courtId: string; startAt: string } | null;
  onSelectSlot?: (courtId: string, startAt: string, endAt: string) => void;
};

export function CourtScheduleGrid({ schedule, selectable, selected, onSelectSlot }: Props) {
  const { colors } = useAppTheme();

  if (!schedule.length) {
    return (
      <Text style={{ color: colors.textMuted, marginBottom: Spacing.lg }}>
        No hay canchas activas o sin horario para este día.
      </Text>
    );
  }

  return (
    <>
      <View style={styles.legend}>
        <LegendDot color={colors.success} label="Libre" textColor={colors.textMuted} />
        <LegendDot color={colors.error} label="Ocupado" textColor={colors.textMuted} />
        {selectable ? (
          <LegendDot color={colors.primary} label="Seleccionado" textColor={colors.textMuted} />
        ) : null}
      </View>

      {schedule.map((day) => (
        <View key={day.court.id} style={styles.courtBlock}>
          <Text style={[styles.courtName, { color: colors.text }]}>{day.court.name}</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            Turnos de {day.slotMinutes} min
          </Text>
          <View style={styles.slots}>
            {day.slots.map((slot) => {
              const isSelected =
                selected?.courtId === day.court.id && selected.startAt === slot.startAt;
              const bg = !slot.available
                ? colors.error + '18'
                : isSelected
                  ? colors.primary + '22'
                  : colors.success + '18';
              const border = !slot.available
                ? colors.error
                : isSelected
                  ? colors.primary
                  : colors.success;

              const content = (
                <View style={[styles.slot, { backgroundColor: bg, borderColor: border }]}>
                  <Text style={[styles.slotTime, { color: colors.text }]}>
                    {new Date(slot.startAt).toLocaleTimeString('es-UY', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                  <Text style={[styles.slotStatus, { color: colors.textMuted }]}>
                    {!slot.available ? 'Ocupado' : isSelected ? 'Elegido' : 'Libre'}
                  </Text>
                </View>
              );

              if (!selectable || !slot.available) {
                return <View key={slot.startAt}>{content}</View>;
              }

              return (
                <Pressable
                  key={slot.startAt}
                  onPress={() => onSelectSlot?.(day.court.id, slot.startAt, slot.endAt)}>
                  {content}
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </>
  );
}

function LegendDot({
  color,
  label,
  textColor,
}: {
  color: string;
  label: string;
  textColor: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={{ color: textColor, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, marginBottom: Spacing.lg },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  courtBlock: { marginBottom: Spacing.lg },
  courtName: { fontSize: 17, fontWeight: '700' },
  meta: { fontSize: 13, marginBottom: Spacing.sm },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot: {
    minWidth: 84,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  slotTime: { fontSize: 14, fontWeight: '700' },
  slotStatus: { fontSize: 11, marginTop: 2 },
});
