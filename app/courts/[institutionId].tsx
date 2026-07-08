import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { CourtScheduleGrid } from '@/components/courts/court-schedule-grid';
import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { createCourtReservationApi, fetchInstitutionCourtSchedule, fetchInstitutionCourtSettings, quoteCourtPrice } from '@/services/api/courts.api';
import { createRecurringShiftApi } from '@/services/api/court-shifts.api';
import { formatMoney } from '@/data/mock';
import { getErrorMessage } from '@/services/api/errors';
import { openCourtPaymentCheckout } from '@/utils/court-payment';

export default function BookCourtScreen() {
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();
  const { colors } = useAppTheme();
  const integratedPayments = useFeature('integratedPayments');
  const fixedCourtShifts = useFeature('fixedCourtShifts');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [schedule, setSchedule] = useState<Awaited<ReturnType<typeof fetchInstitutionCourtSchedule>>>([]);
  const [settings, setSettings] = useState({ cancellationPolicyHours: 24, defaultSlotMinutes: 60 });
  const [selected, setSelected] = useState<{ courtId: string; startAt: string; endAt: string } | null>(null);
  const [durationMultiplier, setDurationMultiplier] = useState(1);
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof quoteCourtPrice>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const load = useCallback(async () => {
    if (!institutionId) return;
    setLoading(true);
    try {
      const [scheduleData, settingsData] = await Promise.all([
        fetchInstitutionCourtSchedule(institutionId, { date }),
        fetchInstitutionCourtSettings(institutionId),
      ]);
      setSchedule(scheduleData);
      setSettings(settingsData);
    } catch {
      setSchedule([]);
    } finally {
      setLoading(false);
    }
  }, [institutionId, date]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const slotMinutes = schedule[0]?.slotMinutes ?? settings.defaultSlotMinutes;
  const durationMinutes = slotMinutes * durationMultiplier;

  const refreshQuote = async (
    courtId: string,
    startAt: string,
    endAt: string,
    multiplier: number,
  ) => {
    const duration = slotMinutes * multiplier;
    try {
      const q = await quoteCourtPrice({ courtId, startAt, durationMinutes: duration });
      setQuote(q);
    } catch {
      setQuote(null);
    }
  };

  const selectSlot = async (courtId: string, startAt: string, endAt: string) => {
    setSelected({ courtId, startAt, endAt });
    setDurationMultiplier(1);
    await refreshQuote(courtId, startAt, endAt, 1);
  };

  const confirm = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      const result = await createCourtReservationApi({
        courtId: selected.courtId,
        startAt: selected.startAt,
        durationMinutes,
      });

      if (result.checkoutUrl) {
        await openCourtPaymentCheckout(result.checkoutUrl, result.reservation.id);
      }

      Alert.alert(
        'Reserva confirmada',
        'Te enviamos la confirmación por notificación y email.',
        [{ text: 'OK', onPress: () => router.replace('/(athlete)/courts/reservations') }],
      );
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setBooking(false);
    }
  };

  const activateFixedShift = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      const start = new Date(selected.startAt);
      await createRecurringShiftApi({
        courtId: selected.courtId,
        weekday: start.getDay(),
        startTime: `${String(start.getHours()).padStart(2, '0')}:${String(start.getMinutes()).padStart(2, '0')}:00`,
        durationMinutes,
      });
      Alert.alert(
        'Turno fijo activado',
        'Cada semana generaremos tu reserva automáticamente y te avisaremos para pagar.',
        [{ text: 'Ver turnos fijos', onPress: () => router.push('/(athlete)/courts/recurring-shifts') }],
      );
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setBooking(false);
    }
  };

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  const durationOptions = [1, 2, 3].filter((m) => m * slotMinutes <= 180);

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Reservar cancha" showBack />}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Elegí fecha, cancha y horario. Los socios del club ven tarifa preferencial automáticamente.
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
            onPress={() => {
              setDate(d);
              setSelected(null);
              setQuote(null);
            }}
          />
        ))}
      </View>

      <CourtScheduleGrid
        schedule={schedule}
        selectable
        selected={selected ? { courtId: selected.courtId, startAt: selected.startAt } : null}
        onSelectSlot={selectSlot}
      />

      {selected && quote ? (
        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.summaryTitle, { color: colors.text }]}>Resumen</Text>
          <Text style={{ color: colors.textMuted }}>
            Duración del turno: {slotMinutes} min c/u
          </Text>

          {durationOptions.length > 1 ? (
            <View style={styles.chips}>
              {durationOptions.map((m) => (
                <FilterChip
                  key={m}
                  label={`${m} turno${m > 1 ? 's' : ''} (${m * slotMinutes} min)`}
                  active={durationMultiplier === m}
                  onPress={async () => {
                    setDurationMultiplier(m);
                    await refreshQuote(selected.courtId, selected.startAt, selected.endAt, m);
                  }}
                />
              ))}
            </View>
          ) : null}

          <Text style={{ color: colors.text }}>
            Total: {formatMoney(quote.appliedPrice)}
            {quote.isMemberRate ? ' (tarifa socio)' : ''}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Socio: {formatMoney(quote.memberPrice)} · No socio: {formatMoney(quote.nonMemberPrice)}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 13 }}>
            Cancelación con reembolso hasta {quote.cancellationPolicyHours} h antes del turno.
          </Text>
          <Button
            title={integratedPayments ? 'Pagar y confirmar' : 'Confirmar reserva'}
            onPress={confirm}
            loading={booking}
          />
          {fixedCourtShifts ? (
            <Button
              title="Activar turno fijo semanal"
              variant="outline"
              onPress={activateFixedShift}
              loading={booking}
            />
          ) : null}
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  summary: { borderWidth: 1, borderRadius: 12, padding: Spacing.md, gap: Spacing.sm, marginTop: Spacing.md },
  summaryTitle: { fontSize: 16, fontWeight: '700' },
});
