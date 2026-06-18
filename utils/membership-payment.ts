import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { waitForMembershipPayment } from '@/services/api/memberships.api';

WebBrowser.maybeCompleteAuthSession();

export async function openMembershipCheckout(
  checkoutUrl: string,
  memberId: string,
  paymentId: string,
) {
  if (Platform.OS === 'web') {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    return waitForMembershipPayment(memberId, paymentId);
  }

  const result = await WebBrowser.openAuthSessionAsync(
    checkoutUrl,
    'fitnexia://membership/complete',
  );

  if (result.type === 'success' && result.url) {
    const url = new URL(result.url);
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

  const result = await WebBrowser.openAuthSessionAsync(
    authorizationUrl,
    'fitnexia://membership/complete',
  );

  if (result.type === 'success' && result.url) {
    const url = new URL(result.url);
    const status = url.searchParams.get('status');
    if (status === 'failure') {
      throw new Error('La autorización fue cancelada.');
    }
  }

  return memberId;
}
