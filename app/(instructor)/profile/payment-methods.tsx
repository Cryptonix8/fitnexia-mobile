import { Header } from '@/components/ui/header';
import { PaymentMethodsSettings } from '@/components/profile/payment-methods-settings';
import { Screen } from '@/components/ui/screen';

export default function InstructorPaymentMethodsScreen() {
  return (
    <Screen scroll>
      <Header title="Payout account" showBack />
      <PaymentMethodsSettings />
    </Screen>
  );
}
