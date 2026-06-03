import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

const PLANS = [
  { id: 'basic', name: 'Basic', fee: 'Free', commission: '15%', active: false },
  { id: 'institutional', name: 'Institutional', fee: '$99/mo', commission: '5%', active: true },
];

export default function GymPlanScreen() {
  return (
    <Screen scroll>
      <Header title="Plan & commission" showBack />
      <Text style={styles.hint}>Institutional plans include instructor management and analytics.</Text>
      {PLANS.map((plan) => (
        <View key={plan.id} style={[styles.card, plan.active && styles.cardActive]}>
          <View style={styles.cardHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            {plan.active ? <Badge label="Current" variant="verified" /> : null}
          </View>
          <Text style={styles.meta}>Monthly: {plan.fee}</Text>
          <Text style={styles.meta}>Commission: {plan.commission} per transaction</Text>
        </View>
      ))}
      <Button title="Manage subscription (mock)" variant="outline" style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  card: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  cardActive: { borderColor: FitnexiaColors.primary },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 18, fontWeight: '700', color: FitnexiaColors.gray900 },
  meta: { fontSize: 14, color: FitnexiaColors.gray500, marginTop: 4 },
});
