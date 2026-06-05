import { router } from 'expo-router';
import { Alert } from 'react-native';

import { ApiError, getErrorMessage } from '@/services/api/errors';
import type { GoogleSignInParams } from '@/services/api/auth.api';
import type { UserRole } from '@/types/api';
import {
  getGoogleDeveloperErrorHelp,
  getGoogleSetupInstructions,
  isGoogleSignInConfigured,
  isRunningInExpoGo,
} from '@/services/google-config';

type GoogleAuthOptions = {
  loginWithGoogle: (params: GoogleSignInParams) => Promise<void>;
  getIdToken: () => Promise<string | null>;
  role?: UserRole;
  institutionName?: string;
};

export async function completeGoogleSignIn({
  loginWithGoogle,
  getIdToken,
  role,
  institutionName,
}: GoogleAuthOptions): Promise<void> {
  if (!isGoogleSignInConfigured()) {
    Alert.alert('Google Sign-In', getGoogleSetupInstructions());
    return;
  }

  if (isRunningInExpoGo()) {
    Alert.alert(
      'Use a development build',
      'Google blocks Sign-In inside Expo Go (Error 400).\n\nRun: npx expo run:android\n\nThen open the Fitnexia dev app, not Expo Go.',
    );
    return;
  }

  try {
    const idToken = await getIdToken();
    if (!idToken) return;

    await loginWithGoogle({
      idToken,
      role,
      institutionName,
    });
    router.replace('/');
  } catch (err) {
    if (err instanceof Error && err.message === 'EXPO_GO_UNSUPPORTED') {
      Alert.alert('Use a development build', getGoogleSetupInstructions());
      return;
    }
    if (err instanceof ApiError && err.code === 'NEEDS_ROLE') {
      Alert.alert('Create an account', getErrorMessage(err), [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign up', onPress: () => router.push('/(auth)/register') },
      ]);
      return;
    }
    if (err instanceof Error && err.message.includes('DEVELOPER_ERROR')) {
      Alert.alert('Google Cloud setup required', getGoogleDeveloperErrorHelp());
      return;
    }
    Alert.alert('Google Sign-In failed', getErrorMessage(err));
  }
}
