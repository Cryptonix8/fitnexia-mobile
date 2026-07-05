import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { formatMoney } from '@/data/mock';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { getErrorMessage } from '@/services/api/errors';
import { joinWaitlistApi } from '@/services/api/v2-features.api';
import { fetchMyActivePasses, fetchPassProducts } from '@/services/api/passes.api';
import { useFeature } from '@/hooks/use-feature';
import { openPaymentCheckout } from '@/utils/booking-payment';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, LOADING_LABELS, SCREEN_TITLES } from '@/constants/labels';
import type { AthletePass, PassPeriodType, PassProducts, PaymentModel } from '@/types/api';

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
  const { classId, waitlist } = useLocalSearchParams<{ classId: string; waitlist?: string }>();
  const { getClassById, isLoading: classesLoading, refreshClasses } = useClasses();
  const { createBooking, refreshBookings } = useBookings();
  const waitlistEnabled = useFeature('waitlist');
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
      );

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
      <View style={styles.summary}>
        <Text style={styles.className}>{cls.title}</Text>
        <Text style={styles.instructor}>{cls.instructor.displayName}</Text>
        {!isWaitlist ? (
          activePass ? (
            <Text style={styles.passBanner}>Incluido en tu pase activo</Text>
          ) : checkoutPrice ? (
            <Text style={styles.price}>{formatMoney(checkoutPrice)}</Text>
          ) : (
            <Text style={styles.price}>{formatMoney(cls.price)}</Text>
          )
        ) : null}
      </View>

      {!isWaitlist ? (
        integratedPayments ? (
          <>
            {subscriptionModels ? (
              <>
                <Text style={styles.section}>Modelo de pago</Text>
                {paymentOptions.map((opt) => (
                  <Pressable
                    key={opt.id}
                    style={[styles.option, paymentModel === opt.id && styles.optionActive]}
                    onPress={() => setPaymentModel(opt.id)}>
                    <View style={styles.radio}>
                      {paymentModel === opt.id ? <View style={styles.radioInner} /> : null}
                    </View>
                    <View style={styles.optionBody}>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                      {opt.id !== 'per_class' && passProducts ? (
                        <Text style={styles.optionPrice}>
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
                    <Text style={styles.section}>Período del pase</Text>
                    {PERIOD_OPTIONS.map((opt) => {
                      const product = passProducts.per_period[opt.id];
                      const periodPass = findActivePass(activePasses, 'per_period', opt.id);
                      return (
                        <Pressable
                          key={opt.id}
                          style={[styles.option, periodType === opt.id && styles.optionActive]}
                          onPress={() => setPeriodType(opt.id)}>
                          <View style={styles.radio}>
                            {periodType === opt.id ? <View style={styles.radioInner} /> : null}
                          </View>
                          <View style={styles.optionBody}>
                            <Text style={styles.optionLabel}>{product.name}</Text>
                            <Text style={styles.optionDesc}>
                              {product.classCredits} clases · {product.periodDays} días
                            </Text>
                            <Text style={styles.optionPrice}>{formatMoney(product.price)}</Text>
                            {periodPass ? (
                              <Text style={styles.activePassHint}>
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
                  <View style={styles.activePassCard}>
                    <Text style={styles.activePassTitle}>Pase ilimitado activo</Text>
                    {activePass.expiresAt ? (
                      <Text style={styles.activePassMeta}>
                        Vence {new Date(activePass.expiresAt).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </View>
                ) : null}
              </>
            ) : null}

            <Text style={styles.section}>Método de pago</Text>
            <View style={styles.method}>
              <Text style={styles.methodText}>Mercado Pago</Text>
              {digitalWallets ? (
                <Text style={styles.methodSub}>Card · Apple Pay · Google Pay</Text>
              ) : (
                <Text style={styles.methodSub}>Tarjeta de crédito o débito</Text>
              )}
            </View>

            {needsPassCheckout ? (
              <Text style={styles.checkoutHint}>
                Pagás el pase ahora. La reserva se confirma al completar el pago.
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.mvpHint}>
            El pago está deshabilitado. La reserva se confirmará sin cobrar.
          </Text>
        )
      ) : null}

      <Button
        title={
          isWaitlist
            ? BUTTON_LABELS.joinWaitlistShort
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
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  className: { fontSize: 20, fontWeight: '700', color: FitnexiaColors.gray900 },
  instructor: { fontSize: 14, color: FitnexiaColors.gray500, marginTop: 4 },
  price: { fontSize: 24, fontWeight: '800', color: FitnexiaColors.primary, marginTop: Spacing.md },
  passBanner: {
    fontSize: 16,
    fontWeight: '600',
    color: FitnexiaColors.primary,
    marginTop: Spacing.md,
  },
  section: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.md },
  mvpHint: {
    fontSize: 14,
    color: FitnexiaColors.gray500,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  checkoutHint: {
    fontSize: 13,
    color: FitnexiaColors.gray500,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.md,
  },
  optionActive: { borderColor: FitnexiaColors.primary },
  optionBody: { flex: 1 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: FitnexiaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: FitnexiaColors.primary,
  },
  optionLabel: { fontSize: 16, fontWeight: '600', color: FitnexiaColors.gray900 },
  optionDesc: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 2 },
  optionPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: FitnexiaColors.primary,
    marginTop: 4,
  },
  activePassHint: {
    fontSize: 12,
    fontWeight: '600',
    color: '#15803d',
    marginTop: 4,
  },
  activePassCard: {
    backgroundColor: '#ecfdf5',
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  activePassTitle: { fontSize: 15, fontWeight: '700', color: '#166534' },
  activePassMeta: { fontSize: 13, color: '#166534', marginTop: 4 },
  method: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  methodText: { fontSize: 16, fontWeight: '600' },
  methodSub: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 4 },
});
