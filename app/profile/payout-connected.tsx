import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';

import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';

export default function PayoutConnectedScreen() {
  const { status } = useLocalSearchParams<{ status?: string }>();
  const { colors } = useAppTheme();
  const { user } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (user?.role === 'institution') {
        router.replace('/(gym)/profile/payment-methods');
      } else {
        router.replace('/(instructor)/profile/payment-methods');
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [status, user?.role]);

  return (
    <Screen>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', textAlign: 'center' }}>
          {status === 'error'
            ? 'No se pudo conectar Mercado Pago'
            : 'Mercado Pago conectado'}
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 8, textAlign: 'center' }}>
          Volviendo a métodos de cobro…
        </Text>
      </View>
      <LoadingOverlay visible message="Actualizando…" />
    </Screen>
  );
}
