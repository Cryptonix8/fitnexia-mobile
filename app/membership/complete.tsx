import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { LOADING_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';

export default function MembershipCompleteScreen() {
  const { memberId, status } = useLocalSearchParams<{ memberId?: string; status?: string }>();
  const { colors } = useAppTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (memberId && status !== 'failure') {
        router.replace({ pathname: '/membership/[memberId]', params: { memberId } });
      } else {
        router.replace('/membership');
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [memberId, status]);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: colors.textMuted }}>{LOADING_LABELS.payment}</Text>
      </View>
      <LoadingOverlay visible message={LOADING_LABELS.payment} />
    </Screen>
  );
}
