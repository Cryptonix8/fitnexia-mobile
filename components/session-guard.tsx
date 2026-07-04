import { Redirect, useSegments } from 'expo-router';

import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { LOADING_LABELS } from '@/constants/labels';
import { useAuth } from '@/contexts/auth-context';

const PUBLIC_ROOTS = new Set(['(auth)', 'class', 'instructor', 'institution']);

function isProtectedRoute(segments: string[]): boolean {
  const root = segments[0];
  if (!root) return false;
  if (PUBLIC_ROOTS.has(root)) return false;
  return true;
}

export function SessionGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const segments = useSegments();

  if (isLoading) {
    return <LoadingOverlay visible message={LOADING_LABELS.session} />;
  }

  if (!user && isProtectedRoute(segments)) {
    return <Redirect href="/(auth)/login" />;
  }

  return <>{children}</>;
}
