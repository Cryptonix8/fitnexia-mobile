import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { LOADING_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { waitForCourtConfirmation } from '@/services/api/payments.api';

export default function CourtCompleteScreen() {
  const { reservationId, status } = useLocalSearchParams<{
    reservationId?: string;
    status?: string;
  }>();
  const { colors } = useAppTheme();

  useEffect(() => {
    if (!reservationId) {
      router.replace('/(athlete)/courts/reservations');
      return;
    }

    if (status === 'failure') {
      router.replace('/(athlete)/courts/reservations');
      return;
    }

    waitForCourtConfirmation(reservationId)
      .then(() => {
        router.replace('/(athlete)/courts/reservations');
      })
      .catch(() => {
        router.replace('/(athlete)/courts/reservations');
      });
  }, [reservationId, status]);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted }}>{LOADING_LABELS.payment}</Text>
      </View>
      <LoadingOverlay visible message={LOADING_LABELS.payment} />
    </Screen>
  );
}
