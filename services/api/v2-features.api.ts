import type { PaginatedResponse, Review } from '@/types/api';

import { apiRequest } from './client';

export type WaitlistEntry = {
  id: string;
  classId: string;
  classTitle?: string;
  classStartAt?: string;
  position: number;
  status: string;
  offerExpiresAt?: string | null;
  createdAt: string;
};

export async function joinWaitlistApi(classId: string) {
  return apiRequest<WaitlistEntry>(`/classes/${classId}/waitlist`, { method: 'POST' });
}

export async function fetchMyWaitlist() {
  const result = await apiRequest<{ data: WaitlistEntry[] }>('/waitlist/me');
  return result.data;
}

export async function confirmWaitlistSpotApi(waitlistId: string) {
  return apiRequest(`/waitlist/${waitlistId}/confirm`, { method: 'POST' });
}

export async function cancelWaitlistEntryApi(waitlistId: string) {
  return apiRequest(`/waitlist/${waitlistId}`, { method: 'DELETE' });
}

export async function fetchInstructorAthleteReviews(instructorId: string) {
  const result = await apiRequest<{ data: Review[] }>(`/instructors/${instructorId}/reviews`, {
    auth: false,
  });
  return result.data;
}

export async function respondToReviewApi(reviewId: string, response: string) {
  return apiRequest<Review>(`/reviews/${reviewId}/response`, {
    method: 'POST',
    body: { response },
  });
}

export async function fetchNotifications(params?: { page?: number; unreadOnly?: boolean }) {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.unreadOnly) query.set('unreadOnly', 'true');
  const qs = query.toString();
  return apiRequest<PaginatedResponse<import('@/types/api').Notification>>(
    `/notifications${qs ? `?${qs}` : ''}`,
  );
}

export async function fetchUnreadNotificationCount() {
  return apiRequest<{ unread: number }>('/notifications/unread-count');
}

export async function markNotificationReadApi(id: string) {
  return apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
}

export async function markAllNotificationsReadApi() {
  return apiRequest('/notifications/read-all', { method: 'POST' });
}
