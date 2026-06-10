import type { InstructorInvite } from '@/types/auth-user';
import type { Instructor } from '@/types/api';

import { apiRequest } from './client';

type LinkedInstructorsResponse = {
  data: Pick<Instructor, 'id' | 'displayName' | 'disciplines' | 'verified' | 'averageRating' | 'reviewCount'>[];
};

type InvitesResponse = { data: InstructorInvite[] };

export type StaffRosterEntry = Pick<
  Instructor,
  'id' | 'displayName' | 'photoUrl' | 'disciplines' | 'verified' | 'averageRating' | 'reviewCount'
> & {
  staffStatus: 'none' | 'pending' | 'linked';
  inviteId?: string;
  hasCompletedClass?: boolean;
  staffReview?: { id: string; rating: number } | null;
  canLeaveStaffReview?: boolean;
};

export type StaffReviewEligibility = {
  linked: boolean;
  hasCompletedClass: boolean;
  canLeaveReview: boolean;
  existingReview?: {
    id: string;
    rating: number;
    comment?: string;
    createdAt: string;
  } | null;
};

export async function fetchStaffReviewEligibility(instructorId: string) {
  return apiRequest<StaffReviewEligibility>(
    `/institutions/me/instructors/${instructorId}/review-eligibility`,
  );
}

export async function fetchStaffRoster() {
  const result = await apiRequest<{ data: StaffRosterEntry[] }>('/institutions/me/instructors/roster');
  return result.data;
}

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

export type InviteInstructorResult = InstructorInvite & {
  emailSent?: boolean;
  emailError?: string;
};

export async function inviteInstructorApi(params: { instructorId: string }) {
  return apiRequest<InviteInstructorResult>('/institutions/me/instructors/invite', {
    method: 'POST',
    body: params,
  });
}

export async function fetchPendingInvites() {
  const result = await apiRequest<InvitesResponse>('/institutions/me/instructors/invites');
  return result.data;
}

export async function cancelInviteApi(inviteId: string) {
  return apiRequest(`/institutions/me/instructors/invites/${inviteId}`, { method: 'DELETE' });
}
