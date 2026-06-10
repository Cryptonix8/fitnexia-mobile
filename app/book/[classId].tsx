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
import { useFeature } from '@/hooks/use-feature';
import { openPaymentCheckout } from '@/utils/booking-payment';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, SCREEN_TITLES } from '@/constants/labels';
import type { PaymentModel } from '@/types/api';

const ALL_PAYMENT_OPTIONS: { id: PaymentModel; label: string; desc: string }[] = [
  { id: 'per_class', label: 'Pago por clase', desc: 'Pago único al reservar' },
  { id: 'monthly_unlimited', label: 'Ilimitado mensual', desc: 'Reservas ilimitadas por mes' },
  { id: 'per_period', label: 'Semanal / trimestral', desc: 'Pagá por tu período de uso' },
];

export default function BookScreen() {
  const { classId, waitlist } = useLocalSearchParams<{ classId: string; waitlist?: string }>();
  const { getClassById, refreshClasses } = useClasses();
  const { createBooking, refreshBookings } = useBookings();
  const waitlistEnabled = useFeature('waitlist');
  const subscriptionModels = useFeature('subscriptionPaymentModels');
  const integratedPayments = useFeature('integratedPayments');
  const digitalWallets = useFeature('digitalWallets');
  const cls = getClassById(classId ?? '');
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('per_class');
  const [loading, setLoading] = useState(false);

  const isWaitlist = waitlist === '1' && waitlistEnabled;

  const paymentOptions = useMemo(
    () =>
      subscriptionModels
        ? ALL_PAYMENT_OPTIONS
        : ALL_PAYMENT_OPTIONS.filter((o) => o.id === 'per_class'),
    [subscriptionModels],
  );

  useEffect(() => {
    if (waitlist === '1' && !waitlistEnabled) {
      router.replace(`/book/${classId}`);
    }
  }, [waitlist, waitlistEnabled, classId]);

  if (!cls) {
    return (
      <Screen>
        <Header title="Reservar" showBack />
        <Text>{SCREEN_TITLES.classNotFound}</Text>
      </Screen>
    );
  }

  const confirm = async () => {
    setLoading(true);
    try {
      if (isWaitlist) {
        Alert.alert(
          'En lista de espera',
          'Te avisaremos cuando se libere un cupo. Tendrás 2 horas para confirmar.',
          [{ text: 'OK', onPress: () => router.replace('/(athlete)/(tabs)/bookings') }],
        );
        return;
      }

      const result = await createBooking(classId ?? '');

      if (integratedPayments && result.payment?.checkoutUrl) {
        await openPaymentCheckout(result.payment.checkoutUrl, result.booking.id);
        await Promise.all([refreshBookings(), refreshClasses()]);
        Alert.alert('Reserva confirmada', 'Pago exitoso. Tu cupo está reservado.', [
          { text: 'OK', onPress: () => router.replace('/(athlete)/(tabs)/bookings') },
        ]);
        return;
      }

      await refreshClasses();
      Alert.alert(
        'Reserva confirmada',
        result.booking.status === 'pending_payment'
          ? 'Completá el pago desde Mis reservas cuando el checkout esté disponible.'
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
    <Screen scroll>
      <Header
        title={isWaitlist ? BUTTON_LABELS.joinWaitlistShort : BUTTON_LABELS.confirmBooking}
        showBack
      />
      <View style={styles.summary}>
        <Text style={styles.className}>{cls.title}</Text>
        <Text style={styles.instructor}>{cls.instructor.displayName}</Text>
        {!isWaitlist ? <Text style={styles.price}>{formatMoney(cls.price)}</Text> : null}
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
                    <View>
                      <Text style={styles.optionLabel}>{opt.label}</Text>
                      <Text style={styles.optionDesc}>{opt.desc}</Text>
                    </View>
                  </Pressable>
                ))}
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
            : integratedPayments
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
  section: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.md },
  mvpHint: {
    fontSize: 14,
    color: FitnexiaColors.gray500,
    lineHeight: 22,
    marginBottom: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.md,
  },
  optionActive: { borderColor: FitnexiaColors.primary },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: FitnexiaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: FitnexiaColors.primary,
  },
  optionLabel: { fontSize: 16, fontWeight: '600', color: FitnexiaColors.gray900 },
  optionDesc: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 2 },
  method: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  methodText: { fontSize: 16, fontWeight: '600' },
  methodSub: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 4 },
});
