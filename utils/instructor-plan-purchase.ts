import { Platform } from 'react-native';

import {
  isAppleIapAvailable,
  purchaseAppleSubscription,
  restoreAppleSubscriptions,
  skuForInstructorPlan,
} from '@/services/iap/apple-saas-iap';
import { apiRequest } from '@/services/api/client';
import { getErrorMessage } from '@/services/api/errors';
import type { InstructorPlan } from '@/types/api';
import { openInAppBrowser } from '@/utils/in-app-browser';

type PlanChangeResult = {
  plan: string;
  usedIap?: boolean;
  message: string;
};

/**
 * Change instructor Fitnexia plan.
 * iOS paid plans → StoreKit IAP. Android/web → Mercado Pago (existing).
 */
export async function changeInstructorPlan(
  planId: InstructorPlan,
  refreshUser: () => Promise<void>,
): Promise<PlanChangeResult> {
  const useIap = Platform.OS === 'ios' && planId !== 'basic';

  if (useIap) {
    if (!isAppleIapAvailable()) {
      throw new Error(
        'Las compras In-App no están disponibles. Instalá un build nativo (TestFlight / development build).',
      );
    }
    const sku = skuForInstructorPlan(planId);
    if (!sku) {
      throw new Error('Este plan no tiene producto de App Store configurado.');
    }
    await purchaseAppleSubscription(sku);
    await refreshUser();
    return {
      plan: planId,
      usedIap: true,
      message: 'Tu suscripción de App Store quedó activa.',
    };
  }

  const result = await apiRequest<{
    plan: string;
    checkoutUrl?: string;
    authorizationUrl?: string;
  }>('/instructors/me/plan', {
    method: 'POST',
    body: { plan: planId },
  });
  await refreshUser();

  const checkoutUrl = result.checkoutUrl || result.authorizationUrl;
  if (checkoutUrl) {
    if (Platform.OS === 'ios') {
      throw new Error(
        'En iOS los planes Fitnexia se pagan con In-App Purchase, no con Mercado Pago.',
      );
    }
    await openInAppBrowser(checkoutUrl, 'fitnexia://profile/billing-complete');
    await refreshUser();
    return {
      plan: result.plan,
      message: 'Cuando Mercado Pago confirme el cobro, tu plan se activará.',
    };
  }

  return {
    plan: result.plan,
    message: 'Tu plan quedó activo.',
  };
}

export async function restoreInstructorApplePurchases(refreshUser: () => Promise<void>) {
  if (Platform.OS !== 'ios') {
    throw new Error('Restaurar compras solo aplica en iOS.');
  }
  const count = await restoreAppleSubscriptions();
  await refreshUser();
  return count;
}

export { getErrorMessage };
