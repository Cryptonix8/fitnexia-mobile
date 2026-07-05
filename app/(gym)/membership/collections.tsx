import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchCollectionsPanel } from '@/services/api/metrics.api';
import type { CollectionsPanel } from '@/services/api/metrics.api';
import { formatMoney } from '@/data/mock';

export default function CollectionsPanelScreen() {
  const { colors } = useAppTheme();
  const [panel, setPanel] = useState<CollectionsPanel | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCollectionsPanel()
        .then(setPanel)
        .catch(() => setPanel(null))
        .finally(() => setLoading(false));
    }, []),
  );

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Cobranzas del club" showBack />}>
      {!panel ? (
        <EmptyState icon="cash-outline" title="Sin datos de cobranza" />
      ) : (
        <>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Este mes</Text>
            <Text style={[styles.amount, { color: colors.primary }]}>
              {formatMoney(panel.month.collected)}
            </Text>
            <Text style={[styles.sub, { color: colors.textMuted }]}>
              Esperado: {formatMoney(panel.month.expected)} ·{' '}
              {Math.round(panel.month.collectionRate * 100)}% cobrado
            </Text>
          </View>

          <View style={styles.row}>
            <Stat label="Al día" value={String(panel.summary.upToDate)} colors={colors} />
            <Stat label="Pendientes" value={String(panel.summary.pending)} colors={colors} />
            <Stat label="Morosos" value={String(panel.summary.overdue)} colors={colors} />
          </View>

          <Text style={[styles.section, { color: colors.text }]}>Pagos del mes</Text>
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            {panel.month.paymentsCount} aprobados · {panel.month.pendingCount} pendientes ·{' '}
            {panel.month.failedCount} rechazados
          </Text>

          <Button
            title="Ver socios"
            variant="secondary"
            onPress={() => router.push('/(gym)/(tabs)/members')}
          />
        </>
      )}
    </Screen>
  );
}

function Stat({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { surface: string; text: string; border: string };
}) {
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.text, fontSize: 12 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.lg, marginBottom: Spacing.md },
  cardTitle: { fontSize: 14, fontWeight: '600' },
  amount: { fontSize: 32, fontWeight: '800', marginTop: Spacing.sm },
  sub: { marginTop: Spacing.xs, fontSize: 14 },
  row: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  stat: {
    flex: 1,
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    alignItems: 'center',
  },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.xs },
  meta: { fontSize: 14, marginBottom: Spacing.lg },
});
