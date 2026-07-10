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
  appleSignIn: true,
  advancedSearch: true,
  recurringClasses: true,
  liveStreaming: true,
  recordedClasses: false,
  waitlist: true,
  multipleCurrencies: false,
  digitalWallets: false,
  subscriptionPaymentModels: true,
  integratedPayments: true,
  marketplacePayouts: true,
  loyaltyCredits: true,
  fixedCourtShifts: true,
  openGames: true,
  reviewResponses: true,
  inAppNotificationCenter: true,
  analyticsMetrics: true,
  platformSupport: false,
  savedPaymentMethods: false,
  geolocationMap: true,
  courts: true,
  clubCollections: true,
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
