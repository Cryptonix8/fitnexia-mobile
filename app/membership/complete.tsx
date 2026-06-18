import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { Text, View } from 'react-native';

import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { LOADING_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';

export default function MembershipCompleteScreen() {
  const params = useLocalSearchParams<{ memberId?: string | string[]; status?: string | string[] }>();
  const memberId = useMemo(
    () => (Array.isArray(params.memberId) ? params.memberId[0] : params.memberId),
    [params.memberId],
  );
  const status = useMemo(
    () => (Array.isArray(params.status) ? params.status[0] : params.status),
    [params.status],
  );
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
