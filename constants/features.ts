/**
 * Product feature flags — single source of truth for MVP vs post-MVP UI.
 * Keep API types in types/api.ts; toggle behavior here only.
 * Later: merge with GET /config/features from the backend.
 */
export const FEATURES = {
  // —— MVP (enabled) ——
  emailAuth: true,
  basicSearch: true,
  classBooking: true,
  bookingHistory: true,
  verifiedReviews: true,
  instructorClassPublishing: true,
  instructorAvailability: true,
  instructorAvailableNow: true,
  gymStaffManagement: true,
  gymStaffReviews: true,
  gymDashboard: true,
  profileEditing: true,
  notificationPreferences: true,

  // —— Post-MVP (disabled until v2/v3) ——
  googleSignIn: false,
  integratedPayments: false,
  paymentModels: false,
  digitalWallets: false,
  multiCurrency: false,
  waitlist: false,
  recurringClasses: false,
  liveStreaming: false,
  recordedClasses: false,
  loyaltyCredits: false,
  advancedSearch: false,
  geolocationMap: false,
  reviewResponses: false,
  inAppNotificationCenter: false,
  gymMetrics: false,
  platformSupport: false,
} as const;

export type FeatureKey = keyof typeof FEATURES;

export function isFeatureEnabled(key: FeatureKey): boolean {
  return FEATURES[key];
}

/** Notification preference keys hidden when related features are off. */
export function isNotificationPrefVisible(key: string): boolean {
  if (key === 'creditsExpiring' && !FEATURES.loyaltyCredits) return false;
  if (key === 'paymentUpdates' && !FEATURES.integratedPayments) return false;
  return true;
}
