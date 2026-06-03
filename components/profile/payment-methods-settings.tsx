import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useAuth, type PaymentMethod } from '@/contexts/auth-context';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

export function PaymentMethodsSettings() {
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
    Alert.alert('Card added', 'Mercado Pago integration will replace this mock flow.');
  };

  const setDefault = (id: string) => {
    updateProfile({
      paymentMethods: methods.map((m) => ({ ...m, isDefault: m.id === id })),
    });
  };

  const remove = (id: string) => {
    Alert.alert('Remove card', 'Remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
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
      <Text style={styles.hint}>
        Cards are stored securely by Mercado Pago. This is a mock UI until the API is connected.
      </Text>
      {methods.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="card-outline" size={48} color={FitnexiaColors.gray400} />
          <Text style={styles.emptyText}>No payment methods yet</Text>
        </View>
      ) : (
        methods.map((m) => (
          <View key={m.id} style={styles.card}>
            <Ionicons name="card" size={28} color={FitnexiaColors.primary} />
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>
                {m.brand} ·••• {m.last4}
              </Text>
              <Text style={styles.cardMeta}>Expires {m.expiry}</Text>
              {m.isDefault ? <Text style={styles.defaultBadge}>Default</Text> : null}
            </View>
            <View style={styles.cardActions}>
              {!m.isDefault ? (
                <Pressable onPress={() => setDefault(m.id)}>
                  <Text style={styles.link}>Set default</Text>
                </Pressable>
              ) : null}
              <Pressable onPress={() => remove(m.id)}>
                <Text style={styles.remove}>Remove</Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
      <Button title="Add card" onPress={addMockCard} style={{ marginTop: Spacing.md }} />
      <Button title="Done" variant="ghost" onPress={() => router.back()} />
    </>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl },
  emptyText: { marginTop: Spacing.md, color: FitnexiaColors.gray500 },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: FitnexiaColors.gray900 },
  cardMeta: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 2 },
  defaultBadge: { fontSize: 12, fontWeight: '600', color: FitnexiaColors.primary, marginTop: 4 },
  cardActions: { alignItems: 'flex-end', gap: 4 },
  link: { color: FitnexiaColors.primary, fontWeight: '600', fontSize: 13 },
  remove: { color: FitnexiaColors.error, fontWeight: '600', fontSize: 13 },
});
