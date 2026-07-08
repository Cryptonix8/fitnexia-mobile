import type { Booking } from '@/types/api';
import type { CourtReservation } from '@/services/api/courts.api';

import { fetchBookingById, syncBookingPaymentApi } from './bookings.api';
import { syncCourtReservationPaymentApi, fetchCourtReservationById } from './courts.api';
import { apiRequest } from './client';

export type PaymentRecord = {
  id: string;
  bookingId: string;
  provider: string;
  status: 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled';
  amount: { amount: number; currency: string };
  checkoutUrl?: string;
  createdAt: string;
};

export async function fetchPaymentById(id: string) {
  return apiRequest<PaymentRecord>(`/payments/${id}`);
}

export async function waitForBookingConfirmation(
  bookingId: string,
  options?: { attempts?: number; delayMs?: number },
): Promise<Booking> {
  const attempts = options?.attempts ?? 12;
  const delayMs = options?.delayMs ?? 1500;

  for (let i = 0; i < attempts; i += 1) {
    if (i === 0 || i % 3 === 0) {
      try {
        await syncBookingPaymentApi(bookingId);
      } catch {
        // Webhook may have already confirmed; sync is best-effort.
      }
    }

    const booking = await fetchBookingById(bookingId);
    if (booking.status === 'confirmed') return booking;
    if (booking.status === 'cancelled' || booking.status === 'refunded') {
      throw new Error('El pago no se completó.');
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('El pago sigue procesándose. Revisá Mis reservas en un momento.');
}

export async function waitForCourtConfirmation(
  reservationId: string,
  options?: { attempts?: number; delayMs?: number },
): Promise<CourtReservation> {
  const attempts = options?.attempts ?? 12;
  const delayMs = options?.delayMs ?? 1500;

  for (let i = 0; i < attempts; i += 1) {
    if (i === 0 || i % 3 === 0) {
      try {
        await syncCourtReservationPaymentApi(reservationId);
      } catch {
        // Webhook may have already confirmed.
      }
    }

    const reservation = await fetchCourtReservationById(reservationId);
    if (reservation.status === 'confirmed') return reservation;
    if (reservation.status === 'cancelled' || reservation.status === 'refunded') {
      throw new Error('El pago no se completó.');
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('El pago sigue procesándose. Revisá tus reservas en un momento.');
}
