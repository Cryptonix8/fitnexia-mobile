import { useEffect } from 'react';

import {
  enableInAppMessages,
  initializeFirebaseInAppMessaging,
} from '@/services/firebase-in-app-messaging';

export function useFirebaseInAppMessaging(appReady: boolean) {
  useEffect(() => {
    void initializeFirebaseInAppMessaging();
  }, []);

  useEffect(() => {
    if (!appReady) return;
    void enableInAppMessages();
  }, [appReady]);
}
