import { apiRequest } from './client';

export type StreamRole = 'host' | 'participant';

export type ClassStreamStatus = {
  id: string;
  classId: string;
  roomName: string;
  status: 'scheduled' | 'live' | 'ended' | 'cancelled';
  startedAt: string | null;
  endedAt: string | null;
  hostUserId?: string;
  livekitConfigured: boolean;
  withinJoinWindow: boolean;
  canJoin: boolean;
  role: StreamRole | null;
  classTitle: string;
  classStartAt: string;
  classDurationMinutes: number;
};

export type ClassStreamJoin = {
  id: string;
  classId: string;
  roomName: string;
  status: ClassStreamStatus['status'];
  token: string;
  url: string;
  role: StreamRole;
  canPublish: boolean;
  identity: string;
  displayName: string;
  classTitle: string;
  startedAt: string | null;
  endedAt: string | null;
};

export async function fetchClassStreamStatus(classId: string) {
  return apiRequest<ClassStreamStatus>(`/classes/${classId}/stream`);
}

export async function joinClassStream(classId: string) {
  return apiRequest<ClassStreamJoin>(`/classes/${classId}/stream/join`, { method: 'POST' });
}

export async function leaveClassStream(classId: string) {
  return apiRequest<{ left: boolean }>(`/classes/${classId}/stream/leave`, { method: 'POST' });
}

export async function endClassStream(classId: string) {
  return apiRequest<ClassStreamStatus>(`/classes/${classId}/stream/end`, { method: 'POST' });
}
