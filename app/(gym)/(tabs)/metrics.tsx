import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

const BARS = [
  { label: 'Mon', pct: 0.65 },
  { label: 'Tue', pct: 0.82 },
  { label: 'Wed', pct: 0.45 },
  { label: 'Thu', pct: 0.9 },
  { label: 'Fri', pct: 0.78 },
  { label: 'Sat', pct: 0.95 },
  { label: 'Sun', pct: 0.55 },
];

export default function GymMetricsScreen() {
  return (
    <Screen scroll>
      <Text style={styles.title}>Metrics</Text>
      <Text style={styles.period}>This week</Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>Occupancy rate</Text>
        <Text style={styles.cardValue}>78%</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Retention</Text>
        <Text style={styles.cardValue}>67%</Text>
      </View>

      <Text style={styles.section}>Occupancy by day</Text>
      <View style={styles.chart}>
        {BARS.map((b) => (
          <View key={b.label} style={styles.barCol}>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { height: `${b.pct * 100}%` }]} />
            </View>
            <Text style={styles.barLabel}>{b.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.section}>Top classes</Text>
      <View style={styles.row}>
        <Text style={styles.rowName}>Group CrossFit</Text>
        <Text style={styles.rowVal}>100%</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.rowName}>Evening Pilates</Text>
        <Text style={styles.rowVal}>85%</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800' },
  period: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  card: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardLabel: { fontSize: 14, color: FitnexiaColors.gray500 },
  cardValue: { fontSize: 28, fontWeight: '800', color: FitnexiaColors.primary, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.md },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 140,
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'flex-end',
  },
  barCol: { flex: 1, alignItems: 'center' },
  barBg: {
    width: 24,
    height: 100,
    backgroundColor: FitnexiaColors.gray100,
    borderRadius: 4,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: { width: '100%', backgroundColor: FitnexiaColors.primary, borderRadius: 4 },
  barLabel: { fontSize: 11, color: FitnexiaColors.gray500, marginTop: 6 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: FitnexiaColors.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  rowName: { fontWeight: '600' },
  rowVal: { color: FitnexiaColors.primary, fontWeight: '700' },
});
