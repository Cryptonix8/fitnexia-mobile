import type { InstructorPlan } from '@/types/api';
import { PLAN_COMMISSION_PERCENT } from '@/constants/labels';

import { apiRequest } from './client';

export type PlanConfig = {
  id: InstructorPlan;
  name: string;
  monthlyFeeCents: number;
  commissionPercent: number;
};

function resolveCommissionPercent(plan: PlanConfig): number {
  const local = PLAN_COMMISSION_PERCENT[plan.id as keyof typeof PLAN_COMMISSION_PERCENT];
  return local ?? plan.commissionPercent;
}

export async function fetchPlans() {
  const result = await apiRequest<{ data: PlanConfig[] }>('/config/plans', { auth: false });
  return result.data.map((plan) => ({
    ...plan,
    commissionPercent: resolveCommissionPercent(plan),
  }));
}
