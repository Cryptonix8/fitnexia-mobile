import { Header } from '@/components/ui/header';
import { PaymentMethodsSettings } from '@/components/profile/payment-methods-settings';
import { SCREEN_TITLES } from '@/constants/labels';
import { Screen } from '@/components/ui/screen';

export default function InstructorPaymentMethodsScreen() {
  return (
    <Screen scroll>
      <Header title={SCREEN_TITLES.payoutAccount} showBack />
      <PaymentMethodsSettings />
    </Screen>
  );
}
