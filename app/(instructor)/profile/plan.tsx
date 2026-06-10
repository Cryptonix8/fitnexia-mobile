import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { SCREEN_TITLES } from '@/constants/labels';

const PLANS = [
  { id: 'basic', name: 'Basic', fee: 'Gratis', commission: '15%', active: false },
  { id: 'pro', name: 'Pro', fee: '$29/mes', commission: '8%', active: true },
];

export default function InstructorPlanScreen() {
  return (
    <Screen scroll>
      <Header title={SCREEN_TITLES.planCommission} showBack />
      <Text style={styles.hint}>La comisión de plataforma se descuenta automáticamente de cada cobro.</Text>
      {PLANS.map((plan) => (
        <View key={plan.id} style={[styles.card, plan.active && styles.cardActive]}>
          <View style={styles.cardHeader}>
            <Text style={styles.planName}>{plan.name}</Text>
            {plan.active ? <Badge label="Actual" variant="verified" /> : null}
          </View>
          <Text style={styles.meta}>Mensual: {plan.fee}</Text>
          <Text style={styles.meta}>Comisión: {plan.commission} por transacción</Text>
        </View>
      ))}
      <Button title="Mejorar plan (simulación)" variant="outline" style={{ marginTop: Spacing.md }} />
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
