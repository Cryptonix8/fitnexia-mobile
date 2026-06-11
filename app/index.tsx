import { Redirect } from 'expo-router';

import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { LOADING_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';

export default function Index() {
  const { user, hasSeenOnboarding, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay visible message={LOADING_LABELS.session} />;
  }

  if (!hasSeenOnboarding) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (user.role === 'instructor') {
    return <Redirect href="/(instructor)/(tabs)/dashboard" />;
  }
  if (user.role === 'institution') {
    return <Redirect href="/(gym)/(tabs)/dashboard" />;
  }

  return <Redirect href="/(athlete)/(tabs)/home" />;
}
