import { Platform } from 'react-native';

import { API_BASE_URL } from './config';
import { ApiError } from './errors';
import { getAccessToken } from './token-storage';

const LOCAL_URI_PREFIXES = ['file://', 'content://', 'ph://', 'assets-library://'];

export function isLocalMediaUri(uri: string | null | undefined): boolean {
  if (!uri) return false;
  const lower = uri.toLowerCase();
  return LOCAL_URI_PREFIXES.some((prefix) => lower.startsWith(prefix));
}

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  if (lower.includes('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function guessFileName(uri: string, mime: string): string {
  const ext = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : mime === 'image/gif' ? 'gif' : 'jpg';
  const match = uri.match(/\/([^/?#]+)$/);
  if (match?.[1]) return match[1];
  return `photo.${ext}`;
}

async function parseUploadError(res: Response): Promise<ApiError> {
  try {
    const data = await res.json();
    const err = data?.error;
    return new ApiError(
      res.status,
      err?.code ?? 'UPLOAD_ERROR',
      err?.message ?? res.statusText,
      err?.details ?? {},
    );
  } catch {
    return new ApiError(res.status, 'UPLOAD_ERROR', res.statusText || 'Upload failed');
  }
}

export async function uploadLocalImage(localUri: string): Promise<string> {
  const mime = guessMimeType(localUri);
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: mime,
    name: guessFileName(localUri, mime),
  } as unknown as Blob);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Client-Platform': Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
  };

  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/media/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
  } catch {
    throw new ApiError(
      0,
      'NETWORK_ERROR',
      `Cannot reach the API at ${API_BASE_URL}. Make sure the backend is running.`,
    );
  }

  if (!res.ok) {
    throw await parseUploadError(res);
  }

  const data = (await res.json()) as { publicUrl: string };
  return data.publicUrl;
}

export async function resolveMediaUrl(
  uri: string | null | undefined,
): Promise<string | null | undefined> {
  if (uri === undefined) return undefined;
  if (uri === null) return null;
  if (isLocalMediaUri(uri)) return uploadLocalImage(uri);
  return uri;
}

export async function resolveMediaUrls(uris: string[]): Promise<string[]> {
  return Promise.all(
    uris.map(async (uri) => {
      const resolved = await resolveMediaUrl(uri);
      return resolved ?? uri;
    }),
  );
}
