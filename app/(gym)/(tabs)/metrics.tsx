import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { LineChart } from '@/components/ui/line-chart';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { formatMoney } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchInstitutionMetrics, type InstitutionMetrics } from '@/services/api/metrics.api';

function formatAttendanceRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

function formatRevenueCompact(cents: number): string {
  if (cents >= 100000) return `$${Math.round(cents / 100000)}k`;
  return formatMoney({ amount: cents, currency: DEFAULT_CURRENCY });
}

export default function GymMetricsScreen() {
  const { colors } = useAppTheme();
  const [metrics, setMetrics] = useState<InstitutionMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchInstitutionMetrics('week')
        .then(setMetrics)
        .catch(() => setMetrics(null))
        .finally(() => setLoading(false));
    }, []),
  );

  if (!metrics) {
    return (
      <Screen loading={loading} loadingMessage={LOADING_LABELS.default}>
        <Text style={{ color: colors.textMuted }}>No hay métricas disponibles</Text>
      </Screen>
    );
  }

  const revenueSeries = metrics.daily.map((d) => ({
    label: d.date.slice(5),
    value: d.revenueCents,
  }));

  const bookingsSeries = metrics.daily.map((d) => ({
    label: d.date.slice(5),
    value: d.bookings,
  }));

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={
        <>
          <Text style={[styles.title, { color: colors.text }]}>Métricas</Text>
          <Text style={[styles.period, { color: colors.textMuted }]}>Esta semana</Text>
        </>
      }>
      <View style={styles.statsRow}>
        <StatCard
          icon="calendar-outline"
          label="Reservas"
          value={String(metrics.bookings)}
          colors={colors}
        />
        <StatCard
          icon="cash-outline"
          label="Ingresos"
          value={formatRevenueCompact(metrics.revenue.amount)}
          colors={colors}
        />
        <StatCard
          icon="people-outline"
          label="Ocupación"
          value={formatAttendanceRate(metrics.occupancyRate)}
          colors={colors}
        />
      </View>

      {metrics.retentionRate != null ? (
        <View style={[styles.retention, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted }}>Retención de atletas</Text>
          <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }}>
            {formatAttendanceRate(metrics.retentionRate)}
          </Text>
        </View>
      ) : null}

      <Text style={[styles.section, { color: colors.text }]}>Ingresos por día</Text>
      <LineChart
        chartId="revenue"
        data={revenueSeries}
        formatValue={formatRevenueCompact}
        formatTooltip={(p) => formatMoney({ amount: p.value, currency: DEFAULT_CURRENCY })}
        color={colors.primary}
        height={220}
      />

      <Text style={[styles.section, { color: colors.text }]}>Reservas por día</Text>
      <LineChart
        chartId="bookings"
        data={bookingsSeries}
        formatValue={(v) => String(Math.round(v))}
        color={colors.success}
        height={220}
      />

      <Text style={[styles.section, { color: colors.text }]}>Clases destacadas</Text>
      {metrics.topClasses.map((c) => (
        <View
          key={c.title}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBody}>
            <Text style={[styles.rowName, { color: colors.text }]}>{c.title}</Text>
            <Text style={[styles.rowSub, { color: colors.textMuted }]}>{c.bookings} reservas</Text>
          </View>
          <Text style={[styles.rowVal, { color: colors.primary }]}>
            {formatAttendanceRate(c.occupancyRate)}
          </Text>
        </View>
      ))}

      {(metrics.topInstructors?.length ?? 0) > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Instructores</Text>
          {metrics.topInstructors!.map((i) => (
            <View
              key={i.name}
              style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.rowBody}>
                <Text style={[styles.rowName, { color: colors.text }]}>{i.name}</Text>
                <Text style={[styles.rowSub, { color: colors.textMuted }]}>{i.bookings} clases</Text>
              </View>
              <Text style={[styles.rowVal, { color: colors.primary }]}>
                {formatRevenueCompact(i.revenueCents)}
              </Text>
            </View>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

function StatCard({
  icon,
  label,
  value,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: {
    surface: string;
    text: string;
    textMuted: string;
    primary: string;
  };
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800' },
  period: { fontSize: 15, marginBottom: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  statLabel: { fontSize: 12, marginTop: Spacing.xs },
  statValue: { fontSize: 22, fontWeight: '800' },
  retention: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  section: { fontSize: 18, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  rowBody: { flex: 1 },
  rowName: { fontWeight: '600' },
  rowSub: { fontSize: 12, marginTop: 2 },
  rowVal: { fontWeight: '700' },
});
