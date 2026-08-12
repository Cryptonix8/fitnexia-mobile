import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';

export default function BillingCompleteScreen() {
  const { kind, status } = useLocalSearchParams<{
    kind?: string;
    ownerId?: string;
    status?: string;
  }>();
  const { colors } = useAppTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (kind === 'instructor') {
        router.replace('/(instructor)/profile/plan');
      } else {
        router.replace('/(gym)/profile/subscription');
      }
    }, 900);
    return () => clearTimeout(timer);
  }, [kind, status]);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
          {status === 'failure' || status === 'error'
            ? 'Pago del plan no completado'
            : 'Plan actualizado'}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
          Volviendo a la pantalla del plan…
        </Text>
      </View>
      <LoadingOverlay visible message="Confirmando…" />
    </Screen>
  );
}
