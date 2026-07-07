import { Header } from '@/components/ui/header';
import { NotificationsInbox } from '@/components/notifications/notifications-inbox';
import { Screen } from '@/components/ui/screen';
import { LOADING_LABELS, NOTIFICATION_LABELS } from '@/constants/labels';

export default function GymNotificationsScreen() {
  return (
    <Screen
      scroll
      loadingMessage={LOADING_LABELS.default}
      header={<Header title={NOTIFICATION_LABELS.screenTitle} showBack />}>
      <NotificationsInbox compact />
    </Screen>
  );
}
