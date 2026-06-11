import type { Money } from '@/types/api';

import { apiRequest, getAccessToken } from './client';
import { API_BASE_URL } from './config';
import { ApiError } from './errors';
import { safeFetch } from './fetch';

export type PayoutSummary = {
  gross: number;
  platformFee: number;
  net: number;
  currency: string;
  commissionRate: number;
  plan: string;
  marketplace?: {
    enabled: boolean;
    configured: boolean;
    requireSellerConnect: boolean;
    gymPayeePolicy: string;
    passRevenuePolicy: string;
  };
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
  const token = await getAccessToken();
  const res = await safeFetch(`${API_BASE_URL}/payouts/me/export.csv`, {
    headers: {
      Accept: 'text/csv',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!res.ok) {
    throw new ApiError(res.status, 'EXPORT_ERROR', 'Failed to export payouts');
  }

  return res.text();
}
