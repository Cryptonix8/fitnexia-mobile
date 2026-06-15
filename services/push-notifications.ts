import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

import { getFirebaseInstallationId } from '@/services/firebase-installations';
import {
  registerDeviceTokenApi,
  unregisterDeviceTokenApi,
} from '@/services/api/notifications.api';

type NotificationsModule = typeof import('expo-notifications');

let notificationsModule: NotificationsModule | null = null;
let notificationHandlerConfigured = false;

async function getNotifications(): Promise<NotificationsModule | null> {
  if (isRunningInExpoGo()) return null;
  if (!notificationsModule) {
    notificationsModule = await import('expo-notifications');
  }
  if (!notificationHandlerConfigured) {
    notificationsModule.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    notificationHandlerConfigured = true;
  }
  return notificationsModule;
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
  // Android emulators with Google Play can receive FCM in a dev build.
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

  const Notifications = await getNotifications();
  if (!Notifications) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('fitnexia_default', {
      name: 'Fitnexia',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
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
    const deviceToken = await Notifications.getDevicePushTokenAsync();
    token = deviceToken.data;
  } catch (err) {
    console.warn('[push] Native device token unavailable:', err);
    if (projectId) {
      try {
        const expoToken = await Notifications.getExpoPushTokenAsync({ projectId });
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

export type PushNotificationData = {
  type?: string;
  bookingId?: string;
  classId?: string;
  inviteId?: string;
  screen?: string;
};

export function routeFromPushData(data: PushNotificationData | undefined) {
  if (!data) return null;

  if (data.screen) return data.screen;

  switch (data.type) {
    case 'password_reset':
      return '/(auth)/forgot-password';
    case 'booking_confirmed':
    case 'payment_confirmed':
      return '/(athlete)/(tabs)/bookings';
    case 'class_reminder_24h':
    case 'class_reminder_1h':
      return data.classId ? `/class/${data.classId}` : '/(athlete)/(tabs)/bookings';
    case 'instructor_invite':
      return '/(instructor)/(tabs)/dashboard';
    case 'review_invite':
      return data.bookingId ? `/review/${data.bookingId}` : '/(athlete)/(tabs)/bookings';
    default:
      return null;
  }
}
