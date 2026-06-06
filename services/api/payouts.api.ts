import type { Money } from '@/types/api';

import { apiRequest } from './client';

export type PayoutSummary = {
  gross: number;
  platformFee: number;
  net: number;
  currency: string;
  commissionRate: number;
  plan: string;
};

export type Payout = {
  id: string;
  classTitle?: string;
  amount: Money;
  gross?: Money;
  status: string;
  createdAt: string;
};

type PayoutsResponse = {
  data: Payout[];
};

export async function fetchPayoutSummary(period: 'day' | 'week' | 'month' = 'month') {
  return apiRequest<PayoutSummary>(`/payouts/me/summary?period=${period}`);
}

export async function fetchRecentPayouts(limit = 20) {
  const result = await apiRequest<PayoutsResponse>(`/payouts/me?limit=${limit}`);
  return result.data;
}

export async function fetchPayoutsCsv(): Promise<string> {
  const { API_BASE_URL } = await import('./config');
  const { getAccessToken } = await import('./token-storage');

  const token = await getAccessToken();
  const res = await fetch(`${API_BASE_URL}/payouts/me/export.csv`, {
    headers: {
      Accept: 'text/csv',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new Error('Failed to export payouts');
  }

  return res.text();
}
