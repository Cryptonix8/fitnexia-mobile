import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { GYM_TIER_LABELS } from '@/constants/labels';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { fetchGymSubscription } from '@/services/api/institutions.api';
import { fetchGymTierCatalog } from '@/services/api/jobs.api';
import type { GymSubscription, GymTierConfig } from '@/types/api';
import { APP_LOCALE } from '@/utils/locale';
import {
  changeGymTier,
  openGymMercadoPagoCheckout,
  restoreGymApplePurchases,
} from '@/utils/gym-plan-purchase';

function formatFee(cents: number) {
  if (cents === 0) return 'Gratis';
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

function billingLabel(status: string, isIos: boolean) {
  if (status === 'active') return 'Facturación activa';
  if (status === 'pending') {
    return isIos
      ? 'Pago pendiente — completá la compra In-App'
      : 'Pago pendiente — autorizá Mercado Pago';
  }
  if (status === 'not_required') return 'Sin cargo mensual (comisión por transacción)';
  if (status === 'past_due') return 'Pago atrasado';
  return status;
}

export default function GymSubscriptionScreen() {
  const { refreshUser } = useAuth();
  const { colors } = useAppTheme();
  const [subscription, setSubscription] = useState<GymSubscription | null>(null);
  const [tiers, setTiers] = useState<GymTierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const isIos = Platform.OS === 'ios';

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
      const result = await changeGymTier(tierId, refreshUser);
      setSubscription(result.subscription);

      if (result.needsMpAuth && result.checkoutUrl) {
        Alert.alert('Autorizar cobro mensual', result.message, [
          { text: 'Más tarde', style: 'cancel' },
          {
            text: 'Continuar',
            onPress: async () => {
              await openGymMercadoPagoCheckout(result.checkoutUrl!);
              await load();
            },
          },
        ]);
        return;
      }

      Alert.alert('Plan actualizado', result.message);
      await load();
    } catch (err) {
      Alert.alert('No se pudo cambiar el plan', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const restore = async () => {
    setSaving(true);
    try {
      const count = await restoreGymApplePurchases(refreshUser);
      await load();
      Alert.alert(
        'Restaurar compras',
        count > 0
          ? `Se restauraron ${count} suscripción(es).`
          : 'No hay suscripciones de Fitnexia para restaurar en esta cuenta de Apple.',
      );
    } catch (err) {
      Alert.alert('No se pudo restaurar', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      scroll
      loading={loading && !subscription}
      loadingMessage="Cargando plan…"
      header={<Header title="Plan Fitnexia" showBack />}>
      {subscription ? (
        <>
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.planName, { color: colors.text }]}>
              {GYM_TIER_LABELS[subscription.tier] ?? subscription.tierName}
            </Text>
            <Text style={[styles.fee, { color: colors.primary }]}>
              {formatFee(subscription.monthlyFeeCents)}
              {subscription.monthlyFeeCents > 0 ? '/mes' : ''}
            </Text>
            {subscription.commissionPercent != null ? (
              <Text style={[styles.usage, { color: colors.textMuted }]}>
                Comisión Fitnexia: {subscription.commissionPercent}% por cobro de atletas
              </Text>
            ) : null}
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
              {billingLabel(subscription.billingStatus, isIos)}
            </Text>
            {isIos ? (
              <Text style={[styles.hint, { color: colors.textMuted }]}>
                En iOS los planes de pago se activan con In-App Purchase de Apple.
              </Text>
            ) : null}
            {subscription.pendingTier ? (
              <Text style={[styles.warn, { color: colors.warning }]}>
                Pendiente de activar:{' '}
                {GYM_TIER_LABELS[subscription.pendingTier] ?? subscription.pendingTier}
              </Text>
            ) : null}
            {!isIos &&
            subscription.authorizationUrl &&
            subscription.billingStatus === 'pending' ? (
              <Button
                title="Completar pago del plan"
                style={{ marginTop: Spacing.md }}
                onPress={async () => {
                  await openGymMercadoPagoCheckout(subscription.authorizationUrl!);
                  await load();
                }}
              />
            ) : null}
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
                    {formatFee(tier.monthlyFeeCents)}
                    {tier.monthlyFeeCents > 0 ? '/mes' : ''}
                    {tier.commissionPercent != null ? ` · ${tier.commissionPercent}% comisión` : ''}
                    {' · hasta '}
                    {tier.memberLimit != null ? tier.memberLimit : '2.000+'} socios
                    {isIos && tier.monthlyFeeCents > 0 ? ' · Apple IAP' : ''}
                  </Text>
                </View>
                {active ? (
                  <Text style={{ color: colors.primary, fontWeight: '700' }}>Actual</Text>
                ) : null}
              </Pressable>
            );
          })}

          {isIos ? (
            <Button
              title="Restaurar compras de Apple"
              variant="outline"
              onPress={restore}
              disabled={saving}
              style={{ marginTop: Spacing.md }}
            />
          ) : null}
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
