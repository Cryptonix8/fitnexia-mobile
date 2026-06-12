import * as Notifications from 'expo-notifications';
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
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as PushNotificationData;
      navigateFromNotification(data);
    });

    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (!response) return;
      const data = response.notification.request.content.data as PushNotificationData;
      navigateFromNotification(data);
    });

    return () => subscription.remove();
  }, []);
}
