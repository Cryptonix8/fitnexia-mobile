import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { COURT_RESERVATION_STATUS_LABELS } from '@/constants/courts';
import { LOADING_LABELS } from '@/constants/labels';
import {
  cancelCourtReservationApi,
  fetchMyCourtReservations,
  type CourtReservation,
} from '@/services/api/courts.api';
import { formatMoney } from '@/data/mock';
import { getErrorMessage } from '@/services/api/errors';

export default function MyCourtReservationsScreen() {
  const { colors } = useAppTheme();
  const [items, setItems] = useState<CourtReservation[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchMyCourtReservations());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const cancel = (item: CourtReservation) => {
    if (!item.canCancel) {
      Alert.alert(
        'No se puede cancelar',
        `Solo podés cancelar con reembolso hasta ${item.cancellationPolicyHours ?? 24} horas antes del turno.`,
      );
      return;
    }

    Alert.alert('Cancelar reserva', '¿Confirmás la cancelación?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelCourtReservationApi(item.id);
            load();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen
      scroll
      loading={loading && items.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Reservas de canchas" showBack />}>
      {items.length === 0 && !loading ? (
        <EmptyState
          icon="football-outline"
          title="Sin reservas de canchas"
          description="Cuando reserves una cancha, la verás acá con estado y opción de cancelar."
        />
      ) : (
        items.map((r) => (
          <View
            key={r.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.row}>
              <Text style={[styles.title, { color: colors.text }]}>{r.courtName}</Text>
              <Badge
                label={COURT_RESERVATION_STATUS_LABELS[r.status] ?? r.status}
                variant={r.status === 'confirmed' ? 'verified' : 'default'}
              />
            </View>
            {r.institutionName ? (
              <Text style={{ color: colors.textMuted }}>{r.institutionName}</Text>
            ) : null}
            <Text style={{ color: colors.textMuted }}>
              {new Date(r.startAt).toLocaleString('es-UY')} · {r.durationMinutes} min
            </Text>
            <Text style={{ color: colors.textMuted }}>
              {formatMoney(r.price)}
              {r.isMemberRate ? ' · Tarifa socio' : ''}
            </Text>
            {r.cancellationPolicyHours ? (
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                Cancelación con reembolso hasta {r.cancellationPolicyHours} h antes.
              </Text>
            ) : null}
            {r.canCancel ? (
              <Button title="Cancelar reserva" variant="secondary" onPress={() => cancel(r)} />
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  title: { fontSize: 16, fontWeight: '700', flex: 1 },
});
