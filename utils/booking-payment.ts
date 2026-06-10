import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { waitForBookingConfirmation } from '@/services/api/payments.api';

WebBrowser.maybeCompleteAuthSession();

export async function openPaymentCheckout(checkoutUrl: string, bookingId: string) {
  if (Platform.OS === 'web') {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    return waitForBookingConfirmation(bookingId);
  }

  const result = await WebBrowser.openAuthSessionAsync(
    checkoutUrl,
    'fitnexia://booking/complete',
  );

  if (result.type === 'success' && result.url) {
    const url = new URL(result.url);
    const status = url.searchParams.get('status');
    if (status === 'failure') {
      throw new Error('El pago fue cancelado o falló.');
    }
  }

  return waitForBookingConfirmation(bookingId);
}
