import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

import {
  routeFromPushData,
  type PushNotificationData,
} from '@/services/push-notification-routing';
import { requestAppRefresh } from '@/services/app-refresh';

function navigateFromNotification(data: PushNotificationData | undefined) {
  const href = routeFromPushData(data);
  if (href) {
    router.push(href as never);
  }
}

export function usePushNotificationRouting() {
  useEffect(() => {
    if (Constants.appOwnership === 'expo') return;

    const receivedSubscription = Notifications.addNotificationReceivedListener(() => {
      requestAppRefresh();
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      requestAppRefresh();
      const data = response.notification.request.content.data as PushNotificationData;
      navigateFromNotification(data);
    });

    void Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (!response) return;
        requestAppRefresh();
        const data = response.notification.request.content.data as PushNotificationData;
        navigateFromNotification(data);
      })
      .catch(() => undefined);

    return () => {
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, []);
}
