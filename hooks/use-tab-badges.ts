import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/contexts/auth-context';
import { usePeriodicRefresh } from '@/hooks/use-periodic-refresh';
import { fetchUnreadByTab, markTabNotificationsReadApi } from '@/services/api/v2-features.api';
import { requestAppRefresh, subscribeAppRefresh } from '@/services/app-refresh';
import type { UserRole } from '@/types/auth-user';
import { formatTabBadge } from '@/utils/notification-tabs';

export function useTabBadges(_role: UserRole) {
  const { user } = useAuth();
  const [byTab, setByTab] = useState<Record<string, number>>({});

  const load = useCallback(async () => {
    if (!user) {
      setByTab({});
      return;
    }
    try {
      const result = await fetchUnreadByTab();
      setByTab(result.byTab);
    } catch {
      setByTab({});
    }
  }, [user]);

  useEffect(() => subscribeAppRefresh(load), [load]);
  usePeriodicRefresh(load, { enabled: Boolean(user), intervalMs: 30_000 });

  const badgeFor = useCallback(
    (tab: string) => formatTabBadge(byTab[tab] ?? 0),
    [byTab],
  );

  return { byTab, badgeFor, refresh: load };
}

/** Clears unread badges for a tab when the user opens it. */
export function useMarkTabReadOnFocus(tab: string) {
  const { user } = useAuth();

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      void markTabNotificationsReadApi(tab)
        .then(() => requestAppRefresh())
        .catch(() => undefined);
    }, [tab, user]),
  );
}
