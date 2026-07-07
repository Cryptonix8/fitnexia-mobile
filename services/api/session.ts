import { getAccessExpiresAt, getRefreshToken } from './token-storage';

const REFRESH_BUFFER_MS = 60_000;

type SessionExpiredListener = () => void;

const listeners = new Set<SessionExpiredListener>();
let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let expiredNotified = false;

export function subscribeSessionExpired(listener: SessionExpiredListener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function notifySessionExpired(): void {
  if (expiredNotified) return;
  expiredNotified = true;
  cancelSessionRefreshTimer();
  for (const listener of listeners) {
    listener();
  }
}

export function resetSessionExpiredFlag(): void {
  expiredNotified = false;
}

export function cancelSessionRefreshTimer(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

export async function scheduleSessionRefresh(
  refreshFn: () => Promise<boolean>,
): Promise<void> {
  cancelSessionRefreshTimer();
  const expiresAt = await getAccessExpiresAt();
  if (!expiresAt) return;

  const runRefresh = async () => {
    try {
      const ok = await refreshFn();
      if (ok) {
        expiredNotified = false;
        await scheduleSessionRefresh(refreshFn);
        return;
      }
      const stillHasSession = await getRefreshToken();
      if (stillHasSession) {
        refreshTimer = setTimeout(() => {
          void runRefresh();
        }, 30_000);
        return;
      }
      notifySessionExpired();
    } catch (err) {
      console.warn('[auth] Scheduled refresh failed:', err);
      refreshTimer = setTimeout(() => {
        void runRefresh();
      }, 30_000);
    }
  };

  const msUntilRefresh = expiresAt - Date.now() - REFRESH_BUFFER_MS;
  if (msUntilRefresh <= 0) {
    await runRefresh();
    return;
  }

  refreshTimer = setTimeout(() => {
    void runRefresh();
  }, msUntilRefresh);
}
