import type { CreateBookingResponse } from '@/types/api';

import { apiRequest } from './client';

type BookingsResponse = { data: import('@/types/api').Booking[] };

export async function fetchMyBookings() {
  const result = await apiRequest<BookingsResponse>('/bookings/me');
  return result.data;
}

export async function fetchBookingById(id: string) {
  return apiRequest<import('@/types/api').Booking>(`/bookings/${id}`);
}

export async function createBookingApi(
  classId: string,
  paymentModel = 'per_class',
): Promise<CreateBookingResponse> {
  return apiRequest<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: { classId, paymentModel },
  });
}

export async function syncBookingPaymentApi(bookingId: string) {
  return apiRequest<import('@/types/api').Booking>(`/bookings/${bookingId}/sync-payment`, {
    method: 'POST',
  });
}

export async function cancelBookingApi(id: string) {
  return apiRequest<import('@/types/api').Booking>(`/bookings/${id}/cancel`, { method: 'POST' });
}

export async function submitReviewApi(bookingId: string, rating: number, comment?: string) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: { bookingId, rating, comment: comment || undefined },
  });
}
