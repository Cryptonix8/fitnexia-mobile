import type { CourtSportType } from './courts.api';

import { apiRequest } from './client';

export type OpenGameParticipant = {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUri?: string;
  joinedAt: string;
};

export type OpenGame = {
  id: string;
  creatorUserId: string;
  sportType: CourtSportType;
  title: string;
  description: string;
  startAt: string;
  durationMinutes: number;
  locationLabel: string;
  latitude?: number;
  longitude?: number;
  institutionId?: string;
  courtId?: string;
  institutionName?: string;
  capacity: number;
  spotsLeft: number;
  joinedCount: number;
  level?: string;
  status: 'open' | 'full' | 'cancelled' | 'completed';
  isCreator: boolean;
  myStatus: 'joined' | 'left' | null;
  participants: OpenGameParticipant[];
  createdAt: string;
};

export async function fetchOpenGames(params?: { sportType?: string }) {
  const query = params?.sportType ? `?sportType=${encodeURIComponent(params.sportType)}` : '';
  const result = await apiRequest<{ data: OpenGame[] }>(`/open-games${query}`);
  return result.data;
}

export async function fetchMyOpenGames() {
  const result = await apiRequest<{ data: OpenGame[] }>('/open-games/me');
  return result.data;
}

export async function fetchOpenGameById(id: string) {
  return apiRequest<OpenGame>(`/open-games/${id}`);
}

export async function createOpenGameApi(body: {
  sportType: CourtSportType;
  title: string;
  description?: string;
  startAt: string;
  durationMinutes?: number;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
  institutionId?: string;
  courtId?: string;
  capacity: number;
  level?: string;
}) {
  return apiRequest<OpenGame>('/open-games', { method: 'POST', body });
}

export async function joinOpenGameApi(id: string) {
  return apiRequest<OpenGame>(`/open-games/${id}/join`, { method: 'POST' });
}

export async function leaveOpenGameApi(id: string) {
  return apiRequest<OpenGame>(`/open-games/${id}/leave`, { method: 'POST' });
}

export async function cancelOpenGameApi(id: string) {
  return apiRequest<OpenGame>(`/open-games/${id}/cancel`, { method: 'POST' });
}

export async function fetchOpenGameSports() {
  const result = await apiRequest<{ data: string[] }>('/open-games/sports');
  return result.data;
}
