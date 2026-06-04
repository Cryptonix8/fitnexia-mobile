import { FEATURES, isFeatureEnabled, type FeatureKey } from '@/constants/features';

export function useFeature(key: FeatureKey): boolean {
  return isFeatureEnabled(key);
}

export function useFeatures(): typeof FEATURES {
  return FEATURES;
}
