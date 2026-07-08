import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { FilterChip } from '@/components/ui/filter-chip';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { COURT_RESERVATION_STATUS_LABELS } from '@/constants/courts';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchGymCourtReservations } from '@/services/api/courts.api';
import { formatMoney } from '@/data/mock';

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function GymCourtReservationsScreen() {
  const { colors } = useAppTheme();
  const [date, setDate] = useState(todayIso());
  const [items, setItems] = useState<Awaited<ReturnType<typeof fetchGymCourtReservations>>>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await fetchGymCourtReservations({ date }));
    } catch {
      setItems([]);
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
      header={<Header title="Reservas de canchas" showBack />}>
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

      {items.length === 0 && !loading ? (
        <EmptyState icon="calendar-outline" title="Sin reservas este día" />
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
            <Text style={{ color: colors.textMuted }}>
              {new Date(r.startAt).toLocaleString('es-UY')} · {r.durationMinutes} min
            </Text>
            <Text style={{ color: colors.textMuted }}>
              {formatMoney(r.price)}
              {r.isMemberRate ? ' · Tarifa socio' : ' · Tarifa no socio'}
            </Text>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.sm },
  title: { fontSize: 16, fontWeight: '700', flex: 1 },
});
