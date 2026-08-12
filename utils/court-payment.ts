import { Platform } from 'react-native';

import { waitForCourtConfirmation } from '@/services/api/payments.api';
import { openInAppBrowser } from '@/utils/in-app-browser';

export async function openCourtPaymentCheckout(checkoutUrl: string, reservationId: string) {
  if (Platform.OS === 'web') {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    return waitForCourtConfirmation(reservationId);
  }

  const result = await openInAppBrowser(checkoutUrl, 'fitnexia://court/complete');

  if (result && 'type' in result && result.type === 'success' && 'url' in result && result.url) {
    const url = new URL(String(result.url));
    const status = url.searchParams.get('status');
    if (status === 'failure') {
      throw new Error('El pago fue cancelado o falló.');
    }
  }

  return waitForCourtConfirmation(reservationId);
}
