import { Header } from '@/components/ui/header';
import { NotificationsSettings } from '@/components/profile/notifications-settings';
import { Screen } from '@/components/ui/screen';

export default function GymNotificationsScreen() {
  return (
    <Screen scroll>
      <Header title="Notifications" showBack />
      <NotificationsSettings />
    </Screen>
  );
}
