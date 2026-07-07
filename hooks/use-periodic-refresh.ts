import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

type RefreshFn = () => void | Promise<void>;

/**
 * Re-fetch data while the app is open and when returning from background.
 * `useState` in contexts holds values; this hook keeps them up to date.
 */
export function usePeriodicRefresh(
  refresh: RefreshFn,
  {
    enabled = true,
    intervalMs = 45_000,
  }: {
    enabled?: boolean;
    intervalMs?: number;
  } = {},
) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    if (!enabled) return;

    let interval: ReturnType<typeof setInterval> | undefined;

    const runRefresh = () => {
      void refreshRef.current();
    };

    const handleAppState = (state: AppStateStatus) => {
      if (state === 'active') {
        runRefresh();
      }
    };

    runRefresh();
    interval = setInterval(runRefresh, intervalMs);
    const subscription = AppState.addEventListener('change', handleAppState);

    return () => {
      if (interval) clearInterval(interval);
      subscription.remove();
    };
  }, [enabled, intervalMs]);
}
