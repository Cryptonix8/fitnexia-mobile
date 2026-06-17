import type {
  ClubMember,
  MembershipInvite,
  MembershipInvitePreview,
  MembershipPlan,
  MembershipStatement,
} from '@/types/api';

import { apiRequest } from './client';

export async function fetchMyMemberships() {
  const result = await apiRequest<{ data: ClubMember[] }>('/memberships/me');
  return result.data;
}

export async function fetchMembershipStatement(memberId: string) {
  return apiRequest<MembershipStatement>(`/memberships/me/${memberId}/statement`);
}

export async function fetchInvitePreview(code: string) {
  return apiRequest<MembershipInvitePreview>(`/memberships/invites/${encodeURIComponent(code)}`, {
    auth: false,
  });
}

export async function acceptMembershipInvite(code: string) {
  return apiRequest<{
    member: ClubMember;
    authorizationUrl?: string;
    subscriptionId: string;
  }>(`/memberships/invites/${encodeURIComponent(code)}/accept`, {
    method: 'POST',
  });
}

export async function authorizeMembership(memberId: string) {
  return apiRequest<{ authorizationUrl?: string; preapprovalId?: string }>(
    `/memberships/me/${memberId}/authorize`,
    { method: 'POST' },
  );
}

export async function payMembershipDebt(memberId: string) {
  return apiRequest<{ paymentId: string; checkoutUrl?: string; amount: { amount: number; currency: string } }>(
    `/memberships/me/${memberId}/pay-debt`,
    { method: 'POST' },
  );
}

export type { MembershipPlan, MembershipInvite, ClubMember, MembershipStatement };
