import { apiRequest } from './client';

export async function registerDeviceTokenApi(body: { token: string; platform: 'ios' | 'android' }) {
  return apiRequest<{ registered: boolean }>('/notifications/devices', {
    method: 'POST',
    body,
  });
}

export async function unregisterDeviceTokenApi(token: string) {
  return apiRequest<void>(`/notifications/devices/${encodeURIComponent(token)}`, {
    method: 'DELETE',
  });
}
