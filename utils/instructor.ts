import type { AuthUser } from '@/contexts/auth-context';

export function getLinkedInstructorId(user: AuthUser | null | undefined): string | undefined {
  return user?.instructorId;
}
