import type { CreditBalance } from '@/types/api';

import { apiRequest } from './client';

export type CreditTransaction = {
  id: string;
  type: 'earn' | 'redeem' | 'expire' | 'adjust';
  amount: number;
  balanceAfter: number;
  bookingId?: string;
  note: string;
  createdAt: string;
};

export async function fetchMyCredits() {
  return apiRequest<CreditBalance>('/credits/me');
}

export async function fetchCreditTransactions() {
  const result = await apiRequest<{ data: CreditTransaction[] }>('/credits/me/transactions');
  return result.data;
}
