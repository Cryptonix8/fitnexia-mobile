import { Platform } from 'react-native';

import { waitForMembershipPayment } from '@/services/api/memberships.api';
import { openInAppBrowser } from '@/utils/in-app-browser';

export async function openMembershipCheckout(
  checkoutUrl: string,
  memberId: string,
  paymentId: string,
) {
  if (Platform.OS === 'web') {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    return waitForMembershipPayment(memberId, paymentId);
  }

  const result = await openInAppBrowser(checkoutUrl, 'fitnexia://membership/complete');

  if (result && 'type' in result && result.type === 'success' && 'url' in result && result.url) {
    const url = new URL(String(result.url));
    const status = url.searchParams.get('status');
    if (status === 'failure') {
      throw new Error('El pago fue cancelado o falló.');
    }
  }

  return waitForMembershipPayment(memberId, paymentId);
}

export async function openMembershipAuthorization(authorizationUrl: string, memberId: string) {
  if (Platform.OS === 'web') {
    window.open(authorizationUrl, '_blank', 'noopener,noreferrer');
    return memberId;
  }

  const result = await openInAppBrowser(authorizationUrl, 'fitnexia://membership/complete');

  if (result && 'type' in result && result.type === 'success' && 'url' in result && result.url) {
    const url = new URL(String(result.url));
    const status = url.searchParams.get('status');
    if (status === 'failure') {
      throw new Error('La autorización fue cancelada.');
    }
  }

  return memberId;
}
