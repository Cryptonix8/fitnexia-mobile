import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

export async function openMembershipCheckout(checkoutUrl: string, memberId: string) {
  if (Platform.OS === 'web') {
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
    return;
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

  return memberId;
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
