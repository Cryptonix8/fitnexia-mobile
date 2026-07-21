import { Platform } from 'react-native';

import { useFeature } from '@/hooks/use-feature';

/** Apple Sign-In is enabled on iOS builds, including simulator builds for local testing. */
export function useAppleSignInFeature(): boolean {
  return Platform.OS === 'ios' && useFeature('appleSignIn');
}
