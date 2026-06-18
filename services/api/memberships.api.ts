import type {
  ClubMember,
  MembershipInvite,
  MembershipInvitePreview,
  MembershipPayment,
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

export async function fetchMembershipPayment(memberId: string, paymentId: string) {
  return apiRequest<MembershipPayment>(`/memberships/me/${memberId}/payments/${paymentId}`);
}

export async function syncMembershipPaymentApi(memberId: string, paymentId: string) {
  return apiRequest<{
    synced: boolean;
    payment: MembershipPayment;
    memberFeeStatus?: string;
    reason?: string;
  }>(`/memberships/me/${memberId}/payments/${paymentId}/sync`, { method: 'POST' });
}

export async function waitForMembershipPayment(
  memberId: string,
  paymentId: string,
  options?: { attempts?: number; delayMs?: number },
) {
  const attempts = options?.attempts ?? 12;
  const delayMs = options?.delayMs ?? 1500;

  for (let i = 0; i < attempts; i += 1) {
    if (i === 0 || i % 3 === 0) {
      try {
        await syncMembershipPaymentApi(memberId, paymentId);
      } catch {
        // Webhook may have already confirmed; sync is best-effort.
      }
    }

    const statement = await fetchMembershipStatement(memberId);
    const payment = statement.payments.find((p) => p.id === paymentId);
    if (payment?.status === 'approved') return statement;
    if (payment?.status === 'rejected') {
      throw new Error('El pago no se completó.');
    }
    if (!statement.amountDue && statement.member.feeStatus === 'up_to_date') {
      return statement;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error('El pago sigue procesándose. Revisá el estado de cuenta en un momento.');
}

export type { MembershipPlan, MembershipInvite, ClubMember, MembershipStatement };
