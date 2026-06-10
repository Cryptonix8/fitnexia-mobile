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
    Alert.alert('Inicio de sesión con Google', getGoogleSetupInstructions());
    return;
  }

  if (isRunningInExpoGo()) {
    Alert.alert(
      'Usá una build de desarrollo',
      'Google bloquea el inicio de sesión dentro de Expo Go (Error 400).\n\nEjecutá: npx expo run:android\n\nLuego abrí la app de desarrollo de Fitnexia, no Expo Go.',
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
      Alert.alert('Usá una build de desarrollo', getGoogleSetupInstructions());
      return;
    }
    if (err instanceof ApiError && err.code === 'NEEDS_ROLE') {
      Alert.alert('Crear una cuenta', getErrorMessage(err), [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Registrarse', onPress: () => router.push('/(auth)/register') },
      ]);
      return;
    }
    if (err instanceof Error && err.message.includes('DEVELOPER_ERROR')) {
      Alert.alert('Se requiere configuración de Google Cloud', getGoogleDeveloperErrorHelp());
      return;
    }
    Alert.alert('Error en el inicio de sesión con Google', getErrorMessage(err));
  }
}
