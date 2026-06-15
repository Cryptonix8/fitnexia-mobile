import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useEffect } from 'react';

import { routeFromPushData, type PushNotificationData } from '@/services/push-notifications';

function navigateFromNotification(data: PushNotificationData | undefined) {
  const href = routeFromPushData(data);
  if (href) {
    router.push(href as never);
  }
}

export function usePushNotificationRouting() {
  useEffect(() => {
    if (Constants.appOwnership === 'expo') return;

    let subscription: { remove: () => void } | undefined;
    let cancelled = false;

    void import('expo-notifications').then((Notifications) => {
      if (cancelled) return;

      subscription = Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data as PushNotificationData;
        navigateFromNotification(data);
      });

      void Notifications.getLastNotificationResponseAsync().then((response) => {
        if (!response) return;
        const data = response.notification.request.content.data as PushNotificationData;
        navigateFromNotification(data);
      });
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, []);
}
