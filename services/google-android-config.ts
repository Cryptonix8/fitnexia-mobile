/** Values required in Google Cloud Console → Credentials → Android OAuth client */
export const GOOGLE_ANDROID_PACKAGE = 'com.antonia0527.Fitnexia';

/**
 * SHA-1 for Expo's default debug keystore at android/app/debug.keystore.
 * Re-run `npm run google:android-config` after changing signing keys.
 */
export const GOOGLE_ANDROID_DEBUG_SHA1 = '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';

export function getGoogleDeveloperErrorHelp(): string {
  return [
    'DEVELOPER_ERROR = Google Cloud credentials do not match this app.',
    '',
    'In Google Cloud Console → Credentials, create an OAuth client of type Android (not Web) with:',
    `  Package name: ${GOOGLE_ANDROID_PACKAGE}`,
    `  SHA-1: ${GOOGLE_ANDROID_DEBUG_SHA1}`,
    '',
    'Keep your existing Web client ID in EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
    'Do NOT use the Android client ID as webClientId — only the Web client ID.',
    '',
    'Also check OAuth consent screen → add your Gmail as a Test user (Testing mode).',
    '',
    'Changes can take a few minutes. Then rebuild: npx expo run:android',
    '',
    'Verify SHA-1 anytime: npm run google:android-config',
  ].join('\n');
}
