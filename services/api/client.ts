import { Platform } from 'react-native';

import { API_BASE_URL } from './config';
import { safeFetch } from './fetch';
import { ApiError } from './errors';
import { parseJsonError, parseJsonResponse } from './parse-response';
import { notifySessionExpired } from './session';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './token-storage';

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  retry?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

export async function refreshSession(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        await clearTokens();
        return false;
      }

      const res = await safeFetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) {
        await clearTokens();
        return false;
      }

      const data = await parseJsonResponse<{
        accessToken?: string;
        refreshToken?: string;
        expiresIn?: number;
      }>(res);
      if (!data?.accessToken || !data?.refreshToken) {
        await clearTokens();
        return false;
      }
      await setTokens(data.accessToken, data.refreshToken, data.expiresIn);
      return true;
    } catch (err) {
      // Keep session when offline; only clear tokens on auth failures above.
      if (err instanceof ApiError && err.code === 'NETWORK_ERROR') {
        console.warn('[auth] Token refresh skipped (offline):', err.message);
        return false;
      }
      await clearTokens();
      return false;
    }
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

async function handleUnauthorized(): Promise<boolean> {
  const refreshed = await refreshSession();
  if (!refreshed) {
    const stillHasSession = await getRefreshToken();
    if (!stillHasSession) {
      notifySessionExpired();
    }
  }
  return refreshed;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = true, retry = true } = options;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'X-Client-Platform': Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
  };

  if (auth) {
    const token = await getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await safeFetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && retry) {
    const refreshed = await handleUnauthorized();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retry: false });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    throw await parseJsonError(res);
  }

  return parseJsonResponse<T>(res);
}

export { setTokens, clearTokens, getAccessToken, getRefreshToken };
