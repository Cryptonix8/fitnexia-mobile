import type { InstructorInvite } from '@/contexts/auth-context';
import type { Instructor } from '@/types/api';

import { apiRequest } from './client';

type LinkedInstructorsResponse = {
  data: Pick<Instructor, 'id' | 'displayName' | 'disciplines' | 'verified' | 'averageRating' | 'reviewCount'>[];
};

type InvitesResponse = { data: InstructorInvite[] };

export async function fetchLinkedInstructors() {
  const result = await apiRequest<LinkedInstructorsResponse>('/institutions/me/instructors');
  return result.data;
}

export async function linkInstructorApi(instructorId: string) {
  return apiRequest('/institutions/me/instructors', {
    method: 'POST',
    body: { instructorId },
  });
}

export async function unlinkInstructorApi(instructorId: string) {
  return apiRequest(`/institutions/me/instructors/${instructorId}`, { method: 'DELETE' });
}

export async function inviteInstructorApi(email: string, message?: string) {
  return apiRequest<InstructorInvite>('/institutions/me/instructors/invite', {
    method: 'POST',
    body: { email, message },
  });
}

export async function fetchPendingInvites() {
  const result = await apiRequest<InvitesResponse>('/institutions/me/instructors/invites');
  return result.data;
}
