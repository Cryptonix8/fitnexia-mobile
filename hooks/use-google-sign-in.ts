import Constants from 'expo-constants';
import { GoogleSignin, isErrorWithCode, statusCodes } from '@react-native-google-signin/google-signin';
import { useCallback, useEffect, useState } from 'react';

import {
  GOOGLE_WEB_CLIENT_ID,
  isGoogleSignInConfigured,
  isRunningInExpoGo,
} from '@/services/google-config';
import { getGoogleDeveloperErrorHelp } from '@/services/google-android-config';

let configured = false;

export function configureGoogleSignIn() {
  if (!isGoogleSignInConfigured() || configured) return;

  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: false,
  });
  configured = true;
}

export function useGoogleSignIn() {
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!isRunningInExpoGo()) {
      configureGoogleSignIn();
    }
  }, []);

  const signIn = useCallback(async (): Promise<string | null> => {
    if (isRunningInExpoGo()) {
      throw new Error('EXPO_GO_UNSUPPORTED');
    }
    if (!isGoogleSignInConfigured()) {
      throw new Error('Google Sign-In is not configured.');
    }

    configureGoogleSignIn();
    setPending(true);
    try {
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      if (response.type === 'cancelled') {
        return null;
      }
      if (response.type !== 'success') {
        throw new Error('Google Sign-In was not completed.');
      }

      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) {
        throw new Error('Google did not return an ID token. Check your Web client ID and SHA-1 setup.');
      }
      return idToken;
    } catch (err) {
      if (isErrorWithCode(err)) {
        if (err.code === statusCodes.SIGN_IN_CANCELLED) return null;
        if (err.code === statusCodes.IN_PROGRESS) {
          throw new Error('Google Sign-In is already in progress.');
        }
        if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          throw new Error('Google Play Services is not available on this device.');
        }
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
    ready: isGoogleSignInConfigured() && !isRunningInExpoGo(),
  };
}

export function getGoogleSignInEnvironmentLabel(): string {
  if (isRunningInExpoGo()) return 'Expo Go (not supported)';
  return Constants.executionEnvironment ?? 'development build';
}
