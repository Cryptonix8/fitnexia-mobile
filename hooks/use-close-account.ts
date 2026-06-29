import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { ALERT_LABELS, BUTTON_LABELS } from '@/constants/labels';

export function useCloseAccount() {
  const { closeAccount } = useAuth();
  const [closing, setClosing] = useState(false);

  const confirmCloseAccount = useCallback(() => {
    Alert.alert(ALERT_LABELS.closeAccountTitle, ALERT_LABELS.closeAccountMessage, [
      { text: ALERT_LABELS.cancel, style: 'cancel' },
      {
        text: BUTTON_LABELS.closeAccount,
        style: 'destructive',
        onPress: async () => {
          setClosing(true);
          try {
            await closeAccount();
            router.replace('/(auth)/login');
          } catch (err) {
            Alert.alert(ALERT_LABELS.closeAccountFailedTitle, getErrorMessage(err));
          } finally {
            setClosing(false);
          }
        },
      },
    ]);
  }, [closeAccount]);

  return { confirmCloseAccount, closing };
}
