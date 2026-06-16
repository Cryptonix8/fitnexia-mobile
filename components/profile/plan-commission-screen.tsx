import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { Radius, Spacing } from '@/constants/fitnexia';
import { SCREEN_TITLES } from '@/constants/labels';
import { fetchPlans, type PlanConfig } from '@/services/api/config.api';
import { getErrorMessage } from '@/services/api/errors';
import type { InstructorPlan } from '@/types/api';
import { APP_LOCALE } from '@/utils/locale';

function formatMonthlyFee(cents: number, currency = DEFAULT_CURRENCY) {
  if (cents === 0) return 'Gratis';
  try {
    return `${new Intl.NumberFormat(APP_LOCALE, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(cents / 100)}/mes`;
  } catch {
    return `$${(cents / 100).toFixed(0)}/mes`;
  }
}

type PlanCommissionScreenProps = {
  currentPlan: InstructorPlan;
  hint: string;
  planIds?: InstructorPlan[];
};

export function PlanCommissionScreen({ currentPlan, hint, planIds }: PlanCommissionScreenProps) {
  const { colors } = useAppTheme();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPlans();
        if (!cancelled) {
          setPlans(planIds ? data.filter((plan) => planIds.includes(plan.id)) : data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError(getErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [planIds]);

  return (
    <Screen scroll>
      <Header title={SCREEN_TITLES.planCommission} showBack />
      <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : error ? (
        <Text style={{ color: colors.error }}>{error}</Text>
      ) : (
        plans.map((plan) => {
          const active = plan.id === currentPlan;
          return (
            <View
              key={plan.id}
              style={[
                styles.card,
                { backgroundColor: colors.surface, borderColor: active ? colors.primary : colors.border },
                active && styles.cardActive,
              ]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
                {active ? <Badge label="Actual" variant="verified" /> : null}
              </View>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                Mensual: {formatMonthlyFee(plan.monthlyFeeCents)}
              </Text>
              <Text style={[styles.meta, { color: colors.textMuted }]}>
                Comisión: {plan.commissionPercent}% por transacción
              </Text>
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg },
  card: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
  },
  cardActive: {},
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontSize: 18, fontWeight: '700' },
  meta: { fontSize: 14, marginTop: 4 },
});
