import Constants from 'expo-constants';

import { getFirebaseInstallationId } from '@/services/firebase-installations';

function isNativeDevBuild(): boolean {
  return Constants.appOwnership !== 'expo';
}

let initialized = false;

export async function initializeFirebaseInAppMessaging(): Promise<void> {
  if (!isNativeDevBuild() || initialized) return;

  try {
    await import('@react-native-firebase/analytics');
    const { default: inAppMessaging } = await import('@react-native-firebase/in-app-messaging');

    await inAppMessaging().setAutomaticDataCollectionEnabled(true);
    await inAppMessaging().setMessagesDisplaySuppressed(true);

    initialized = true;

    if (__DEV__) {
      const installationId = await getFirebaseInstallationId();
      if (installationId) {
        console.log('[firebase] In-App Messaging ready. Test FID:', installationId);
      }
    }
  } catch (err) {
    console.warn('[firebase] Failed to initialize In-App Messaging:', err);
  }
}

export async function enableInAppMessages(): Promise<void> {
  if (!isNativeDevBuild() || !initialized) return;

  try {
    const { default: inAppMessaging } = await import('@react-native-firebase/in-app-messaging');
    await inAppMessaging().setMessagesDisplaySuppressed(false);
  } catch (err) {
    console.warn('[firebase] Failed to enable In-App Messaging:', err);
  }
}

export async function triggerInAppMessageEvent(eventId: string): Promise<void> {
  if (!isNativeDevBuild()) return;

  try {
    const { default: inAppMessaging } = await import('@react-native-firebase/in-app-messaging');
    await inAppMessaging().triggerEvent(eventId);
  } catch (err) {
    console.warn('[firebase] Failed to trigger in-app message event:', err);
  }
}
