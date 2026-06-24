import Constants from 'expo-constants';
import { Platform } from 'react-native';

import {
  GOOGLE_ANDROID_DEBUG_SHA1,
  GOOGLE_ANDROID_PACKAGE,
  GOOGLE_ANDROID_RELEASE_SHA1,
  getGoogleDeveloperErrorHelp,
} from './google-android-config';

export {
  getGoogleDeveloperErrorHelp,
  GOOGLE_ANDROID_DEBUG_SHA1,
  GOOGLE_ANDROID_PACKAGE,
  GOOGLE_ANDROID_RELEASE_SHA1,
} from './google-android-config';

export const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
export const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
export const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

export function isGoogleSignInConfigured(): boolean {
  if (!GOOGLE_WEB_CLIENT_ID) return false;
  if (Platform.OS === 'ios' && !GOOGLE_IOS_CLIENT_ID) return false;
  return true;
}

/** Google blocks browser OAuth in Expo Go (`exp://` redirects). Use a dev build instead. */
export function isRunningInExpoGo(): boolean {
  return Constants.appOwnership === 'expo';
}

export function getGoogleSetupInstructions(): string {
  const lines = [
    'Configurá Google Sign-In en fitnexia-mobile/.env:',
    '',
    '  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web client ID>',
    '  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS client ID>',
    '  EXPO_PUBLIC_GOOGLE_ANDROID_SHA1=<SHA-1 del APK EAS>',
    '',
    'Usá una build nativa (npx expo run:android / eas build), no Expo Go.',
    'Verificá: npm run google:verify',
  ];
  if (!GOOGLE_WEB_CLIENT_ID) lines.unshift('Falta EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.');
  if (!GOOGLE_IOS_CLIENT_ID) lines.push('iOS requiere EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID.');
  return lines.join('\n');
}

/** @deprecated Use getGoogleSetupInstructions */
export function getGoogleClientHint(): string {
  return getGoogleSetupInstructions();
}
