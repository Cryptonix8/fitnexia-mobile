import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { LineChart } from '@/components/ui/line-chart';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { formatMoney } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import { getLinkedInstitutionId } from '@/utils/institution';
import {
  formatAttendanceRate,
  formatGymChange,
  formatRevenueCompact,
  getGymMetrics,
} from '@/utils/gym-metrics';

function formatRevenueAxis(cents: number): string {
  if (cents >= 100000) return `$${(cents / 100000).toFixed(1)}k`;
  return `$${Math.round(cents / 100)}`;
}

export default function GymMetricsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { classes } = useClasses();
  const institutionId = getLinkedInstitutionId(user);
  const metrics = getGymMetrics(institutionId, classes);

  const revenueSeries = metrics.daily.map((d) => ({
    label: d.label,
    value: d.revenueCents,
  }));

  const attendanceSeries = metrics.daily.map((d) => ({
    label: d.label,
    value: d.attendancePct,
  }));

  const bookingsSeries = metrics.daily.map((d) => ({
    label: d.label,
    value: d.bookings,
  }));

  return (
    <Screen scroll>
      <Text style={[styles.title, { color: colors.text }]}>Metrics</Text>
      <Text style={[styles.period, { color: colors.textMuted }]}>This week</Text>

      <View style={styles.statsRow}>
        <StatCard
          icon="calendar-outline"
          label="Bookings"
          value={String(metrics.bookings)}
          change={formatGymChange(metrics.bookingsChangePct)}
          colors={colors}
        />
        <StatCard
          icon="cash-outline"
          label="Revenue"
          value={formatRevenueCompact(metrics.revenueCents)}
          change={formatGymChange(metrics.revenueChangePct)}
          colors={colors}
        />
        <StatCard
          icon="people-outline"
          label="Attendance"
          value={formatAttendanceRate(metrics.attendanceRate)}
          change={formatGymChange(metrics.attendanceChangePct)}
          colors={colors}
        />
      </View>

      <Text style={[styles.section, { color: colors.text }]}>Revenue trend</Text>
      <LineChart
        chartId="revenue"
        data={revenueSeries}
        formatValue={formatRevenueAxis}
        formatTooltip={(p) => formatMoney({ amount: p.value, currency: 'USD' })}
        color={colors.primary}
        height={220}
      />

      <Text style={[styles.section, { color: colors.text }]}>Attendance trend</Text>
      <LineChart
        chartId="attendance"
        data={attendanceSeries}
        formatValue={(v) => formatAttendanceRate(v)}
        color={colors.accent}
        height={220}
      />

      <Text style={[styles.section, { color: colors.text }]}>Bookings trend</Text>
      <LineChart
        chartId="bookings"
        data={bookingsSeries}
        formatValue={(v) => String(Math.round(v))}
        color={colors.success}
        height={220}
      />

      <Text style={[styles.section, { color: colors.text }]}>Top classes</Text>
      {metrics.topClasses.map((c) => (
        <View
          key={c.title}
          style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.rowBody}>
            <Text style={[styles.rowName, { color: colors.text }]}>{c.title}</Text>
            <Text style={[styles.rowSub, { color: colors.textMuted }]}>
              {c.bookings} bookings
            </Text>
          </View>
          <Text style={[styles.rowVal, { color: colors.primary }]}>
            {formatAttendanceRate(c.attendancePct)}
          </Text>
        </View>
      ))}
    </Screen>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
  colors,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  change: string;
  colors: {
    surface: string;
    text: string;
    textMuted: string;
    primary: string;
    success: string;
  };
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={20} color={colors.primary} />
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statChange, { color: colors.success }]}>{change}</Text>
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
  statChange: { fontSize: 10, fontWeight: '600' },
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
