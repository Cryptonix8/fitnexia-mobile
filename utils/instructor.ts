import type { AuthUser } from '@/contexts/auth-context';

/** Mock instructor id linked to the logged-in instructor account */
export function getLinkedInstructorId(user: AuthUser | null | undefined): string {
  return user?.instructorId ?? 'inst-1';
}
