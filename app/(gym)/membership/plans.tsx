import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import {
  MEMBERSHIP_LABELS,
  membershipBillingLabel,
  membershipPlanTypeLabel,
  formatMoney,
  PROFILE_MENU_LABELS,
} from '@/constants/labels';
import { createMembershipPlanApi, fetchMembershipPlans } from '@/services/api/institutions.api';
import type { MembershipBillingFrequency, MembershipPlan, MembershipPlanType } from '@/types/api';

const FREQUENCIES = [
  { value: 'monthly', label: MEMBERSHIP_LABELS.billingMonthly },
  { value: 'quarterly', label: MEMBERSHIP_LABELS.billingQuarterly },
  { value: 'annual', label: MEMBERSHIP_LABELS.billingAnnual },
] as const;

const PLAN_TYPES = [
  { value: 'individual', label: MEMBERSHIP_LABELS.planIndividual },
  { value: 'family', label: MEMBERSHIP_LABELS.planFamily },
] as const;

export default function GymMembershipPlansScreen() {
  const { colors } = useAppTheme();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<MembershipBillingFrequency>('monthly');
  const [planType, setPlanType] = useState<MembershipPlanType>('individual');
  const [maxMembers, setMaxMembers] = useState('');
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
    if (planType === 'family') {
      const max = parseInt(maxMembers, 10);
      if (!Number.isFinite(max) || max < 1) {
        Alert.alert('Datos incompletos', 'Ingresá la cantidad máxima de integrantes.');
        return;
      }
    }
    setSaving(true);
    try {
      await createMembershipPlanApi({
        name: name.trim(),
        description: description.trim() || undefined,
        priceCents,
        billingFrequency: frequency,
        planType,
        maxMembers: planType === 'family' ? parseInt(maxMembers, 10) : undefined,
      });
      setName('');
      setDescription('');
      setPrice('');
      setPlanType('individual');
      setMaxMembers('');
      await load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const openPlan = (plan: MembershipPlan) => {
    router.push(`/(gym)/membership/edit-plan/${plan.id}`);
  };

  const renderPlanCard = (plan: MembershipPlan, muted = false) => (
    <Pressable
      key={plan.id}
      onPress={() => openPlan(plan)}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, opacity: muted ? 0.85 : 1 }]}>
      <Text style={[styles.planName, { color: colors.text }]}>{plan.name}</Text>
      {plan.description ? (
        <Text style={{ color: colors.textMuted, marginBottom: 4 }} numberOfLines={2}>
          {plan.description}
        </Text>
      ) : null}
      <Text style={{ color: colors.textMuted }}>
        {formatMoney(plan.price)} · {membershipBillingLabel(plan.billingFrequency)} ·{' '}
        {membershipPlanTypeLabel(plan.planType)}
        {plan.planType === 'family' && plan.maxMembers ? ` (${plan.maxMembers})` : ''}
      </Text>
      <Text style={{ color: colors.primary, fontWeight: '600', marginTop: Spacing.sm }}>Editar</Text>
    </Pressable>
  );

  const activePlans = plans.filter((p) => p.active);
  const inactivePlans = plans.filter((p) => !p.active);

  return (
    <Screen scroll loading={loading} header={<Header title={PROFILE_MENU_LABELS.membershipPlans} showBack />}>

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
        placeholder={MEMBERSHIP_LABELS.description}
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Precio (ej. 2500)"
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        value={price}
        onChangeText={setPrice}
      />

      <Text style={[styles.label, { color: colors.textMuted }]}>Tipo de plan</Text>
      <View style={styles.chipRow}>
        {PLAN_TYPES.map((t) => (
          <Pressable
            key={t.value}
            onPress={() => setPlanType(t.value)}
            style={[
              styles.chip,
              {
                backgroundColor: planType === t.value ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={{ color: planType === t.value ? '#fff' : colors.text, fontWeight: '600' }}>
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {planType === 'family' ? (
        <TextInput
          style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
          placeholder={MEMBERSHIP_LABELS.maxMembers}
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={maxMembers}
          onChangeText={setMaxMembers}
        />
      ) : null}

      <Text style={[styles.label, { color: colors.textMuted }]}>Frecuencia</Text>
      <View style={styles.chipRow}>
        {FREQUENCIES.map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setFrequency(f.value)}
            style={[
              styles.chip,
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

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        {MEMBERSHIP_LABELS.activePlans}
      </Text>
      {activePlans.length === 0 ? (
        <Text style={{ color: colors.textMuted }}>{MEMBERSHIP_LABELS.noPlans}</Text>
      ) : (
        activePlans.map((plan) => renderPlanCard(plan))
      )}

      {inactivePlans.length > 0 ? (
        <>
          <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
            {MEMBERSHIP_LABELS.inactivePlans}
          </Text>
          {inactivePlans.map((plan) => renderPlanCard(plan, true))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: {
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
