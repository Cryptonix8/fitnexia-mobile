import { Platform } from 'react-native';

import {
  isAppleIapAvailable,
  purchaseAppleSubscription,
  restoreAppleSubscriptions,
  skuForGymTier,
} from '@/services/iap/apple-saas-iap';
import { updateGymSubscriptionApi } from '@/services/api/institutions.api';
import type { GymSubscription } from '@/types/api';
import { openInAppBrowser } from '@/utils/in-app-browser';

type GymPlanChangeResult = {
  subscription: GymSubscription;
  usedIap?: boolean;
  needsMpAuth?: boolean;
  checkoutUrl?: string;
  message: string;
};

/**
 * Change gym Fitnexia SaaS tier.
 * iOS paid tiers → StoreKit IAP. Android/web → Mercado Pago.
 */
export async function changeGymTier(
  tierId: string,
  refreshUser: () => Promise<void>,
): Promise<GymPlanChangeResult> {
  const useIap = Platform.OS === 'ios' && tierId !== 'basic';

  if (useIap) {
    if (!isAppleIapAvailable()) {
      throw new Error(
        'Las compras In-App no están disponibles. Instalá un build nativo (TestFlight / development build).',
      );
    }
    const sku = skuForGymTier(tierId);
    if (!sku) {
      throw new Error('Este plan no tiene producto de App Store configurado.');
    }
    await purchaseAppleSubscription(sku);
    await refreshUser();
    const { fetchGymSubscription } = await import('@/services/api/institutions.api');
    const subscription = await fetchGymSubscription();
    return {
      subscription,
      usedIap: true,
      message: 'Tu suscripción de App Store quedó activa.',
    };
  }

  const next = await updateGymSubscriptionApi(tierId);
  await refreshUser();

  const checkoutUrl =
    (next as GymSubscription & { checkoutUrl?: string }).checkoutUrl || next.authorizationUrl;

  if (checkoutUrl) {
    if (Platform.OS === 'ios') {
      throw new Error(
        'En iOS los planes Fitnexia se pagan con In-App Purchase, no con Mercado Pago.',
      );
    }
    return {
      subscription: next,
      needsMpAuth: true,
      checkoutUrl,
      message: 'Para activar este plan tenés que autorizar el cobro en Mercado Pago.',
    };
  }

  return {
    subscription: next,
    message: `Tu plan es ahora ${next.tierName || next.tier}.`,
  };
}

export async function openGymMercadoPagoCheckout(checkoutUrl: string) {
  await openInAppBrowser(checkoutUrl, 'fitnexia://profile/billing-complete');
}

export async function restoreGymApplePurchases(refreshUser: () => Promise<void>) {
  if (Platform.OS !== 'ios') {
    throw new Error('Restaurar compras solo aplica en iOS.');
  }
  const count = await restoreAppleSubscriptions();
  await refreshUser();
  return count;
}
