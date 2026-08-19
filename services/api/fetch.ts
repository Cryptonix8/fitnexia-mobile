import { API_BASE_URL } from './config';
import { ApiError } from './errors';

function networkErrorMessage(url?: string, cause?: unknown): string {
  const target = url?.startsWith('http') ? url : API_BASE_URL;
  const extra =
    __DEV__ && cause instanceof Error && cause.message ? ` (${cause.message})` : '';
  return `Cannot reach the API at ${target}. Make sure the backend is running.${extra}`;
}

function isFetchFailure(err: unknown): boolean {
  if (err instanceof ApiError) return false;
  if (err instanceof RangeError) {
    return /response|status/i.test(err.message);
  }
  if (err instanceof Error) {
    return /network|failed|fetch|aborted|ssl|certificat|trust|handshake/i.test(err.message);
  }
  return false;
}

export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

  try {
    const res = await fetch(input, init);
    if (res.status === 0) {
      throw new ApiError(0, 'NETWORK_ERROR', networkErrorMessage(url));
    }
    return res;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    if (__DEV__) {
      console.warn('[api] fetch failed', url, err);
    }
    if (isFetchFailure(err)) {
      throw new ApiError(0, 'NETWORK_ERROR', networkErrorMessage(url, err));
    }
    throw err;
  }
}
