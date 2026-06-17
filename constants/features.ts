/**
 * Product feature flags for Fitnexia mobile.
 * MVP ships with post-MVP flags disabled; flip individually when backend is ready.
 * Prefer server-driven flags via GET /config/features in production.
 */
export const FEATURES = {
  // --- MVP (enabled) ---
  emailAuth: true,
  roleOnboarding: true,
  basicSearch: true,
  classBooking: true,
  bookingHistory: true,
  verifiedReviews: true,
  instructorClassPublish: true,
  instructorAvailability: true,
  instructorAvailableNow: true,
  gymStaffManagement: true,
  gymStaffReviews: true,
  gymBasicDashboard: true,
  clubMemberships: true,
  profileEditing: true,
  passwordRecovery: true,
  notificationPreferences: true,

  // --- Post-MVP (disabled for v1) ---
  googleSignIn: true,
  advancedSearch: false,
  recurringClasses: false,
  liveStreaming: false,
  recordedClasses: false,
  waitlist: false,
  multipleCurrencies: false,
  digitalWallets: false,
  subscriptionPaymentModels: true,
  integratedPayments: true,
  marketplacePayouts: true,
  loyaltyCredits: false,
  reviewResponses: false,
  inAppNotificationCenter: false,
  analyticsMetrics: false,
  platformSupport: false,
  savedPaymentMethods: false,
  geolocationMap: true,
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
