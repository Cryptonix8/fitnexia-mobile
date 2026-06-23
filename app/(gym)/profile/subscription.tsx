import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { GYM_TIER_LABELS } from '@/constants/labels';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { fetchGymSubscription, updateGymSubscriptionApi } from '@/services/api/institutions.api';
import { fetchGymTierCatalog } from '@/services/api/jobs.api';
import type { GymSubscription, GymTierConfig } from '@/types/api';
import { APP_LOCALE } from '@/utils/locale';

function formatFee(cents: number) {
  try {
    return new Intl.NumberFormat(APP_LOCALE, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      maximumFractionDigits: 0,
    }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(0)}`;
  }
}

export default function GymSubscriptionScreen() {
  const { refreshUser } = useAuth();
  const { colors } = useAppTheme();
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [tiers, setTiers] = useState<GymTierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sub, catalog] = await Promise.all([fetchGymSubscription(), fetchGymTierCatalog()]);
      setSubscription(sub);
      setTiers(catalog);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const changeTier = async (tierId: string) => {
    if (!subscription || tierId === subscription.tier) return;
    setSaving(true);
    try {
      const next = await updateGymSubscriptionApi(tierId);
      setSubscription(next);
      await refreshUser();
      Alert.alert('Plan actualizado', `Tu plan es ahora ${GYM_TIER_LABELS[next.tier] ?? next.tierName}.`);
    } catch (err) {
      Alert.alert('No se pudo cambiar el plan', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll loading={loading && !subscription} loadingMessage="Cargando plan…">
      <Header title="Plan Fitnexia" showBack />

      {subscription ? (
        <>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.planName, { color: colors.text }]}>
              {GYM_TIER_LABELS[subscription.tier] ?? subscription.tierName}
            </Text>
            <Text style={[styles.fee, { color: colors.primary }]}>
              {formatFee(subscription.monthlyFeeCents)}/mes
            </Text>
            <Text style={[styles.usage, { color: colors.textMuted }]}>
              Socios: {subscription.memberCount}
              {subscription.memberLimit != null ? ` / ${subscription.memberLimit}` : ' (sin límite)'}
            </Text>
            {subscription.atLimit ? (
              <Text style={[styles.warn, { color: colors.warning }]}>
                Alcanzaste el límite de socios. Subí de plan para agregar más.
              </Text>
            ) : null}
            <Text style={[styles.hint, { color: colors.textMuted }]}>
              Facturación manual en MVP. El cobro automático llegará en una próxima versión.
            </Text>
          </View>

          <Text style={[styles.section, { color: colors.text }]}>Cambiar plan</Text>
          {tiers.map((tier) => {
            const active = tier.id === subscription.tier;
            return (
              <Pressable
                key={tier.id}
                disabled={saving}
                onPress={() => changeTier(tier.id)}
                style={[
                  styles.tierRow,
                  {
                    backgroundColor: active ? colors.primaryMuted : colors.surface,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}>
                <View style={styles.tierBody}>
                  <Text style={[styles.tierName, { color: colors.text }]}>
                    {GYM_TIER_LABELS[tier.id] ?? tier.name}
                  </Text>
                  <Text style={[styles.tierMeta, { color: colors.textMuted }]}>
                    {formatFee(tier.monthlyFeeCents)}/mes · hasta{' '}
                    {tier.memberLimit != null ? tier.memberLimit : '2.000+'} socios
                  </Text>
                </View>
                {active ? (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Actual</Text>
                ) : null}
              </Pressable>
            );
          })}
        </>
      ) : null}

      <Button
        title="Volver al perfil"
        variant="outline"
        onPress={() => router.back()}
        style={{ marginTop: Spacing.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  planName: { fontSize: 22, fontWeight: '800' },
  fee: { fontSize: 18, fontWeight: '700', marginTop: Spacing.xs },
  usage: { fontSize: 14, marginTop: Spacing.sm },
  warn: { fontSize: 13, marginTop: Spacing.sm, fontWeight: '600' },
  hint: { fontSize: 12, marginTop: Spacing.md },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  tierRow: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierBody: { flex: 1 },
  tierName: { fontSize: 16, fontWeight: '700' },
  tierMeta: { fontSize: 13, marginTop: 2 },
});
