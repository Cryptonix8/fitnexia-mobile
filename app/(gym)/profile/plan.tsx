import { PlanCommissionScreen } from '@/components/profile/plan-commission-screen';
import { useAuth } from '@/contexts/auth-context';

export default function GymPlanScreen() {
  const { user } = useAuth();
  const currentPlan = user?.institutionProfile?.plan ?? 'institutional';

  return (
    <PlanCommissionScreen
      currentPlan={currentPlan}
      planIds={['basic', 'institutional']}
      hint="Los planes institucionales incluyen gestión de instructores y una comisión reducida por transacción."
    />
  );
}
