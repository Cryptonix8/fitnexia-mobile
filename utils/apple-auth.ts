import { router } from 'expo-router';
import { Alert } from 'react-native';

import { ApiError, getErrorMessage } from '@/services/api/errors';
import type { AppleSignInParams } from '@/services/api/auth.api';
import type { UserRole } from '@/types/api';
import type { AppleSignInCredential } from '@/hooks/use-apple-sign-in';

type AppleAuthOptions = {
  loginWithApple: (params: AppleSignInParams) => Promise<void>;
  signIn: () => Promise<AppleSignInCredential | null>;
  role?: UserRole;
  institutionName?: string;
};

export async function completeAppleSignIn({
  loginWithApple,
  signIn,
  role,
  institutionName,
}: AppleAuthOptions): Promise<void> {
  try {
    const credential = await signIn();
    if (!credential) return;

    await loginWithApple({
      identityToken: credential.identityToken,
      email: credential.email ?? undefined,
      firstName: credential.firstName,
      lastName: credential.lastName,
      role,
      institutionName,
    });
  } catch (err) {
    if (err instanceof ApiError && err.code === 'NEEDS_ROLE') {
      Alert.alert('Crear una cuenta', getErrorMessage(err), [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Registrarse', onPress: () => router.push('/register') },
      ]);
      return;
    }
    Alert.alert('Error en el inicio de sesión con Apple', getErrorMessage(err));
  }
}
