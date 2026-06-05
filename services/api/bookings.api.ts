import type { Booking } from '@/types/api';

import { apiRequest } from './client';

type BookingsResponse = { data: Booking[] };

type CreateBookingResponse = { booking: Booking };

export async function fetchMyBookings() {
  const result = await apiRequest<BookingsResponse>('/bookings/me');
  return result.data;
}

export async function createBookingApi(classId: string, paymentModel = 'per_class') {
  return apiRequest<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: { classId, paymentModel },
  });
}

export async function cancelBookingApi(id: string) {
  return apiRequest<Booking>(`/bookings/${id}/cancel`, { method: 'POST' });
}

export async function submitReviewApi(bookingId: string, rating: number, comment?: string) {
  return apiRequest('/reviews', {
    method: 'POST',
    body: { bookingId, rating, comment: comment || undefined },
  });
}
