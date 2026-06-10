/** Values required in Google Cloud Console → Credentials → Android OAuth client */
export const GOOGLE_ANDROID_PACKAGE = 'com.antonia0527.Fitnexia';

/**
 * SHA-1 for Expo's default debug keystore at android/app/debug.keystore.
 * Re-run `npm run google:android-config` after changing signing keys.
 */
export const GOOGLE_ANDROID_DEBUG_SHA1 = '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';

export function getGoogleDeveloperErrorHelp(): string {
  return [
    'DEVELOPER_ERROR = las credenciales de Google Cloud no coinciden con esta app.',
    '',
    'En Google Cloud Console → Credentials, creá un cliente OAuth de tipo Android (no Web) con:',
    `  Nombre del paquete: ${GOOGLE_ANDROID_PACKAGE}`,
    `  SHA-1: ${GOOGLE_ANDROID_DEBUG_SHA1}`,
    '',
    'Mantené tu Web client ID existente en EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID.',
    'NO uses el Android client ID como webClientId — solo el Web client ID.',
    '',
    'También revisá OAuth consent screen → agregá tu Gmail como usuario de prueba (modo Testing).',
    '',
    'Los cambios pueden tardar unos minutos. Luego recompilá: npx expo run:android',
    '',
    'Verificá el SHA-1 cuando quieras: npm run google:android-config',
  ].join('\n');
}
