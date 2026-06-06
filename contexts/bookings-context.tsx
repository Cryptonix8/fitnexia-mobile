import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { createBookingApi, fetchMyBookings } from '@/services/api/bookings.api';
import { getErrorMessage } from '@/services/api/errors';
import { useAuth } from '@/contexts/auth-context';
import type { Booking, CreateBookingResponse } from '@/types/api';

interface BookingsContextValue {
  bookings: Booking[];
  isLoading: boolean;
  refreshBookings: () => Promise<void>;
  createBooking: (classId: string) => Promise<CreateBookingResponse>;
}

const BookingsContext = createContext<BookingsContextValue | null>(null);

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshBookings = useCallback(async () => {
    if (user?.role !== 'athlete') {
      setBookings([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchMyBookings();
      setBookings(data);
    } catch (err) {
      console.warn('Failed to load bookings:', getErrorMessage(err));
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.role]);

  useEffect(() => {
    refreshBookings();
  }, [refreshBookings]);

  const createBooking = useCallback(async (classId: string) => {
    const result = await createBookingApi(classId);
    setBookings((prev) => [result.booking, ...prev.filter((b) => b.id !== result.booking.id)]);
    return result;
  }, []);

  const value = useMemo(
    () => ({ bookings, isLoading, refreshBookings, createBooking }),
    [bookings, isLoading, refreshBookings, createBooking],
  );

  return <BookingsContext.Provider value={value}>{children}</BookingsContext.Provider>;
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error('useBookings must be used within BookingsProvider');
  return ctx;
}
