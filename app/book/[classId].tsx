import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { isFeatureEnabled } from '@/constants/features';
import { formatMoney } from '@/data/mock';
import { useClasses } from '@/contexts/classes-context';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import type { PaymentModel } from '@/types/api';

const PAYMENT_OPTIONS: { id: PaymentModel; label: string; desc: string }[] = [
  { id: 'per_class', label: 'Pay per class', desc: 'One-time payment at booking' },
  { id: 'monthly_unlimited', label: 'Monthly unlimited', desc: 'Unlimited bookings per month' },
  { id: 'per_period', label: 'Weekly / quarterly', desc: 'Pay for your usage period' },
];

export default function BookScreen() {
  const { classId, waitlist } = useLocalSearchParams<{ classId: string; waitlist?: string }>();
  const { getClassById } = useClasses();
  const cls = getClassById(classId ?? '');
  const [paymentModel, setPaymentModel] = useState<PaymentModel>('per_class');
  const [loading, setLoading] = useState(false);

  const paymentsEnabled = isFeatureEnabled('integratedPayments');
  const paymentModelsEnabled = isFeatureEnabled('paymentModels');
  const waitlistEnabled = isFeatureEnabled('waitlist');

  if (!cls) {
    return (
      <Screen>
        <Header title="Book" showBack />
        <Text>Class not found</Text>
      </Screen>
    );
  }

  if (waitlist === '1' && !waitlistEnabled) {
    return (
      <Screen>
        <Header title="Book" showBack />
        <Text style={styles.unavailable}>Waitlist is not available yet.</Text>
      </Screen>
    );
  }

  const isWaitlist = waitlist === '1';

  const confirm = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        isWaitlist ? 'On waitlist' : 'Booking confirmed',
        isWaitlist
          ? 'We will notify you when a spot opens. You will have 2 hours to confirm.'
          : paymentsEnabled
            ? 'Payment mock successful. Check your bookings tab.'
            : 'Your spot is reserved. Check your bookings tab.',
        [{ text: 'OK', onPress: () => router.replace('/(athlete)/(tabs)/bookings') }],
      );
    }, 800);
  };

  const confirmLabel = isWaitlist
    ? 'Join waitlist'
    : paymentsEnabled
      ? 'Pay & confirm'
      : 'Confirm booking';

  return (
    <Screen scroll>
      <Header title={isWaitlist ? 'Join waitlist' : 'Confirm booking'} showBack />
      <View style={styles.summary}>
        <Text style={styles.className}>{cls.title}</Text>
        <Text style={styles.instructor}>{cls.instructor.displayName}</Text>
        {!isWaitlist ? <Text style={styles.price}>{formatMoney(cls.price)}</Text> : null}
      </View>

      {!isWaitlist && paymentsEnabled ? (
        <>
          {paymentModelsEnabled ? (
            <>
              <Text style={styles.section}>Payment model</Text>
              {PAYMENT_OPTIONS.map((opt) => (
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

          <Text style={styles.section}>Payment method</Text>
          <View style={styles.method}>
            <Text style={styles.methodText}>Mercado Pago (mock)</Text>
            {isFeatureEnabled('digitalWallets') ? (
              <Text style={styles.methodSub}>Card · Apple Pay · Google Pay</Text>
            ) : (
              <Text style={styles.methodSub}>Card (mock)</Text>
            )}
          </View>
        </>
      ) : !isWaitlist ? (
        <Text style={styles.mvpHint}>
          Payment integration is coming soon. This booking is confirmed locally for demo purposes.
        </Text>
      ) : null}

      <Button title={confirmLabel} loading={loading} onPress={confirm} style={{ marginTop: Spacing.lg }} />
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
  unavailable: { fontSize: 15, color: FitnexiaColors.gray500, marginTop: Spacing.lg },
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
