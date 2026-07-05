import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
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

  const cancel = (id: string) => {
    Alert.alert('Cancelar reserva', '¿Confirmás la cancelación?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelCourtReservationApi(id);
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
        <EmptyState icon="football-outline" title="Sin reservas de canchas" />
      ) : (
        items.map((r) => (
          <View
            key={r.id}
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{r.courtName}</Text>
            <Text style={{ color: colors.textMuted }}>
              {new Date(r.startAt).toLocaleString('es-UY')} · {formatMoney(r.price)}
            </Text>
            <Text style={{ color: colors.textMuted, marginTop: 4 }}>Estado: {r.status}</Text>
            {['confirmed', 'pending_payment'].includes(r.status) ? (
              <Button title="Cancelar" variant="secondary" onPress={() => cancel(r.id)} />
            ) : null}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.sm, gap: Spacing.sm },
});
