import type { ClassListItem } from '@/types/api';

import { apiRequest } from './client';

type PaginatedClasses = { data: ClassListItem[] };

type HomeFeed = {
  recommended: ClassListItem[];
  nearby: ClassListItem[];
  popular: ClassListItem[];
};

export async function fetchClassesSearch(params: Record<string, string | number> = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  const qs = query.toString();
  return apiRequest<PaginatedClasses>(`/classes/search${qs ? `?${qs}` : ''}`, { auth: false });
}

export async function fetchHomeFeed() {
  return apiRequest<HomeFeed>('/feed/home', { auth: false });
}

export async function fetchClassById(id: string) {
  return apiRequest<ClassListItem>(`/classes/${id}`, { auth: false });
}

export async function fetchMyClasses() {
  const result = await apiRequest<PaginatedClasses>('/classes/mine');
  return result.data;
}

export async function fetchGymClasses() {
  const result = await apiRequest<PaginatedClasses>('/institutions/me/classes');
  return result.data;
}

export async function createClassApi(body: Record<string, unknown>) {
  return apiRequest<ClassListItem>('/classes', { method: 'POST', body });
}

export async function updateClassApi(id: string, body: Record<string, unknown>) {
  return apiRequest<ClassListItem>(`/classes/${id}`, { method: 'PATCH', body });
}

export async function cancelClassApi(id: string) {
  return apiRequest<void>(`/classes/${id}/cancel`, { method: 'POST' });
}

export type ClassSeries = {
  id: string;
  title: string;
  status: 'active' | 'paused' | 'deleted';
  weekdays: number[];
  timeOfDay: string;
  anchorStartAt: string;
};

export async function pauseClassSeriesApi(seriesId: string) {
  return apiRequest<ClassSeries>(`/class-series/${seriesId}/pause`, { method: 'POST' });
}

export async function resumeClassSeriesApi(seriesId: string) {
  return apiRequest<ClassSeries>(`/class-series/${seriesId}/resume`, { method: 'POST' });
}

export async function deleteClassSeriesApi(seriesId: string) {
  return apiRequest<ClassSeries>(`/class-series/${seriesId}/delete`, { method: 'POST' });
}
