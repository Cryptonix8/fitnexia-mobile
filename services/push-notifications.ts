export type { PushNotificationData } from '@/services/push-notification-routing';
export { routeFromPushData } from '@/services/push-notification-routing';

export async function registerForPushNotifications(): Promise<string | null> {
  return null;
}

export async function unregisterPushNotifications(): Promise<void> {}

export function getRegisteredPushToken() {
  return null;
}
