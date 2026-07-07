import { NOTIFICATION_LABELS } from '@/constants/labels';
import { Header } from '@/components/ui/header';
import { NotificationsSettings } from '@/components/profile/notifications-settings';
import { Screen } from '@/components/ui/screen';

export default function GymNotificationPrefsScreen() {
  return (
    <Screen scroll header={<Header title={NOTIFICATION_LABELS.preferencesTitle} showBack />}>
      <NotificationsSettings />
    </Screen>
  );
}
