import Constants from 'expo-constants';

import { getGoogleDeveloperErrorHelp } from './google-android-config';

export { getGoogleDeveloperErrorHelp, GOOGLE_ANDROID_DEBUG_SHA1, GOOGLE_ANDROID_PACKAGE } from './google-android-config';

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

export function isGoogleSignInConfigured(): boolean {
  return Boolean(GOOGLE_WEB_CLIENT_ID);
}

/** Google blocks browser OAuth in Expo Go (`exp://` redirects). Use a dev build instead. */
export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

export function getGoogleSetupInstructions(): string {
  return getGoogleDeveloperErrorHelp();
}

/** @deprecated Use getGoogleSetupInstructions */
export function getGoogleClientHint(): string {
  return getGoogleSetupInstructions();
}
