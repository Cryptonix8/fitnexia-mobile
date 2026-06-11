import { apiRequest } from './client';

export type MarketplaceConfig = {
  enabled: boolean;
  configured: boolean;
  requireSellerConnect: boolean;
  gymPayeePolicy: 'institution' | 'instructor' | 'split';
  passRevenuePolicy: 'platform_ledger' | 'split_at_purchase';
};

export type MpSellerConnection = {
  sellerType: 'instructor' | 'institution';
  status: 'disconnected' | 'pending' | 'connected' | 'revoked';
  connected: boolean;
  collectorId?: string;
  connectedAt?: string;
};

export type MpConnectStatusResponse = {
  marketplace: MarketplaceConfig;
  connection: MpSellerConnection;
  oauth: {
    enabled: boolean;
    configured: boolean;
    redirectUri: string;
    platformTokenConfigured: boolean;
  };
};

export async function fetchMpConnectStatus() {
  return apiRequest<MpConnectStatusResponse>('/payouts/mp/status');
}

export async function fetchMpConnectUrl() {
  return apiRequest<{ url: string; state: string }>('/payouts/mp/connect');
}

export async function disconnectMpAccount() {
  return apiRequest<{ connection: MpSellerConnection }>('/payouts/mp/disconnect', {
    method: 'DELETE',
  });
}
