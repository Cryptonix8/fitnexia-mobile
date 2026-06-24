import Constants from 'expo-constants';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import {
  GOOGLE_IOS_CLIENT_ID,
  GOOGLE_WEB_CLIENT_ID,
  isGoogleSignInConfigured,
  isRunningInExpoGo,
} from '@/services/google-config';
import { getGoogleDeveloperErrorHelp } from '@/services/google-android-config';

let configured = false;

type GoogleSignInModule = typeof import('@react-native-google-signin/google-signin');

function canUseNativeGoogleSignIn(): boolean {
  return !isRunningInExpoGo() && Platform.OS !== 'web';
}

function getGoogleSignInModule(): GoogleSignInModule | null {
  if (!canUseNativeGoogleSignIn()) return null;

  try {
    return require('@react-native-google-signin/google-signin');
  } catch {
    return null;
  }
}

function isDeveloperError(err: unknown, mod: GoogleSignInModule): boolean {
  if (!mod.isErrorWithCode(err)) return false;
  const code = String(err.code);
  const message = err.message ?? '';
  return code === '10' || message.includes('DEVELOPER_ERROR');
}

export function configureGoogleSignIn() {
  const mod = getGoogleSignInModule();
  if (!mod || !isGoogleSignInConfigured() || configured) return;

  mod.GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    ...(GOOGLE_IOS_CLIENT_ID ? { iosClientId: GOOGLE_IOS_CLIENT_ID } : {}),
    offlineAccess: false,
  });
  configured = true;
}

export function useGoogleSignIn() {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    configureGoogleSignIn();
  }, []);

  const signIn = useCallback(async (): Promise<string | null> => {
    if (!canUseNativeGoogleSignIn()) {
      throw new Error('EXPO_GO_UNSUPPORTED');
    }
    if (!isGoogleSignInConfigured()) {
      throw new Error('Google Sign-In is not configured.');
    }

    const mod = getGoogleSignInModule();
    if (!mod) {
      throw new Error('Google Sign-In native module is not available.');
    }

    configureGoogleSignIn();
    setPending(true);
    try {
      if (Platform.OS === 'android') {
        await mod.GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const response = await mod.GoogleSignin.signIn();
      if (response.type === 'cancelled') {
        return null;
      }
      if (response.type !== 'success') {
        throw new Error('Google Sign-In was not completed.');
      }

      if (response.data.idToken) {
        return response.data.idToken;
      }

      const { idToken } = await mod.GoogleSignin.getTokens();
      if (!idToken) {
        throw new Error(
          'Google no devolvió idToken. Revisá Web/iOS client ID y SHA-1 + paquete com.fitnexia.app en Google Cloud.',
        );
      }
      return idToken;
    } catch (err) {
      if (mod.isErrorWithCode(err)) {
        if (err.code === mod.statusCodes.SIGN_IN_CANCELLED) return null;
        if (err.code === mod.statusCodes.IN_PROGRESS) {
          throw new Error('Google Sign-In is already in progress.');
        }
        if (err.code === mod.statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new Error('Google Play Services is not available on this device.');
        }
      }
      if (isDeveloperError(err, mod)) {
        throw new Error(getGoogleDeveloperErrorHelp());
      }
      if (err instanceof Error && err.message.includes('DEVELOPER_ERROR')) {
        throw new Error(getGoogleDeveloperErrorHelp());
      }
      throw err;
    } finally {
      setPending(false);
    }
  }, []);

  return {
    signIn,
    pending,
    ready: isGoogleSignInConfigured() && canUseNativeGoogleSignIn(),
    packageName: Constants.expoConfig?.android?.package ?? 'com.fitnexia.app',
  };
}

export function getGoogleSignInEnvironmentLabel(): string {
  if (isRunningInExpoGo()) return 'Expo Go (not supported)';
  return Constants.executionEnvironment ?? 'development build';
}
