/**
 * App Store product IDs for Fitnexia SaaS (must match backend src/config/apple-iap.js
 * and Auto-Renewable Subscriptions in App Store Connect).
 */
export const APPLE_IAP_PRODUCTS = {
  instructorPro: 'fitnexia.instructor.pro.monthly',
  gymProfessional: 'fitnexia.gym.professional.monthly',
  gymPremium: 'fitnexia.gym.premium.monthly',
  gymEnterprise: 'fitnexia.gym.enterprise.monthly',
} as const;

export const INSTRUCTOR_PLAN_TO_SKU: Record<string, string> = {
  pro: APPLE_IAP_PRODUCTS.instructorPro,
};

export const GYM_TIER_TO_SKU: Record<string, string> = {
  professional: APPLE_IAP_PRODUCTS.gymProfessional,
  premium: APPLE_IAP_PRODUCTS.gymPremium,
  enterprise: APPLE_IAP_PRODUCTS.gymEnterprise,
};

export const ALL_SAAS_SKUS = Object.values(APPLE_IAP_PRODUCTS);
