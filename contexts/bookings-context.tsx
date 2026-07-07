import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { cancelBookingApi, createBookingApi, fetchMyBookings } from '@/services/api/bookings.api';
import { getErrorMessage } from '@/services/api/errors';
import { useAuth } from '@/contexts/auth-context';
import type { Booking, CreateBookingResponse, PassPeriodType, PaymentModel } from '@/types/api';

interface BookingsContextValue {
  bookings: Booking[];
  isLoading: boolean;
  refreshBookings: (options?: { silent?: boolean }) => Promise<void>;
  createBooking: (
    classId: string,
    paymentModel?: PaymentModel,
    periodType?: PassPeriodType,
  ) => Promise<CreateBookingResponse>;
  cancelBooking: (bookingId: string) => Promise<Booking>;
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshBookings = useCallback(async (options?: { silent?: boolean }) => {
    if (user?.role !== 'athlete') {
      setBookings([]);
      if (!options?.silent) setIsLoading(false);
      return;
    }
    if (!options?.silent) {
      setIsLoading(true);
    }
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err) {
      console.warn('Failed to load bookings:', getErrorMessage(err));
      setBookings([]);
    } finally {
      if (!options?.silent) {
        setIsLoading(false);
      }
    }
  }, [user?.role]);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const createBooking = useCallback(
    async (classId: string, paymentModel?: PaymentModel, periodType?: PassPeriodType) => {
      const result = await createBookingApi(classId, paymentModel, periodType);
      setBookings((prev) => [result.booking, ...prev.filter((b) => b.id !== result.booking.id)]);
      return result;
    },
    [],
  );

  const cancelBooking = useCallback(async (bookingId: string) => {
    const updated = await cancelBookingApi(bookingId);
    setBookings((prev) => prev.map((b) => (b.id === bookingId ? updated : b)));
    return updated;
  }, []);

  const value = useMemo(
    () => ({ bookings, isLoading, refreshBookings, createBooking, cancelBooking }),
    [bookings, isLoading, refreshBookings, createBooking, cancelBooking],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
