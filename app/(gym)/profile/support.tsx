import { Header } from '@/components/ui/header';
import { SupportSettings } from '@/components/profile/support-settings';
import { Screen } from '@/components/ui/screen';

export default function GymSupportScreen() {
  return (
    <Screen scroll>
      <Header title="Help & support" showBack />
      <SupportSettings />
    </Screen>
  );
}
