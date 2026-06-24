import Constants from 'expo-constants';

/** Must match app.json → android.package and google-services.json */
export const GOOGLE_ANDROID_PACKAGE =
  Constants.expoConfig?.android?.package ?? 'com.fitnexia.app';

/** GCP project number embedded in OAuth client IDs (635752178238-...). */
export const GOOGLE_OAUTH_PROJECT_NUMBER = '635752178238';

/**
 * SHA-1 for the local debug keystore (npx expo run:android).
 * Re-run `npm run google:android-config` after changing signing keys.
 */
export const GOOGLE_ANDROID_DEBUG_SHA1 = '5E:8F:16:06:2E:A3:CD:2C:4A:0D:54:78:76:BA:A6:F3:8C:AB:F6:25';

/**
 * Optional: SHA-1 from EAS / release builds (eas credentials → Android).
 * Set in .env as EXPO_PUBLIC_GOOGLE_ANDROID_SHA1 so the error hint matches your APK.
 */
export const GOOGLE_ANDROID_RELEASE_SHA1 =
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_SHA1?.trim() || '';

function formatSha1Lines(): string[] {
  const lines = [`  SHA-1 (debug / expo run:android): ${GOOGLE_ANDROID_DEBUG_SHA1}`];
  if (GOOGLE_ANDROID_RELEASE_SHA1) {
    lines.push(`  SHA-1 (EAS / APK instalado): ${GOOGLE_ANDROID_RELEASE_SHA1}`);
  } else {
    lines.push(
      '  SHA-1 (EAS / APK): obtenelo con `eas credentials` → Android → SHA-1',
      '  (Opcional: EXPO_PUBLIC_GOOGLE_ANDROID_SHA1 en .env para mostrarlo acá)',
    );
  }
  lines.push('  Podés registrar ambos SHA-1 en el mismo cliente Android.');
  return lines;
}

export function getGoogleDeveloperErrorHelp(): string {
  return [
    'DEVELOPER_ERROR = las credenciales de Google Cloud no coinciden con esta app.',
    '',
    `Proyecto OAuth (donde registrás SHA-1): ${GOOGLE_OAUTH_PROJECT_NUMBER}`,
    '(Es distinto del proyecto Firebase fitnexia-dcd75 — registrá SHA-1 en Credentials, no solo en Firebase.)',
    '',
    'Google Cloud Console → Credentials → cliente OAuth Android (no Web):',
    `  Nombre del paquete: ${GOOGLE_ANDROID_PACKAGE}`,
    ...formatSha1Lines(),
    '',
    `Web client ID en .env (webClientId): ${process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ? 'configurado' : 'FALTA'}`,
    'NO uses el Android client ID como webClientId.',
    '',
    'OAuth consent screen → agregá tu Gmail como usuario de prueba (modo Testing).',
    '',
    'Build local (expo run:android): SHA-1 debug arriba — no hace falta rebuild al cambiar GCP.',
    'APK EAS/preview: SHA-1 EAS arriba — rebuild: eas build -p android --profile preview',
    '',
    'Verificá: npm run google:verify',
    'SHA-1 debug: npm run google:android-config',
    'SHA-1 EAS: eas credentials',
  ].join('\n');
}
