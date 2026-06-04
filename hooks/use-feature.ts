import { FEATURES, isFeatureEnabled, type FeatureKey } from '@/constants/features';

/** Read a product feature flag (static for MVP; replace with API config later). */
export function useFeature(key: FeatureKey): boolean {
  return isFeatureEnabled(key);
}

export function useFeatures(): typeof FEATURES {
  return FEATURES;
}
