import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/contexts/auth-context';
import { ALERT_LABELS, BUTTON_LABELS } from '@/constants/labels';

export function useSignOut() {
  const { logout } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = useCallback(() => {
    Alert.alert(ALERT_LABELS.signOutTitle, ALERT_LABELS.signOutMessage, [
      { text: ALERT_LABELS.cancel, style: 'cancel' },
      {
        text: BUTTON_LABELS.signOut,
        style: 'destructive',
        onPress: async () => {
          setSigningOut(true);
          try {
            await logout();
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  }, [logout]);

  return { signOut, signingOut };
}
