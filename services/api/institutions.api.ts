import type { InstructorInvite } from '@/types/auth-user';
import type {
  ClubMember,
  Instructor,
  MembersSummary,
  MembershipInvite,
  MembershipPlan,
  MembershipSettings,
} from '@/types/api';

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

export async function fetchMembershipPlans() {
  const result = await apiRequest<{ data: MembershipPlan[] }>('/institutions/me/membership-plans');
  return result.data;
}

export async function fetchMembershipPlanById(planId: string) {
  return apiRequest<MembershipPlan>(`/institutions/me/membership-plans/${planId}`);
}

export async function createMembershipPlanApi(body: {
  name: string;
  description?: string;
  priceCents: number;
  priceCurrency?: string;
  billingFrequency: string;
  planType?: string;
  maxMembers?: number;
}) {
  return apiRequest<MembershipPlan>('/institutions/me/membership-plans', {
    method: 'POST',
    body,
  });
}

export async function updateMembershipPlanApi(
  planId: string,
  body: Partial<{
    name: string;
    description: string;
    priceCents: number;
    priceCurrency: string;
    billingFrequency: string;
    planType: string;
    maxMembers: number;
    active: boolean;
  }>,
) {
  return apiRequest<MembershipPlan>(`/institutions/me/membership-plans/${planId}`, {
    method: 'PATCH',
    body,
  });
}

export async function deleteMembershipPlanApi(planId: string) {
  return apiRequest(`/institutions/me/membership-plans/${planId}`, { method: 'DELETE' });
}

export async function fetchMembershipSettings() {
  return apiRequest<MembershipSettings>('/institutions/me/membership-settings');
}

export async function updateMembershipSettingsApi(body: Partial<MembershipSettings>) {
  return apiRequest<MembershipSettings>('/institutions/me/membership-settings', {
    method: 'PATCH',
    body,
  });
}

export async function fetchClubMembers(status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const result = await apiRequest<{ data: ClubMember[] }>(`/institutions/me/members${query}`);
  return result.data;
}

export async function fetchMembersSummary() {
  return apiRequest<MembersSummary>('/institutions/me/members/summary');
}

export async function addClubMemberApi(body: {
  planId: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  userId?: string;
}) {
  return apiRequest<ClubMember>('/institutions/me/members', { method: 'POST', body });
}

export async function fetchClubMemberById(memberId: string) {
  return apiRequest<ClubMember>(`/institutions/me/members/${memberId}`);
}

export async function updateClubMemberApi(
  memberId: string,
  body: Partial<{
    planId: string;
    contactName: string;
    contactEmail: string;
    contactPhone: string;
  }>,
) {
  return apiRequest<ClubMember>(`/institutions/me/members/${memberId}`, {
    method: 'PATCH',
    body,
  });
}

export async function removeClubMemberApi(memberId: string) {
  return apiRequest(`/institutions/me/members/${memberId}`, { method: 'DELETE' });
}

export async function fetchMembershipInvites() {
  const result = await apiRequest<{ data: MembershipInvite[] }>('/institutions/me/membership-invites');
  return result.data;
}

export async function createMembershipInviteApi(body: {
  planId: string;
  email?: string;
  invitedName?: string;
  invitedPhone?: string;
  expiresInDays?: number;
}) {
  return apiRequest<MembershipInvite>('/institutions/me/membership-invites', {
    method: 'POST',
    body,
  });
}

export async function bulkCreateMembershipInvitesApi(members: {
  planId: string;
  email?: string;
  invitedName?: string;
  invitedPhone?: string;
}[]) {
  return apiRequest<{ batchId: string; results: unknown[] }>(
    '/institutions/me/membership-invites/bulk',
    { method: 'POST', body: { members } },
  );
}

export async function cancelMembershipInviteApi(inviteId: string) {
  return apiRequest(`/institutions/me/membership-invites/${inviteId}`, { method: 'DELETE' });
}
