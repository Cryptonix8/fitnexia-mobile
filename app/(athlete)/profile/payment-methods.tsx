import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { PaymentMethodsSettings } from '@/components/profile/payment-methods-settings';
import { SCREEN_TITLES } from '@/constants/labels';

export default function PaymentMethodsScreen() {
  return (
    <Screen scroll header={<Header title={SCREEN_TITLES.paymentMethods} showBack />}>
      <PaymentMethodsSettings />
    </Screen>
  );
}
