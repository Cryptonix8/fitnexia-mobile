import { Header } from '@/components/ui/header';
import { NotificationsSettings } from '@/components/profile/notifications-settings';
import { SCREEN_TITLES } from '@/constants/labels';
import { Screen } from '@/components/ui/screen';

export default function InstructorNotificationsScreen() {
  return (
    <Screen scroll header={<Header title={SCREEN_TITLES.notifications} showBack />}>
      <NotificationsSettings />
    </Screen>
  );
}
