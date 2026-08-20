import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SurfaceCard } from '@/components/ui/surface-card';
import { useAuth, type PaymentMethod } from '@/contexts/auth-context';
import { Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

export function PaymentMethodsSettings() {
  const { colors } = useAppTheme();
  const { user, updateProfile } = useAuth();
  const methods = user?.paymentMethods ?? [];

  const addMockCard = () => {
    const newCard: PaymentMethod = {
      id: `pm-${Date.now()}`,
      brand: 'Visa',
      last4: String(Math.floor(1000 + Math.random() * 9000)),
      expiry: '12/28',
      isDefault: methods.length === 0,
    };
    updateProfile({ paymentMethods: [...methods, newCard] });
    Alert.alert('Tarjeta agregada', 'La integración con Mercado Pago reemplazará este flujo simulado.');
  };

  const setDefault = (id: string) => {
    updateProfile({
      paymentMethods: methods.map((m) => ({ ...m, isDefault: m.id === id })),
    });
  };

  const remove = (id: string) => {
    Alert.alert('Eliminar tarjeta', '¿Eliminar este método de pago?', [
      { text: ALERT_LABELS.cancel, style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          const next = methods.filter((m) => m.id !== id);
          if (next.length && !next.some((m) => m.isDefault)) {
            next[0].isDefault = true;
          }
          updateProfile({ paymentMethods: next });
        },
      },
    ]);
  };

  return (
    <>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Las tarjetas se almacenan de forma segura en Mercado Pago. Esta es una interfaz simulada hasta conectar la API.
      </Text>
      {methods.length === 0 ? (
        <EmptyState
          icon="card-outline"
          title="Sin métodos de pago"
          description="Agregá una tarjeta para reservar clases más rápido."
          actionLabel="Agregar tarjeta"
          onAction={addMockCard}
        />
      ) : (
        methods.map((m) => (
          <SurfaceCard key={m.id} style={styles.card}>
            <Ionicons name="card" size={28} color={colors.primary} />
            <View style={styles.cardBody}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {m.brand} ·••• {m.last4}
              </Text>
              <Text style={[styles.cardMeta, { color: colors.textMuted }]}>Vence {m.expiry}</Text>
              {m.isDefault ? (
                <Text style={[styles.defaultBadge, { color: colors.primary }]}>Predeterminada</Text>
              ) : null}
            </View>
            <View style={styles.cardActions}>
              {!m.isDefault ? (
                <Pressable onPress={() => setDefault(m.id)}>
                  <Text style={[styles.link, { color: colors.primary }]}>Usar por defecto</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => remove(m.id)}>
                <Text style={[styles.remove, { color: colors.error }]}>Eliminar</Text>
              </Pressable>
            </View>
          </SurfaceCard>
        ))
      )}
      <Button title="Agregar tarjeta" onPress={addMockCard} style={{ marginTop: Spacing.md }} />
      <Button title="Listo" variant="ghost" onPress={() => router.back()} />
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, marginBottom: Spacing.lg },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { fontSize: 13, marginTop: 2 },
  defaultBadge: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  cardActions: { alignItems: 'flex-end', gap: 4 },
  link: { fontWeight: '600', fontSize: 13 },
  remove: { fontWeight: '600', fontSize: 13 },
});
