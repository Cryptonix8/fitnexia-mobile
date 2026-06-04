import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { formatMoney } from '@/data/mock';
import { useClasses } from '@/contexts/classes-context';
import { useFeature } from '@/hooks/use-feature';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import type { PaymentModel } from '@/types/api';

const ALL_PAYMENT_OPTIONS: { id: PaymentModel; label: string; desc: string }[] = [
  { id: 'per_class', label: 'Pay per class', desc: 'One-time payment at booking' },
  { id: 'monthly_unlimited', label: 'Monthly unlimited', desc: 'Unlimited bookings per month' },
  { id: 'per_period', label: 'Weekly / quarterly', desc: 'Pay for your usage period' },
];

export default function BookScreen() {
  const { classId, waitlist } = useLocalSearchParams<{ classId: string; waitlist?: string }>();
  const { getClassById } = useClasses();
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
        <Header title="Book" showBack />
        <Text>Class not found</Text>
      </Screen>
    );
  }

  const confirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        isWaitlist ? 'On waitlist' : 'Booking confirmed',
        isWaitlist
          ? 'We will notify you when a spot opens. You will have 2 hours to confirm.'
          : integratedPayments
            ? 'Payment mock successful. Check your bookings tab.'
            : 'Your spot is reserved. Payment will be added in a future update.',
        [{ text: 'OK', onPress: () => router.replace('/(athlete)/(tabs)/bookings') }],
      );
    }, 800);
  };

  return (
    <Screen scroll>
      <Header title={isWaitlist ? 'Join waitlist' : 'Confirm booking'} showBack />
      <View style={styles.summary}>
        <Text style={styles.className}>{cls.title}</Text>
        <Text style={styles.instructor}>{cls.instructor.displayName}</Text>
        {!isWaitlist ? (
          <Text style={styles.price}>{formatMoney(cls.price)}</Text>
        ) : null}
      </View>

      {!isWaitlist ? (
        <>
          {subscriptionModels ? (
            <>
              <Text style={styles.section}>Payment model</Text>
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

          {integratedPayments ? (
            <>
              <Text style={styles.section}>Payment method</Text>
              <View style={styles.method}>
                <Text style={styles.methodText}>Mercado Pago (mock)</Text>
                {digitalWallets ? (
                  <Text style={styles.methodSub}>Card · Apple Pay · Google Pay</Text>
                ) : (
                  <Text style={styles.methodSub}>Credit or debit card</Text>
                )}
              </View>
            </>
          ) : (
            <Text style={styles.mvpNote}>
              MVP: booking is confirmed without in-app payment. Mercado Pago will be enabled later.
            </Text>
          )}
        </>
      ) : null}

      <Button
        title={isWaitlist ? 'Join waitlist' : integratedPayments ? 'Pay & confirm' : 'Confirm booking'}
        loading={loading}
        onPress={confirm}
        style={{ marginTop: Spacing.lg }}
      />
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
  mvpNote: {
    fontSize: 14,
    color: FitnexiaColors.gray500,
    lineHeight: 20,
    marginBottom: Spacing.md,
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
