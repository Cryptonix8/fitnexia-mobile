import { useLocalSearchParams, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import {
  createCourtReservationApi,
  fetchInstitutionCourtSchedule,
  quoteCourtPrice,
} from '@/services/api/courts.api';
import { formatMoney } from '@/data/mock';
import { getErrorMessage } from '@/services/api/errors';

export default function BookCourtScreen() {
  const { institutionId } = useLocalSearchParams<{ institutionId: string }>();
  const { colors } = useAppTheme();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [schedule, setSchedule] = useState<Awaited<ReturnType<typeof fetchInstitutionCourtSchedule>>>([]);
  const [selected, setSelected] = useState<{ courtId: string; startAt: string; endAt: string } | null>(
    null,
  );
  const [quote, setQuote] = useState<Awaited<ReturnType<typeof quoteCourtPrice>> | null>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  const load = useCallback(async () => {
    if (!institutionId) return;
    setLoading(true);
    try {
      setSchedule(await fetchInstitutionCourtSchedule(institutionId, { date }));
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

  const selectSlot = async (courtId: string, startAt: string, endAt: string) => {
    setSelected({ courtId, startAt, endAt });
    try {
      const durationMinutes = Math.round(
        (new Date(endAt).getTime() - new Date(startAt).getTime()) / 60000,
      );
      const q = await quoteCourtPrice({ courtId, startAt, durationMinutes });
      setQuote(q);
    } catch {
      setQuote(null);
    }
  };

  const confirm = async () => {
    if (!selected) return;
    setBooking(true);
    try {
      const durationMinutes = Math.round(
        (new Date(selected.endAt).getTime() - new Date(selected.startAt).getTime()) / 60000,
      );
      await createCourtReservationApi({
        courtId: selected.courtId,
        startAt: selected.startAt,
        durationMinutes,
      });
      Alert.alert('Reserva confirmada', 'Te enviamos la confirmación por notificación.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
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

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Reservar cancha" showBack />}>
      <View style={styles.chips}>
        {dates.map((d) => (
          <FilterChip
            key={d}
            label={new Date(`${d}T12:00:00`).toLocaleDateString('es-UY', { weekday: 'short', day: 'numeric' })}
            active={date === d}
            onPress={() => {
              setDate(d);
              setSelected(null);
              setQuote(null);
            }}
          />
        ))}
      </View>

      {schedule.map((day) => (
        <View key={day.court.id} style={{ marginBottom: Spacing.lg }}>
          <Text style={[styles.courtName, { color: colors.text }]}>{day.court.name}</Text>
          <View style={styles.slots}>
            {day.slots
              .filter((s) => s.available)
              .map((slot) => {
                const active =
                  selected?.courtId === day.court.id && selected.startAt === slot.startAt;
                return (
                  <Pressable
                    key={slot.startAt}
                    onPress={() => selectSlot(day.court.id, slot.startAt, slot.endAt)}
                    style={[
                      styles.slot,
                      {
                        backgroundColor: active ? colors.primary + '22' : colors.surface,
                        borderColor: active ? colors.primary : colors.border,
                      },
                    ]}>
                    <Text style={{ color: colors.text, fontSize: 12 }}>
                      {new Date(slot.startAt).toLocaleTimeString('es-UY', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Pressable>
                );
              })}
          </View>
        </View>
      ))}

      {quote ? (
        <View style={[styles.summary, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.text, fontWeight: '700' }}>
            Total: {formatMoney(quote.appliedPrice)}
            {quote.isMemberRate ? ' (tarifa socio)' : ''}
          </Text>
          <Button title="Confirmar reserva" onPress={confirm} loading={booking} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  courtName: { fontWeight: '700', fontSize: 16, marginBottom: Spacing.sm },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  slot: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 8 },
  summary: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.md },
});
