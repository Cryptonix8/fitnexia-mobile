import { Platform } from 'react-native';

import { ALL_SAAS_SKUS, GYM_TIER_TO_SKU, INSTRUCTOR_PLAN_TO_SKU } from '@/constants/apple-iap';
import {
  restoreAppleIapPurchases,
  verifyAppleIapPurchase,
  type AppleIapVerifyBody,
} from '@/services/api/apple-iap.api';

type ExpoIapModule = typeof import('expo-iap');
type PurchaseLike = {
  id: string;
  productId: string;
  purchaseToken?: string | null;
  transactionId?: string | null;
  originalTransactionIdentifierIOS?: string | null;
  environmentIOS?: string | null;
  appBundleIdIOS?: string | null;
};

let connectionPromise: Promise<boolean> | null = null;

function canUseIap(): boolean {
  return Platform.OS === 'ios';
}

function getExpoIap(): ExpoIapModule | null {
  if (!canUseIap()) return null;
  try {
    return require('expo-iap') as ExpoIapModule;
  } catch {
    return null;
  }
}

export function isAppleIapAvailable(): boolean {
  return Boolean(getExpoIap());
}

export async function ensureIapConnection(): Promise<boolean> {
  const iap = getExpoIap();
  if (!iap) return false;
  if (!connectionPromise) {
    connectionPromise = iap
      .initConnection()
      .then(() => true)
      .catch((err) => {
        connectionPromise = null;
        console.warn('[iap] initConnection failed', err);
        return false;
      });
  }
  return connectionPromise;
}

export function skuForInstructorPlan(planId: string): string | null {
  return INSTRUCTOR_PLAN_TO_SKU[planId] ?? null;
}

export function skuForGymTier(tierId: string): string | null {
  return GYM_TIER_TO_SKU[tierId] ?? null;
}

function purchaseToVerifyBody(purchase: PurchaseLike): AppleIapVerifyBody {
  const transactionId = String(purchase.transactionId || purchase.id || '');
  return {
    productId: String(purchase.productId || ''),
    transactionId,
    originalTransactionId: String(
      purchase.originalTransactionIdentifierIOS || transactionId,
    ),
    signedTransactionInfo: purchase.purchaseToken || undefined,
    environment: purchase.environmentIOS || undefined,
    bundleId: purchase.appBundleIdIOS || undefined,
  };
}

/**
 * Purchase a SaaS subscription SKU via StoreKit, verify on backend, finish transaction.
 */
export async function purchaseAppleSubscription(sku: string): Promise<AppleIapVerifyBody> {
  const iap = getExpoIap();
  if (!iap) {
    throw new Error(
      'In-App Purchase no está disponible. Usá un build de desarrollo / TestFlight en iOS.',
    );
  }

  const ready = await ensureIapConnection();
  if (!ready) throw new Error('No se pudo conectar con la App Store.');

  await iap.fetchProducts({ skus: [sku], type: 'subs' });

  const purchase = await new Promise<PurchaseLike>((resolve, reject) => {
    const updateSub = iap.purchaseUpdatedListener((p) => {
      cleanup();
      resolve(p as PurchaseLike);
    });
    const errorSub = iap.purchaseErrorListener((error) => {
      cleanup();
      try {
        const mod = require('expo-iap') as ExpoIapModule & {
          isUserCancelledError?: (e: unknown) => boolean;
        };
        if (mod.isUserCancelledError?.(error)) {
          reject(new Error('Compra cancelada.'));
          return;
        }
      } catch {
        // fall through
      }
      const code = String(error?.code || '');
      if (code === 'user-cancelled' || code.toLowerCase().includes('cancel')) {
        reject(new Error('Compra cancelada.'));
        return;
      }
      reject(new Error(error?.message || 'Error en la compra de la App Store.'));
    });

    function cleanup() {
      updateSub.remove();
      errorSub.remove();
    }

    iap
      .requestPurchase({
        request: {
          apple: { sku },
        },
        type: 'subs',
      })
      .catch((err: unknown) => {
        cleanup();
        reject(err instanceof Error ? err : new Error(String(err)));
      });
  });

  const body = purchaseToVerifyBody(purchase);
  if (!body.productId || !body.transactionId) {
    throw new Error('La App Store no devolvió datos de la transacción.');
  }

  await verifyAppleIapPurchase(body);

  try {
    await iap.finishTransaction({
      purchase: purchase as never,
      isConsumable: false,
    });
  } catch (err) {
    console.warn('[iap] finishTransaction', err);
  }

  return body;
}

export async function restoreAppleSubscriptions(): Promise<number> {
  const iap = getExpoIap();
  if (!iap) {
    throw new Error('In-App Purchase no está disponible en este dispositivo.');
  }

  const ready = await ensureIapConnection();
  if (!ready) throw new Error('No se pudo conectar con la App Store.');

  try {
    await iap.restorePurchases();
  } catch {
    // Some builds only expose getAvailablePurchases
  }

  const available = (await iap.getAvailablePurchases()) as PurchaseLike[];
  const skuSet = new Set<string>(ALL_SAAS_SKUS);
  const bodies = (available || [])
    .filter((p) => p?.productId && skuSet.has(p.productId))
    .map((p) => purchaseToVerifyBody(p));

  if (!bodies.length) return 0;

  const result = await restoreAppleIapPurchases(bodies);
  const ok = result.results?.filter((r) => r.ok).length ?? 0;

  for (const p of available || []) {
    try {
      await iap.finishTransaction({ purchase: p as never, isConsumable: false });
    } catch {
      // ignore
    }
  }

  return ok;
}

export async function endIapConnection(): Promise<void> {
  const iap = getExpoIap();
  if (!iap) return;
  try {
    await iap.endConnection();
  } catch {
    // ignore
  }
  connectionPromise = null;
}
