import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { waitForCourtConfirmation } from '@/services/api/payments.api';

WebBrowser.maybeCompleteAuthSession();

export async function openCourtPaymentCheckout(checkoutUrl: string, reservationId: string) {
  if (Platform.OS === 'web') {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    return waitForCourtConfirmation(reservationId);
  }

  const result = await WebBrowser.openAuthSessionAsync(
    checkoutUrl,
    'fitnexia://court/complete',
  );

  if (result.type === 'success' && result.url) {
    const url = new URL(result.url);
    const status = url.searchParams.get('status');
    if (status === 'failure') {
      throw new Error('El pago fue cancelado o falló.');
    }
  }

  return waitForCourtConfirmation(reservationId);
}
