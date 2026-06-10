import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { formatMoney } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { getErrorMessage } from '@/services/api/errors';
import {
  fetchPayoutSummary,
  fetchPayoutsCsv,
  fetchRecentPayouts,
  type Payout,
  type PayoutSummary,
} from '@/services/api/payouts.api';
import { APP_LOCALE } from '@/utils/locale';

function formatPlanLabel(summary: PayoutSummary): string {
  const planName = summary.plan.charAt(0).toUpperCase() + summary.plan.slice(1);
  const feePct = Math.round(summary.commissionRate * 100);
  return `Plan ${planName} · ${feePct}% comisión de plataforma`;
}

function formatPayoutDate(iso: string): string {
  return new Date(iso).toLocaleDateString(APP_LOCALE, { month: 'short', day: 'numeric' });
}

export default function EarningsScreen() {
  const { colors } = useAppTheme();
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [summaryData, payoutRows] = await Promise.all([
        fetchPayoutSummary('month'),
        fetchRecentPayouts(),
      ]);
      setSummary(summaryData);
      setPayouts(payoutRows);
    } catch (err) {
      Alert.alert('No se pudieron cargar los ingresos', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const exportCsv = async () => {
    setExporting(true);
    try {
      const csv = await fetchPayoutsCsv();
      if (typeof navigator !== 'undefined' && typeof document !== 'undefined') {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'payouts.csv';
        link.click();
        URL.revokeObjectURL(url);
        return;
      }
      Alert.alert('Exportación lista', `Se exportaron ${csv.split('\n').length - 1} filas de cobros.`);
    } catch (err) {
      Alert.alert('Exportación fallida', getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Screen>
        <Text style={[styles.title, { color: colors.text }]}>Ingresos</Text>
        <ActivityIndicator style={{ marginTop: Spacing.xl }} color={colors.primary} />
      </Screen>
    );
  }

  const netDisplay = summary
    ? formatMoney({ amount: summary.net, currency: summary.currency })
    : '$0.00';

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Ingresos</Text>
      <View style={[styles.summary, { backgroundColor: colors.primary }]}>
        <Text style={styles.summaryLabel}>Este mes (neto)</Text>
        <Text style={styles.summaryValue}>{netDisplay}</Text>
        <Text style={styles.plan}>{summary ? formatPlanLabel(summary) : ''}</Text>
      </View>

      <Button
        title="Exportar CSV"
        variant="outline"
        size="sm"
        loading={exporting}
        onPress={exportCsv}
      />

      <Text style={[styles.section, { color: colors.text }]}>Cobros recientes</Text>
      {payouts.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          Todavía no hay reservas confirmadas. Los cobros aparecen cuando los atletas reservan tus clases.
        </Text>
      ) : (
        payouts.map((payout) => (
          <View
            key={payout.id}
            style={[styles.row, { backgroundColor: colors.surface }]}>
            <View>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {payout.classTitle ?? 'Reserva de clase'}
              </Text>
              <Text style={[styles.rowDate, { color: colors.textMuted }]}>
                {formatPayoutDate(payout.createdAt)}
              </Text>
            </View>
            <Text style={[styles.rowAmount, { color: colors.success }]}>
              {formatMoney(payout.amount)}
            </Text>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.md },
  summary: {
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  summaryLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  summaryValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: Spacing.sm },
  plan: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: Spacing.sm },
  section: { fontSize: 18, fontWeight: '700', marginVertical: Spacing.md },
  empty: { fontSize: 15, lineHeight: 22 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  rowTitle: { fontWeight: '600' },
  rowDate: { fontSize: 13, marginTop: 2 },
  rowAmount: { fontWeight: '700' },
});
