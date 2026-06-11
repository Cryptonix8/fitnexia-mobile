import { PlanCommissionScreen } from '@/components/profile/plan-commission-screen';
import { useAuth } from '@/contexts/auth-context';

export default function InstructorPlanScreen() {
  const { user } = useAuth();
  const currentPlan = user?.instructorProfile?.plan ?? 'basic';

  return (
    <PlanCommissionScreen
      currentPlan={currentPlan}
      planIds={['basic', 'pro']}
      hint="La comisión de plataforma se descuenta automáticamente de cada cobro según tu plan."
    />
  );
}
