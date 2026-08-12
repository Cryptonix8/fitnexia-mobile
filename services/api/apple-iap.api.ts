import { apiRequest } from '@/services/api/client';

export type AppleIapVerifyBody = {
  productId: string;
  transactionId: string;
  originalTransactionId?: string;
  signedTransactionInfo?: string;
  environment?: string;
  bundleId?: string;
};

export type AppleIapVerifyResult = {
  kind: 'instructor' | 'gym';
  plan?: string;
  tier?: string;
  productId: string;
  billingStatus: string;
  transactionId: string;
  originalTransactionId: string;
  subscription?: unknown;
};

export async function verifyAppleIapPurchase(body: AppleIapVerifyBody) {
  return apiRequest<AppleIapVerifyResult>('/platform-billing/apple/verify', {
    method: 'POST',
    body,
  });
}

export async function restoreAppleIapPurchases(purchases: AppleIapVerifyBody[]) {
  return apiRequest<{ results: Array<{ ok: boolean; error?: string } & Partial<AppleIapVerifyResult>> }>(
    '/platform-billing/apple/restore',
    { method: 'POST', body: { purchases } },
  );
}

export async function fetchAppleIapCatalog(kind?: 'instructor' | 'gym') {
  const q = kind ? `?kind=${kind}` : '';
  return apiRequest<{ productIds: string[]; bundleId: string }>(
    `/platform-billing/apple/catalog${q}`,
  );
}
