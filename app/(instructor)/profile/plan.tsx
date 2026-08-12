import { PlanCommissionScreen } from '@/components/profile/plan-commission-screen';
import { useAuth } from '@/contexts/auth-context';

export default function InstructorPlanScreen() {
  const { user } = useAuth();
  const currentPlan = user?.instructorProfile?.plan ?? 'basic';

  return (
    <PlanCommissionScreen
      currentPlan={currentPlan}
      planIds={['basic', 'pro']}
      hint="Freemium es gratis con 8% de comisión por clase. Pro cuesta $29/mes y no tiene comisión en tus cobros."
    />
  );
}
