import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
  PROFILE_MENU_LABELS,
} from '@/constants/labels';
import {
  deleteMembershipPlanApi,
  fetchMembershipPlanById,
  updateMembershipPlanApi,
} from '@/services/api/institutions.api';
import type { MembershipBillingFrequency, MembershipPlanType } from '@/types/api';

const FREQUENCIES = [
  { value: 'monthly', label: MEMBERSHIP_LABELS.billingMonthly },
  { value: 'quarterly', label: MEMBERSHIP_LABELS.billingQuarterly },
  { value: 'annual', label: MEMBERSHIP_LABELS.billingAnnual },
] as const;

const PLAN_TYPES = [
  { value: 'individual', label: MEMBERSHIP_LABELS.planIndividual },
  { value: 'family', label: MEMBERSHIP_LABELS.planFamily },
] as const;

export default function EditMembershipPlanScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [active, setActive] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [frequency, setFrequency] = useState<MembershipBillingFrequency>('monthly');
  const [planType, setPlanType] = useState<MembershipPlanType>('individual');
  const [maxMembers, setMaxMembers] = useState('');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const plan = await fetchMembershipPlanById(id);
      setActive(plan.active);
      setName(plan.name);
      setDescription(plan.description ?? '');
      setPrice(String(plan.price.amount / 100));
      setFrequency(plan.billingFrequency);
      setPlanType(plan.planType);
      setMaxMembers(plan.maxMembers ? String(plan.maxMembers) : '');
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
      router.back();
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!id) return;
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
      await updateMembershipPlanApi(id, {
        name: name.trim(),
        description: description.trim(),
        priceCents,
        billingFrequency: frequency,
        planType,
        maxMembers: planType === 'family' ? parseInt(maxMembers, 10) : undefined,
      });
      Alert.alert('Guardado', 'El plan fue actualizado.');
      router.back();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = () => {
    if (!id) return;
    if (active) {
      Alert.alert('Desactivar plan', `¿Desactivar "${name}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: MEMBERSHIP_LABELS.deactivate,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMembershipPlanApi(id);
              router.back();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            }
          },
        },
      ]);
    } else {
      Alert.alert('Reactivar plan', `¿Reactivar "${name}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: MEMBERSHIP_LABELS.reactivate,
          onPress: async () => {
            try {
              await updateMembershipPlanApi(id, { active: true });
              router.back();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            }
          },
        },
      ]);
    }
  };

  return (
    <Screen scroll loading={loading}>
      <Header title={MEMBERSHIP_LABELS.editPlan} showBack />

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

      <Text style={{ color: colors.textMuted, marginBottom: Spacing.md }}>
        {membershipPlanTypeLabel(planType)} · {membershipBillingLabel(frequency)}
      </Text>

      <Button title="Guardar cambios" onPress={save} disabled={saving} />

      <Pressable onPress={toggleActive} style={{ marginTop: Spacing.lg }}>
        <Text style={{ color: active ? colors.warning : colors.primary, fontWeight: '600', textAlign: 'center' }}>
          {active ? MEMBERSHIP_LABELS.deactivate : MEMBERSHIP_LABELS.reactivate}
        </Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.xs },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
});
