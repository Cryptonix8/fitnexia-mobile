import { Platform } from 'react-native';

import { API_BASE_URL } from './config';
import { ApiError } from './errors';
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

async function parseErrorResponse(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    const err = data?.error;
    return new ApiError(
      res.status,
      err?.code ?? 'API_ERROR',
      err?.message ?? res.statusText,
      err?.details ?? {},
    );
  } catch {
    return new ApiError(res.status, 'API_ERROR', res.statusText || 'Request failed');
  }
}

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return false;

  const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    await clearTokens();
    return false;
  }

  const data = await res.json();
  await setTokens(data.accessToken, data.refreshToken);
  return true;
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

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      `Cannot reach the API at ${API_BASE_URL}. Make sure the backend is running.`,
    );
  }

  if (res.status === 401 && auth && retry) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      return apiRequest<T>(path, { ...options, retry: false });
    }
  }

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    throw await parseErrorResponse(res);
  }

  return res.json() as Promise<T>;
}

export { setTokens, clearTokens, getAccessToken, getRefreshToken };
