import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { Radius, Spacing } from '@/constants/fitnexia';
import { SCREEN_TITLES } from '@/constants/labels';
import { fetchPlans, type PlanConfig } from '@/services/api/config.api';
import { getErrorMessage } from '@/services/api/errors';
import type { InstructorPlan } from '@/types/api';
import { APP_LOCALE } from '@/utils/locale';
import {
  changeInstructorPlan,
  restoreInstructorApplePurchases,
} from '@/utils/instructor-plan-purchase';

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
  const { refreshUser } = useAuth();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isIos = Platform.OS === 'ios';

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

  const selectPlan = async (planId: InstructorPlan) => {
    if (planId === currentPlan || busy) return;
    setBusy(true);
    try {
      const result = await changeInstructorPlan(planId, refreshUser);
      Alert.alert('Plan', result.message);
    } catch (err) {
      Alert.alert('No se pudo cambiar el plan', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const restore = async () => {
    setBusy(true);
    try {
      const count = await restoreInstructorApplePurchases(refreshUser);
      Alert.alert(
        'Restaurar compras',
        count > 0
          ? `Se restauraron ${count} suscripción(es).`
          : 'No hay suscripciones de Fitnexia para restaurar en esta cuenta de Apple.',
      );
    } catch (err) {
      Alert.alert('No se pudo restaurar', getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen scroll header={<Header title={SCREEN_TITLES.planCommission} showBack />}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text>
      {isIos ? (
        <Text style={[styles.iosNote, { color: colors.textMuted }]}>
          En iOS los planes de pago se activan con In-App Purchase de Apple (Guideline 3.1.1).
        </Text>
      ) : null}

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: Spacing.lg }} />
      ) : error ? (
        <Text style={{ color: colors.error }}>{error}</Text>
      ) : (
        plans.map((plan) => {
          const active = plan.id === currentPlan;
          return (
            <Pressable
              key={plan.id}
              disabled={busy}
              onPress={() => selectPlan(plan.id)}
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
                {plan.commissionPercent === 0
                  ? 'Comisión: sin comisión en clases'
                  : `Comisión: ${plan.commissionPercent}% por clase completada`}
              </Text>
              {!active ? (
                <Text style={[styles.cta, { color: colors.primary }]}>
                  {plan.monthlyFeeCents > 0
                    ? isIos
                      ? 'Suscribir con Apple'
                      : 'Elegir y pagar'
                    : 'Activar gratis'}
                </Text>
              ) : null}
            </Pressable>
          );
        })
      )}

      {isIos ? (
        <Button
          title="Restaurar compras de Apple"
          variant="outline"
          onPress={restore}
          disabled={busy}
          style={{ marginTop: Spacing.md }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.sm },
  iosNote: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.lg },
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
  cta: { fontSize: 13, fontWeight: '700', marginTop: Spacing.sm },
});
