import type { InstructorPlan } from '@/types/api';

import { apiRequest } from './client';

export type PlanConfig = {
  id: InstructorPlan;
  name: string;
  monthlyFeeCents: number;
  commissionPercent: number;
};

export async function fetchPlans() {
  const result = await apiRequest<{ data: PlanConfig[] }>('/config/plans', { auth: false });
  return result.data;
}
