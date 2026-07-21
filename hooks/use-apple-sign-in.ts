import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type AppleSignInCredential = {
  identityToken: string;
  email?: string | null;
  firstName?: string;
  lastName?: string;
};

const unavailableMessage = 'Apple Sign-In no está disponible en este simulador. Verificá que el simulador tenga una cuenta de Apple configurada.';

export function useAppleSignIn() {
  const [pending, setPending] = useState(false);
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    let cancelled = false;
    import('expo-apple-authentication')
      .then((AppleAuthentication) =>
        AppleAuthentication.isAvailableAsync().then((value) => {
          if (!cancelled) setAvailable(value);
        }),
      )
      .catch(() => {
        if (!cancelled) setAvailable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (): Promise<AppleSignInCredential | null> => {
    if (Platform.OS !== 'ios') return null;

    setPending(true);
    try {
      const AppleAuthentication = await import('expo-apple-authentication');
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setAvailable(isAvailable);

      if (!isAvailable) {
        throw new Error(unavailableMessage);
      }

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('Apple no devolvió un token de identidad. Intentá de nuevo o probalo en un dispositivo físico.');
      }

      return {
        identityToken: credential.identityToken,
        email: credential.email,
        firstName: credential.fullName?.givenName ?? undefined,
        lastName: credential.fullName?.familyName ?? undefined,
      };
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === 'ERR_REQUEST_CANCELED') return null;
      throw err;
    } finally {
      setPending(false);
    }
  }, []);

  return {
    signIn,
    pending,
    ready: Platform.OS === 'ios' && available,
  };
}
