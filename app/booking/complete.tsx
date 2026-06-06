import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { Screen } from '@/components/ui/screen';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { waitForBookingConfirmation } from '@/services/api/payments.api';

export default function BookingCompleteScreen() {
  const { bookingId, status } = useLocalSearchParams<{ bookingId?: string; status?: string }>();
  const { colors } = useAppTheme();
  const { refreshBookings } = useBookings();
  const { refreshClasses } = useClasses();

  useEffect(() => {
    if (!bookingId) {
      router.replace('/(athlete)/(tabs)/bookings');
      return;
    }

    if (status === 'failure') {
      router.replace('/(athlete)/(tabs)/bookings');
      return;
    }

    waitForBookingConfirmation(bookingId)
      .then(async () => {
        await Promise.all([refreshBookings(), refreshClasses()]);
        router.replace('/(athlete)/(tabs)/bookings');
      })
      .catch(async () => {
        await refreshBookings();
        router.replace('/(athlete)/(tabs)/bookings');
      });
  }, [bookingId, status, refreshBookings, refreshClasses]);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.primary} />
        <Text style={{ marginTop: Spacing.md, color: colors.textMuted }}>Confirming payment…</Text>
      </View>
    </Screen>
  );
}
