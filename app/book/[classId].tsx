import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { SurfaceCard } from '@/components/ui/surface-card';
import { formatMoney } from '@/data/mock';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { getErrorMessage } from '@/services/api/errors';
import { joinWaitlistApi } from '@/services/api/v2-features.api';
import { fetchMyActivePasses, fetchPassProducts } from '@/services/api/passes.api';
import { fetchMyCredits } from '@/services/api/credits.api';
import { useFeature } from '@/hooks/use-feature';
import { useAppTheme } from '@/contexts/theme-context';
import { openPaymentCheckout } from '@/utils/booking-payment';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, LOADING_LABELS, SCREEN_TITLES } from '@/constants/labels';
import type { AthletePass, CreditBalance, PassPeriodType, PassProducts, PaymentModel } from '@/types/api';

const ALL_PAYMENT_OPTIONS: { id: PaymentModel; label: string; desc: string }[] = [
  { id: 'per_class', label: 'Pago por clase', desc: 'Pago único al reservar' },
  { id: 'monthly_unlimited', label: 'Ilimitado mensual', desc: 'Reservas ilimitadas por 30 días' },
  { id: 'per_period', label: 'Semanal / mensual / trimestral', desc: 'Paquete de clases por período' },
];

const PERIOD_OPTIONS: { id: PassPeriodType; label: string }[] = [
  { id: 'week', label: 'Semanal' },
  { id: 'month', label: 'Mensual' },
  { id: 'quarter', label: 'Trimestral' },
];

function findActivePass(
  passes: AthletePass[],
  paymentModel: PaymentModel,
  periodType?: PassPeriodType,
): AthletePass | undefined {
  if (paymentModel === 'per_class') return undefined;
  return passes.find((pass) => {
    if (pass.paymentModel !== paymentModel) return false;
    if (paymentModel === 'per_period' && pass.periodType !== periodType) return false;
    return true;
  });
}

export default function BookScreen() {
  const { colors } = useAppTheme();
  const { classId, waitlist } = useLocalSearchParams<{ classId: string; waitlist?: string }>();
  const { getClassById, isLoading: classesLoading, refreshClasses } = useClasses();
  const { createBooking, refreshBookings } = useBookings();
  const waitlistEnabled = useFeature('waitlist');
  const loyaltyCredits = useFeature('loyaltyCredits');
  const subscriptionModels = useFeature('subscriptionPaymentModels');
  const integratedPayments = useFeature('integratedPayments');
  const digitalWallets = useFeature('digitalWallets');
  const cls = getClassById(classId ?? '');
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('per_class');
  const [periodType, setPeriodType] = useState<PassPeriodType>('month');
  const [passProducts, setPassProducts] = useState<PassProducts | null>(null);
  const [activePasses, setActivePasses] = useState<AthletePass[]>([]);
  const [loading, setLoading] = useState(false);
  const [passesLoading, setPassesLoading] = useState(subscriptionModels);
  const [credits, setCredits] = useState<CreditBalance | null>(null);
  const [useCredits, setUseCredits] = useState(false);

  const isWaitlist = waitlist === '1' && waitlistEnabled;

  const paymentOptions = useMemo(
    () =>
      subscriptionModels
        ? ALL_PAYMENT_OPTIONS
        : ALL_PAYMENT_OPTIONS.filter((o) => o.id === 'per_class'),
    [subscriptionModels],
  );

  const activePass = useMemo(
    () => findActivePass(activePasses, paymentModel, periodType),
    [activePasses, paymentModel, periodType],
  );

  const checkoutPrice = useMemo(() => {
    if (paymentModel === 'per_class' || !passProducts) {
      return cls?.price ?? null;
    }
    if (activePass) return null;
    if (paymentModel === 'monthly_unlimited') {
      return passProducts.monthly_unlimited.price;
    }
    return passProducts.per_period[periodType]?.price ?? null;
  }, [paymentModel, passProducts, activePass, periodType, cls?.price]);

  useEffect(() => {
    if (waitlist === '1' && !waitlistEnabled) {
      router.replace(`/book/${classId}`);
    }
  }, [waitlist, waitlistEnabled, classId]);

  useEffect(() => {
    if (!subscriptionModels) return;
    let cancelled = false;

    (async () => {
      setPassesLoading(true);
      try {
        const [products, passes] = await Promise.all([
          fetchPassProducts(),
          fetchMyActivePasses(),
        ]);
        if (!cancelled) {
          setPassProducts(products);
          setActivePasses(passes);
        }
      } catch (err) {
        console.warn('Failed to load pass data:', getErrorMessage(err));
      } finally {
        if (!cancelled) setPassesLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [subscriptionModels]);

  useEffect(() => {
    if (!loyaltyCredits) return;
    let cancelled = false;
    fetchMyCredits()
      .then((data) => {
        if (!cancelled) setCredits(data);
      })
      .catch(() => {
        if (!cancelled) setCredits(null);
      });
    return () => {
      cancelled = true;
    };
  }, [loyaltyCredits]);

  const canRedeemCredits = useMemo(() => {
    if (!credits?.freeClassEligible || !cls) return false;
    return cls.price.amount <= credits.maxFreeClassValue.amount;
  }, [credits, cls]);

  useEffect(() => {
    if (!canRedeemCredits) setUseCredits(false);
  }, [canRedeemCredits]);

  if (!cls) {
    return (
      <Screen loading={classesLoading} loadingMessage={LOADING_LABELS.classes}>
        <Header title="Reservar" showBack />
        {!classesLoading ? <Text>{SCREEN_TITLES.classNotFound}</Text> : null}
      </Screen>
    );
  }

  const needsPassCheckout =
    integratedPayments &&
    (paymentModel === 'monthly_unlimited' || paymentModel === 'per_period') &&
    !activePass;

  const confirm = async () => {
    setLoading(true);
    try {
      if (isWaitlist) {
        await joinWaitlistApi(classId ?? '');
        Alert.alert(
          'En lista de espera',
          'Te avisaremos cuando se libere un cupo. Tendrás 2 horas para confirmar.',
          [{ text: 'OK', onPress: () => router.replace('/(athlete)/(tabs)/bookings') }],
        );
        return;
      }

      const result = await createBooking(
        classId ?? '',
        paymentModel,
        paymentModel === 'per_period' ? periodType : undefined,
        useCredits && canRedeemCredits && paymentModel === 'per_class',
      );

      if (useCredits && canRedeemCredits && paymentModel === 'per_class') {
        await refreshClasses();
        Alert.alert(
          'Clase gratis confirmada',
          'Usaste 10 créditos de fidelidad. Fitnexia cubre el costo de esta clase.',
          [{ text: 'OK', onPress: () => router.replace('/(athlete)/(tabs)/bookings') }],
        );
        return;
      }

      if (integratedPayments && result.payment?.checkoutUrl) {
        await openPaymentCheckout(result.payment.checkoutUrl, result.booking.id);
        await Promise.all([refreshBookings(), refreshClasses()]);
        Alert.alert(
          needsPassCheckout ? 'Pase activado' : 'Reserva confirmada',
          needsPassCheckout
            ? 'Pago exitoso. Tu pase está activo y la reserva confirmada.'
            : 'Pago exitoso. Tu cupo está reservado.',
          [{ text: 'OK', onPress: () => router.replace('/(athlete)/(tabs)/bookings') }],
        );
        return;
      }

      await refreshClasses();
      Alert.alert(
        'Reserva confirmada',
        result.booking.status === 'pending_payment'
          ? 'Completá el pago desde Mis reservas cuando el checkout esté disponible.'
          : activePass
            ? 'Tu cupo está reservado con tu pase activo.'
            : 'Tu cupo está reservado.',
        [{ text: 'OK', onPress: () => router.replace('/(athlete)/(tabs)/bookings') }],
      );
    } catch (err) {
      Alert.alert('Reserva fallida', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      scroll
      loading={passesLoading}
      loadingMessage={LOADING_LABELS.passes}
      header={
        <Header
          title={isWaitlist ? BUTTON_LABELS.joinWaitlistShort : BUTTON_LABELS.confirmBooking}
          showBack
        />
      }>
      <SurfaceCard style={styles.summary}>
        <Text style={[styles.className, { color: colors.text }]}>{cls.title}</Text>
        <Text style={[styles.instructor, { color: colors.textMuted }]}>{cls.instructor.displayName}</Text>
        {!isWaitlist ? (
          activePass ? (
            <Text style={[styles.passBanner, { color: colors.primary }]}>Incluido en tu pase activo</Text>
          ) : checkoutPrice ? (
            <Text style={[styles.price, { color: colors.primary }]}>{formatMoney(checkoutPrice)}</Text>
          ) : (
            <Text style={[styles.price, { color: colors.primary }]}>{formatMoney(cls.price)}</Text>
          )
        ) : null}
      </SurfaceCard>

      {!isWaitlist ? (
        integratedPayments ? (
          <>
            {subscriptionModels ? (
              <>
                <Text style={[styles.section, { color: colors.text }]}>Modelo de pago</Text>
                {paymentOptions.map((opt) => (
                  <Pressable
                    key={opt.id}
                    style={[
                      styles.option,
                      { backgroundColor: colors.surface },
                      paymentModel === opt.id && { borderColor: colors.primary },
                    ]}
                    onPress={() => setPaymentModel(opt.id)}>
                    <View style={[styles.radio, { borderColor: colors.primary }]}>
                      {paymentModel === opt.id ? (
                        <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                      ) : null}
                    </View>
                    <View style={styles.optionBody}>
                      <Text style={[styles.optionLabel, { color: colors.text }]}>{opt.label}</Text>
                      <Text style={[styles.optionDesc, { color: colors.textMuted }]}>{opt.desc}</Text>
                      {opt.id !== 'per_class' && passProducts ? (
                        <Text style={[styles.optionPrice, { color: colors.primary }]}>
                          {opt.id === 'monthly_unlimited'
                            ? formatMoney(passProducts.monthly_unlimited.price)
                            : `Desde ${formatMoney(passProducts.per_period.week.price)}`}
                        </Text>
                      ) : null}
                    </View>
                  </Pressable>
                ))}

                {paymentModel === 'per_period' && passProducts ? (
                  <>
                    <Text style={[styles.section, { color: colors.text }]}>Período del pase</Text>
                    {PERIOD_OPTIONS.map((opt) => {
                      const product = passProducts.per_period[opt.id];
                      const periodPass = findActivePass(activePasses, 'per_period', opt.id);
                      return (
                        <Pressable
                          key={opt.id}
                          style={[
                            styles.option,
                            { backgroundColor: colors.surface },
                            periodType === opt.id && { borderColor: colors.primary },
                          ]}
                          onPress={() => setPeriodType(opt.id)}>
                          <View style={[styles.radio, { borderColor: colors.primary }]}>
                            {periodType === opt.id ? (
                              <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                            ) : null}
                          </View>
                          <View style={styles.optionBody}>
                            <Text style={[styles.optionLabel, { color: colors.text }]}>{product.name}</Text>
                            <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
                              {product.classCredits} clases · {product.periodDays} días
                            </Text>
                            <Text style={[styles.optionPrice, { color: colors.primary }]}>
                              {formatMoney(product.price)}
                            </Text>
                            {periodPass ? (
                              <Text style={[styles.activePassHint, { color: colors.success }]}>
                                Pase activo
                                {periodPass.classCreditsRemaining != null
                                  ? ` · ${periodPass.classCreditsRemaining} créditos`
                                  : ''}
                              </Text>
                            ) : null}
                          </View>
                        </Pressable>
                      );
                    })}
                  </>
                ) : null}

                {paymentModel === 'monthly_unlimited' && activePass ? (
                  <View style={[styles.activePassCard, { backgroundColor: colors.successMuted }]}>
                    <Text style={[styles.activePassTitle, { color: colors.success }]}>
                      Pase ilimitado activo
                    </Text>
                    {activePass.expiresAt ? (
                      <Text style={[styles.activePassMeta, { color: colors.success }]}>
                        Vence {new Date(activePass.expiresAt).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </>
            ) : null}

            <Text style={[styles.section, { color: colors.text }]}>Método de pago</Text>
            <SurfaceCard padding="md" style={styles.method}>
              <Text style={[styles.methodText, { color: colors.text }]}>Mercado Pago</Text>
              {digitalWallets ? (
                <Text style={[styles.methodSub, { color: colors.textMuted }]}>
                  Card · Apple Pay · Google Pay
                </Text>
              ) : (
                <Text style={[styles.methodSub, { color: colors.textMuted }]}>
                  Tarjeta de crédito o débito
                </Text>
              )}
            </SurfaceCard>

            {needsPassCheckout ? (
              <Text style={[styles.checkoutHint, { color: colors.textMuted }]}>
                Pagás el pase ahora. La reserva se confirma al completar el pago.
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={[styles.mvpHint, { color: colors.textMuted }]}>
            El pago está deshabilitado. La reserva se confirmará sin cobrar.
          </Text>
        )
      ) : null}

      {!isWaitlist && loyaltyCredits && canRedeemCredits && paymentModel === 'per_class' && !activePass ? (
        <Pressable
          style={[
            styles.loyaltyCard,
            { backgroundColor: colors.warningMuted },
            useCredits && { borderColor: colors.primary },
          ]}
          onPress={() => setUseCredits((v) => !v)}>
          <View style={[styles.radio, { borderColor: colors.primary }]}>
            {useCredits ? (
              <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
            ) : null}
          </View>
          <View style={styles.optionBody}>
            <Text style={[styles.optionLabel, { color: colors.text }]}>Usar clase gratis (10 créditos)</Text>
            <Text style={[styles.optionDesc, { color: colors.textMuted }]}>
              Tenés {credits?.balance ?? 0} créditos. Fitnexia cubre hasta{' '}
              {credits ? formatMoney(credits.maxFreeClassValue) : ''}.
            </Text>
          </View>
        </Pressable>
      ) : null}

      <Button
        title={
          isWaitlist
            ? BUTTON_LABELS.joinWaitlistShort
            : useCredits && canRedeemCredits
              ? 'Confirmar clase gratis'
              : needsPassCheckout || (integratedPayments && paymentModel === 'per_class')
                ? BUTTON_LABELS.payAndConfirm
                : BUTTON_LABELS.confirmBooking
        }
        disabled={loading}
        onPress={confirm}
        style={{ marginTop: Spacing.lg }}
      />

      <LoadingOverlay visible={loading} message="Confirmando reserva…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: {
    marginBottom: Spacing.lg,
  },
  className: { fontSize: 20, fontWeight: '700' },
  instructor: { fontSize: 14, marginTop: 4 },
  price: { fontSize: 24, fontWeight: '800', marginTop: Spacing.md },
  passBanner: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: Spacing.md,
  },
  section: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.md },
  mvpHint: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  checkoutHint: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.md,
  },
  optionBody: { flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  optionLabel: { fontSize: 16, fontWeight: '600' },
  optionDesc: { fontSize: 13, marginTop: 2 },
  optionPrice: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  activePassHint: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  activePassCard: {
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  activePassTitle: { fontSize: 15, fontWeight: '700' },
  activePassMeta: { fontSize: 13, marginTop: 4 },
  method: {
    marginBottom: Spacing.md,
  },
  methodText: { fontSize: 16, fontWeight: '600' },
  methodSub: { fontSize: 13, marginTop: 4 },
  loyaltyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.md,
  },
});
