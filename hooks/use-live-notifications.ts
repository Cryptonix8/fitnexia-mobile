import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';

import { usePeriodicRefresh } from '@/hooks/use-periodic-refresh';
import { fetchNotifications } from '@/services/api/v2-features.api';
import { subscribeAppRefresh } from '@/services/app-refresh';
import type { Notification } from '@/types/api';

export function useLiveNotifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    try {
      const result = await fetchNotifications({ limit: 50 });
      setItems(result.data);
    } catch {
      if (!silent) {
        setItems([]);
      }
    } finally {
      if (!silent) {
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  useEffect(() => subscribeAppRefresh(() => load(true)), [load]);

  usePeriodicRefresh(() => load(true), { intervalMs: 30_000 });

  return { items, setItems, loading };
}
