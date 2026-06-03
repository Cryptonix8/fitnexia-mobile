import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

const TRANSACTIONS = [
  { id: '1', label: 'Tennis Fundamentals', amount: '$40.50', date: 'Jun 2' },
  { id: '2', label: 'Morning Flow Yoga', amount: '$21.25', date: 'May 28' },
  { id: '3', label: 'HIIT Burn', amount: '$12.75', date: 'May 25' },
];

export default function EarningsScreen() {
  return (
    <Screen scroll>
      <Text style={styles.title}>Earnings</Text>
      <View style={styles.summary}>
        <Text style={styles.summaryLabel}>This month (net)</Text>
        <Text style={styles.summaryValue}>$1,247.00</Text>
        <Text style={styles.plan}>Pro plan · 8% platform fee</Text>
      </View>

      <Button title="Export CSV" variant="outline" size="sm" />

      <Text style={styles.section}>Recent payouts</Text>
      {TRANSACTIONS.map((t) => (
        <View key={t.id} style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>{t.label}</Text>
            <Text style={styles.rowDate}>{t.date}</Text>
          </View>
          <Text style={styles.rowAmount}>{t.amount}</Text>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900, marginBottom: Spacing.md },
  summary: {
    backgroundColor: FitnexiaColors.primary,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  summaryLabel: { color: FitnexiaColors.primaryLight, fontSize: 14 },
  summaryValue: { color: FitnexiaColors.white, fontSize: 36, fontWeight: '800', marginTop: Spacing.sm },
  plan: { color: FitnexiaColors.primaryLight, fontSize: 13, marginTop: Spacing.sm },
  section: { fontSize: 18, fontWeight: '700', marginVertical: Spacing.md },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: FitnexiaColors.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
  },
  rowTitle: { fontWeight: '600', color: FitnexiaColors.gray900 },
  rowDate: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 2 },
  rowAmount: { fontWeight: '700', color: FitnexiaColors.success },
});
