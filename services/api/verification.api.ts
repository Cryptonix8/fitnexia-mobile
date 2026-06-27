import { Platform } from 'react-native';

import { API_BASE_URL } from './config';
import { safeFetch } from './fetch';
import { parseJsonError, parseJsonResponse } from './parse-response';
import { getAccessToken } from './token-storage';

export type ProfileVerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export type VerificationStatusResponse = {
  verificationStatus: ProfileVerificationStatus;
  verified: boolean;
  latestRequest?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    submittedAt: string;
    reviewedAt?: string;
    rejectionReason?: string;
  } | null;
};

function guessMimeType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.includes('.pdf')) return 'application/pdf';
  if (lower.includes('.png')) return 'image/png';
  if (lower.includes('.webp')) return 'image/webp';
  return 'image/jpeg';
}

function guessFileName(uri: string, fallback: string): string {
  const match = uri.match(/\/([^/?#]+)$/);
  return match?.[1] ?? fallback;
}

function appendFile(formData: FormData, field: string, uri: string) {
  const mime = guessMimeType(uri);
  formData.append(field, {
    uri,
    type: mime,
    name: guessFileName(uri, `${field}.jpg`),
  } as unknown as Blob);
}

export async function fetchVerificationStatusApi(): Promise<VerificationStatusResponse> {
  return apiRequest<VerificationStatusResponse>('/verification-requests/me');
}

export async function submitVerificationApi(files: {
  dniFront: string;
  dniBack: string;
  certification: string;
}): Promise<{ id: string; status: string; verificationStatus: ProfileVerificationStatus }> {
  const formData = new FormData();
  appendFile(formData, 'dni_front', files.dniFront);
  appendFile(formData, 'dni_back', files.dniBack);
  appendFile(formData, 'certification', files.certification);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Client-Platform': Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
  };
  const token = await getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await safeFetch(`${API_BASE_URL}/verification-requests`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!res.ok) {
    throw await parseJsonError(res);
  }
  return parseJsonResponse(res);
}

// local helper — avoid circular import from client
async function apiRequest<T>(path: string): Promise<T> {
  const token = await getAccessToken();
  const res = await safeFetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw await parseJsonError(res);
  return parseJsonResponse<T>(res);
}
