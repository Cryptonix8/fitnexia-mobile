import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { getErrorMessage } from '@/services/api/errors';
import {
  cancelRecurringShiftApi,
  fetchMyRecurringShifts,
  type CourtRecurringShift,
} from '@/services/api/court-shifts.api';

export default function RecurringShiftsScreen() {
  const { colors } = useAppTheme();
  const [shifts, setShifts] = useState<CourtRecurringShift[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyRecurringShifts();
      setShifts(data);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
      setShifts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const cancelShift = (shift: CourtRecurringShift) => {
    Alert.alert(
      'Cancelar turno fijo',
      `¿Dejar de reservar cada ${shift.weekdayLabel} a las ${shift.startTime}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelRecurringShiftApi(shift.id);
              await load();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            }
          },
        },
      ],
    );
  };

  const activeShifts = shifts.filter((s) => s.active);
  const inactiveShifts = shifts.filter((s) => !s.active);

  return (
    <Screen
      scroll
      loading={loading && shifts.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Turnos fijos" showBack />}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Reservá el mismo horario cada semana sin elegirlo de nuevo. Generamos la reserva automáticamente
        y te avisamos para completar el pago.
      </Text>

      {activeShifts.length === 0 && !loading ? (
        <EmptyState
          icon="repeat-outline"
          title="Sin turnos fijos"
          description="Al reservar una cancha, activá «Turno fijo semanal» para repetir el mismo horario cada semana."
        />
      ) : null}

      {activeShifts.map((shift) => (
        <View
          key={shift.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardTop}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primaryMuted }]}>
              <Ionicons name="repeat" size={22} color={colors.primary} />
            </View>
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>{shift.label}</Text>
              <Text style={{ color: colors.textMuted }}>
                {shift.courtName} · {shift.institutionName}
              </Text>
              <Text style={[styles.schedule, { color: colors.text }]}>
                Cada {shift.weekdayLabel} · {shift.startTime} · {shift.durationMinutes} min
              </Text>
              {shift.groupLabel ? (
                <Text style={{ color: colors.textMuted, fontSize: 13 }}>Grupo: {shift.groupLabel}</Text>
              ) : null}
              {shift.nextOccurrenceAt ? (
                <Text style={{ color: colors.primary, fontSize: 13, marginTop: 4 }}>
                  Próximo:{' '}
                  {new Date(shift.nextOccurrenceAt).toLocaleString('es-UY', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              ) : null}
            </View>
          </View>
          <Button title="Cancelar turno fijo" variant="outline" onPress={() => cancelShift(shift)} />
        </View>
      ))}

      {inactiveShifts.length > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.textMuted }]}>Historial</Text>
          {inactiveShifts.map((shift) => (
            <View
              key={shift.id}
              style={[styles.cardMuted, { backgroundColor: colors.surfaceMuted }]}>
              <Text style={{ color: colors.textMuted }}>
                {shift.label} — cancelado
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.lg },
  section: { fontSize: 13, fontWeight: '600', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  cardMuted: { borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  cardTop: { flexDirection: 'row', gap: Spacing.md },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, gap: 2 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  schedule: { fontSize: 14, fontWeight: '600', marginTop: 4 },
});
