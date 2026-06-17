import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { MEMBERSHIP_LABELS, membershipBillingLabel, formatMoney, PROFILE_MENU_LABELS } from '@/constants/labels';
import {
  createMembershipPlanApi,
  deleteMembershipPlanApi,
  fetchMembershipPlans,
} from '@/services/api/institutions.api';
import type { MembershipPlan } from '@/types/api';

const FREQUENCIES = [
  { value: 'monthly', label: MEMBERSHIP_LABELS.billingMonthly },
  { value: 'quarterly', label: MEMBERSHIP_LABELS.billingQuarterly },
  { value: 'annual', label: MEMBERSHIP_LABELS.billingAnnual },
] as const;

export default function GymMembershipPlansScreen() {
  const { colors } = useAppTheme();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<'monthly' | 'quarterly' | 'annual'>('monthly');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPlans(await fetchMembershipPlans());
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const createPlan = async () => {
    const priceCents = Math.round(parseFloat(price.replace(',', '.')) * 100);
    if (!name.trim() || !Number.isFinite(priceCents) || priceCents < 0) {
      Alert.alert('Datos incompletos', 'Ingresá nombre y precio válido.');
      return;
    }
    setSaving(true);
    try {
      await createMembershipPlanApi({
        name: name.trim(),
        priceCents,
        billingFrequency: frequency,
      });
      setName('');
      setPrice('');
      await load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deactivatePlan = (plan: MembershipPlan) => {
    Alert.alert('Desactivar plan', `¿Desactivar "${plan.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desactivar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteMembershipPlanApi(plan.id);
            await load();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll loading={loading}>
      <Header title={PROFILE_MENU_LABELS.membershipPlans} showBack />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Nuevo plan</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Nombre del plan"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Precio (ej. 2500)"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />
      <View style={styles.freqRow}>
        {FREQUENCIES.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFrequency(f.value)}
            style={[
              styles.freqChip,
              {
                backgroundColor: frequency === f.value ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={{ color: frequency === f.value ? '#fff' : colors.text, fontWeight: '600' }}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>
      <Button title="Crear plan" onPress={createPlan} disabled={saving} />

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>Planes activos</Text>
      {plans.filter((p) => p.active).length === 0 ? (
        <Text style={{ color: colors.textMuted }}>{MEMBERSHIP_LABELS.noPlans}</Text>
      ) : (
        plans
          .filter((p) => p.active)
          .map((plan) => (
            <View
              key={plan.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
              <Text style={{ color: colors.textMuted }}>
                {formatMoney(plan.price)} · {membershipBillingLabel(plan.billingFrequency)}
              </Text>
              <Pressable onPress={() => deactivatePlan(plan)} style={{ marginTop: Spacing.sm }}>
                <Text style={{ color: colors.warning, fontWeight: '600' }}>Desactivar</Text>
              </Pressable>
            </View>
          ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
  freqRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  freqChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  planName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
});
