import { Platform } from 'react-native';

import { API_BASE_URL } from './config';
import { safeFetch } from './fetch';
import { parseJsonError, parseJsonResponse } from './parse-response';
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

  const res = await safeFetch(`${API_BASE_URL}/media/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await parseJsonError(res);
    throw err;
  }

  const data = await parseJsonResponse<{ publicUrl?: string }>(res);
  if (!data?.publicUrl) {
    throw new Error('Upload succeeded but no image URL was returned');
  }
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
