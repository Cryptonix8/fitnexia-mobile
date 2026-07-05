import type { Money, OpeningHours } from '@/types/api';

import { apiRequest } from './client';

export type CourtSportType =
  | 'football_5'
  | 'football_7'
  | 'football_11'
  | 'padel'
  | 'tennis'
  | 'rugby'
  | 'other';

export type Court = {
  id: string;
  institutionId: string;
  name: string;
  sportType: CourtSportType;
  surface: string;
  locationType: 'indoor' | 'outdoor';
  hasLighting: boolean;
  operatingHours: OpeningHours;
  active: boolean;
};

export type CourtPricingRule = {
  id: string;
  courtId?: string;
  label: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  isPeak: boolean;
  isWeekend: boolean;
  memberPrice: Money;
  nonMemberPrice: Money;
};

export type CourtScheduleSlot = {
  startAt: string;
  endAt: string;
  available: boolean;
};

export type CourtScheduleDay = {
  court: Court;
  date: string;
  slotMinutes: number;
  slots: CourtScheduleSlot[];
};

export type CourtReservation = {
  id: string;
  courtId: string;
  courtName?: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  status: string;
  price: Money;
  isMemberRate: boolean;
};

export async function fetchGymCourts() {
  const result = await apiRequest<{ data: Court[] }>('/courts/me/courts');
  return result.data;
}

export async function createCourtApi(body: Partial<Court>) {
  return apiRequest<Court>('/courts/me/courts', { method: 'POST', body });
}

export async function updateCourtApi(id: string, body: Partial<Court>) {
  return apiRequest<Court>(`/courts/me/courts/${id}`, { method: 'PATCH', body });
}

export async function deleteCourtApi(id: string) {
  return apiRequest<void>(`/courts/me/courts/${id}`, { method: 'DELETE' });
}

export async function fetchGymPricingRules() {
  const result = await apiRequest<{ data: CourtPricingRule[] }>('/courts/me/pricing-rules');
  return result.data;
}

export async function createPricingRuleApi(body: Record<string, unknown>) {
  return apiRequest<CourtPricingRule>('/courts/me/pricing-rules', { method: 'POST', body });
}

export async function deletePricingRuleApi(id: string) {
  return apiRequest<void>(`/courts/me/pricing-rules/${id}`, { method: 'DELETE' });
}

export async function fetchGymCourtSchedule(params: { date: string; courtId?: string }) {
  const query = new URLSearchParams({ date: params.date });
  if (params.courtId) query.set('courtId', params.courtId);
  const result = await apiRequest<{ data: CourtScheduleDay[] }>(
    `/courts/me/schedule?${query.toString()}`,
  );
  return result.data;
}

export async function fetchInstitutionCourts(institutionId: string) {
  const result = await apiRequest<{ data: Court[] }>(`/courts/institutions/${institutionId}/courts`, {
    auth: false,
  });
  return result.data;
}

export async function fetchInstitutionCourtSchedule(
  institutionId: string,
  params: { date: string; courtId?: string },
) {
  const query = new URLSearchParams({ date: params.date });
  if (params.courtId) query.set('courtId', params.courtId);
  const result = await apiRequest<{ data: CourtScheduleDay[] }>(
    `/courts/institutions/${institutionId}/schedule?${query.toString()}`,
    { auth: false },
  );
  return result.data;
}

export async function quoteCourtPrice(body: {
  courtId: string;
  startAt: string;
  durationMinutes: number;
}) {
  return apiRequest<{
    appliedPrice: Money;
    isMemberRate: boolean;
    memberPrice: Money;
    nonMemberPrice: Money;
  }>('/courts/quote', { method: 'POST', body });
}

export async function createCourtReservationApi(body: {
  courtId: string;
  startAt: string;
  durationMinutes: number;
}) {
  return apiRequest<{ reservation: CourtReservation }>('/courts/reservations', {
    method: 'POST',
    body,
  });
}

export async function fetchMyCourtReservations() {
  const result = await apiRequest<{ data: CourtReservation[] }>('/courts/reservations/me');
  return result.data;
}

export async function cancelCourtReservationApi(id: string) {
  return apiRequest<CourtReservation>(`/courts/reservations/${id}/cancel`, { method: 'POST' });
}

export async function fetchCourtSettings() {
  return apiRequest<{ cancellationPolicyHours: number; defaultSlotMinutes: number }>(
    '/courts/me/settings',
  );
}

export async function updateCourtSettings(body: {
  cancellationPolicyHours?: number;
  defaultSlotMinutes?: number;
}) {
  return apiRequest('/courts/me/settings', { method: 'PATCH', body });
}
