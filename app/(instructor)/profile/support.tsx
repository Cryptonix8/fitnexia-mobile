import { Header } from '@/components/ui/header';
import { SupportSettings } from '@/components/profile/support-settings';
import { SCREEN_TITLES } from '@/constants/labels';
import { Screen } from '@/components/ui/screen';

export default function InstructorSupportScreen() {
  return (
    <Screen scroll>
      <Header title={SCREEN_TITLES.helpSupport} showBack />
      <SupportSettings />
    </Screen>
  );
}
