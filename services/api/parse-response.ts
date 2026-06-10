import { ApiError } from './errors';

export async function parseJsonResponse<T>(res: Response): Promise<T> {
  let text = '';
  try {
    text = await res.text();
  } catch {
    text = '';
  }

  if (!text.trim()) {
    if (res.ok) {
      return undefined as T;
    }
    throw new ApiError(
      res.status,
      'EMPTY_RESPONSE',
      res.statusText || 'Empty response from server',
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiError(res.status, 'INVALID_JSON', 'Invalid JSON response from server');
  }
}

export async function parseJsonError(res: Response): Promise<ApiError> {
  try {
    const data = await parseJsonResponse<{ error?: { code?: string; message?: string; details?: Record<string, unknown> } }>(res);
    const err = data?.error;
    return new ApiError(
      res.status,
      err?.code ?? 'API_ERROR',
      err?.message ?? res.statusText,
      err?.details ?? {},
    );
  } catch (err) {
    if (err instanceof ApiError) return err;
    return new ApiError(res.status, 'API_ERROR', res.statusText || 'Request failed');
  }
}
