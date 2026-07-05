import type { Money } from '@/types/api';

import { apiRequest } from './client';

export type InstitutionMetrics = {
  period: string;
  bookings: number;
  revenue: Money;
  occupancyRate: number;
  retentionRate?: number;
  daily: { date: string; bookings: number; revenueCents: number }[];
  topClasses: {
    title: string;
    bookings: number;
    revenueCents: number;
    occupancyRate: number;
  }[];
  topInstructors?: {
    name: string;
    bookings: number;
    revenueCents: number;
  }[];
};

export type CollectionsPanel = {
  summary: { upToDate: number; pending: number; overdue: number; total: number };
  month: {
    collected: Money;
    expected: Money;
    collectionRate: number;
    paymentsCount: number;
    pendingCount: number;
    failedCount: number;
  };
  dailyCollections: { date: string; collectedCents: number }[];
};

export async function fetchInstitutionMetrics(period: 'day' | 'week' | 'month' = 'week') {
  return apiRequest<InstitutionMetrics>(`/institutions/me/metrics?period=${period}`);
}

export async function fetchInstructorMetrics(period: 'day' | 'week' | 'month' = 'week') {
  return apiRequest<InstitutionMetrics>(`/instructors/me/metrics?period=${period}`);
}

export async function fetchCollectionsPanel() {
  return apiRequest<CollectionsPanel>('/institutions/me/members/collections');
}
