import { apiRequest } from './client';

export type CourtRecurringShift = {
  id: string;
  courtId: string;
  institutionId: string;
  courtName?: string;
  institutionName?: string;
  weekday: number;
  weekdayLabel: string;
  startTime: string;
  durationMinutes: number;
  label: string;
  groupLabel?: string;
  active: boolean;
  nextOccurrenceAt: string | null;
  lastGeneratedAt: string | null;
  createdAt: string;
};

export async function fetchMyRecurringShifts() {
  const result = await apiRequest<{ data: CourtRecurringShift[] }>('/courts/recurring-shifts/me');
  return result.data;
}

export async function createRecurringShiftApi(body: {
  courtId: string;
  weekday: number;
  startTime: string;
  durationMinutes: number;
  label?: string;
  groupLabel?: string;
}) {
  return apiRequest<CourtRecurringShift>('/courts/recurring-shifts', { method: 'POST', body });
}

export async function cancelRecurringShiftApi(id: string) {
  return apiRequest<CourtRecurringShift>(`/courts/recurring-shifts/${id}/cancel`, {
    method: 'POST',
  });
}
