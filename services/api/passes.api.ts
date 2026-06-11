import type { AthletePass, PassProducts } from '@/types/api';

import { apiRequest } from './client';

export async function fetchPassProducts() {
  const result = await apiRequest<{ data: PassProducts }>('/config/pass-products', {
    auth: false,
  });
  return result.data;
}

export async function fetchMyActivePasses() {
  const result = await apiRequest<{ data: AthletePass[] }>('/passes/me/active');
  return result.data;
}
