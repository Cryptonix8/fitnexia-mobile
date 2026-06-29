import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import {
  registerDeviceTokenApi,
  unregisterDeviceTokenApi,
} from '@/services/api/notifications.api';
import { getFirebaseInstallationId } from '@/services/firebase-installations';

export type { PushNotificationData } from '@/services/push-notification-routing';
export { routeFromPushData } from '@/services/push-notification-routing';

let notificationHandlerConfigured = false;

function getNotifications(): typeof Notifications | null {
  if (isRunningInExpoGo()) return null;
  if (!notificationHandlerConfigured) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  }
  return Notifications;
}

let registeredToken: string | null = null;

function resolvePlatform(): 'ios' | 'android' {
  return Platform.OS === 'ios' ? 'ios' : 'android';
}

function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

function canRegisterForPush(): boolean {
  if (Device.isDevice) return true;
  if (__DEV__ && Platform.OS === 'android') return true;
  return false;
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (isRunningInExpoGo()) {
    console.warn(
      '[push] Push notifications are not supported in Expo Go. Run: npx expo run:android',
    );
    return null;
  }

  if (!canRegisterForPush()) {
    console.warn('[push] Push notifications require a physical device or Android emulator');
    return null;
  }

  if (!Device.isDevice && __DEV__) {
    console.log('[push] Android emulator — registering FCM token (Google Play image required)');
  }

  const notifications = getNotifications();
  if (!notifications) return null;

  if (Platform.OS === 'android') {
    await notifications.setNotificationChannelAsync('fitnexia_default', {
      name: 'Fitnexia',
      importance: notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  let token: string | null = null;
  try {
    const deviceToken = await notifications.getDevicePushTokenAsync();
    token = deviceToken.data;
  } catch (err) {
    console.warn('[push] Native device token unavailable:', err);
    if (projectId) {
      try {
        const expoToken = await notifications.getExpoPushTokenAsync({ projectId });
        token = expoToken.data;
      } catch (expoErr) {
        console.warn('[push] Expo push token unavailable:', expoErr);
      }
    }
  }

  if (!token) return null;

  await registerDeviceTokenApi({ token, platform: resolvePlatform() });
  registeredToken = token;
  if (__DEV__) {
    console.log('[push] Registered device token:', token.slice(0, 12) + '…');
    const installationId = await getFirebaseInstallationId();
    if (installationId) {
      console.log('[push] Firebase Installation ID:', installationId);
    }
  }
  return token;
}

export async function unregisterPushNotifications() {
  if (!registeredToken) return;
  try {
    await unregisterDeviceTokenApi(registeredToken);
  } catch (err) {
    console.warn('[push] Failed to unregister device token:', err);
  } finally {
    registeredToken = null;
  }
}

export function getRegisteredPushToken() {
  return registeredToken;
}
