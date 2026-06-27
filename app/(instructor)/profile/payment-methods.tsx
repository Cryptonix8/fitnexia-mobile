import { Header } from '@/components/ui/header';
import { MpPayoutConnect } from '@/components/profile/mp-payout-connect';
import { SCREEN_TITLES } from '@/constants/labels';
import { Screen } from '@/components/ui/screen';

export default function InstructorPaymentMethodsScreen() {
  return (
    <Screen scroll header={<Header title={SCREEN_TITLES.payoutAccount} showBack />}>
      <MpPayoutConnect />
    </Screen>
  );
}
