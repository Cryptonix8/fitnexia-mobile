import { Redirect, useRootNavigationState, useSegments } from 'expo-router';

import { useAuth } from '@/contexts/auth-context';

const PUBLIC_ROOTS = new Set(['(auth)', 'class', 'instructor', 'institution']);

function isProtectedRoute(segments: string[]): boolean {
  const root = segments[0];
  if (!root) return false;
  if (PUBLIC_ROOTS.has(root)) return false;
  return true;
}

/**
 * Root-level auth redirects using <Redirect /> (safe from nested tab stacks).
 * Must render as a sibling of the root <Stack>, not inside profile tabs.
 */
export function AuthRootGate() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  if (isLoading || !navigationState?.key) {
    return null;
  }

  const inAuthGroup = segments[0] === '(auth)';

  if (user && inAuthGroup) {
    return <Redirect href="/" />;
  }

  if (!user && isProtectedRoute(segments)) {
    return <Redirect href="/login" />;
  }

  return null;
}
