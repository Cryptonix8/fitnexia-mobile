import { Platform } from 'react-native';

import { useFeature } from '@/hooks/use-feature';

/** Apple Sign-In is enabled only on iOS builds (never on Android). */
export function useAppleSignInFeature(): boolean {
  return Platform.OS === 'ios' && useFeature('appleSignIn');
}
