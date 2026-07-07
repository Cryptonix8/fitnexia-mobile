import { useCallback, useEffect } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { useBookings } from '@/contexts/bookings-context';
import { useClasses } from '@/contexts/classes-context';
import { usePeriodicRefresh } from '@/hooks/use-periodic-refresh';
import { requestAppRefresh, subscribeAppRefresh } from '@/services/app-refresh';

/** Keeps auth, classes, and bookings in sync with the server while the app is open. */
export function AppLiveSync() {
  const { user, refreshUser } = useAuth();
  const { refreshClasses } = useClasses();
  const { refreshBookings } = useBookings();

  const refreshAll = useCallback(async () => {
    if (!user) return;
    await Promise.all([
      refreshUser(),
      refreshClasses({ silent: true }),
      user.role === 'athlete' ? refreshBookings({ silent: true }) : Promise.resolve(),
    ]);
  }, [user, refreshUser, refreshClasses, refreshBookings]);

  useEffect(() => subscribeAppRefresh(refreshAll), [refreshAll]);

  usePeriodicRefresh(refreshAll, { enabled: Boolean(user) });

  return null;
}

export { requestAppRefresh };
