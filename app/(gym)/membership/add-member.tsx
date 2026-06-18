import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { MEMBERSHIP_LABELS } from '@/constants/labels';
import { addClubMemberApi, fetchMembershipPlans } from '@/services/api/institutions.api';
import type { MembershipPlan } from '@/types/api';

export default function AddClubMemberScreen() {
  const { colors } = useAppTheme();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [planId, setPlanId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMembershipPlans();
      const active = data.filter((p) => p.active);
      setPlans(active);
      if (active.length) setPlanId((current) => current || active[0].id);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const save = async () => {
    if (!planId) {
      Alert.alert('Seleccioná un plan', MEMBERSHIP_LABELS.noPlans);
      return;
    }
    if (!contactName.trim() && !contactEmail.trim()) {
      Alert.alert('Datos incompletos', 'Ingresá al menos nombre o email.');
      return;
    }
    setSaving(true);
    try {
      await addClubMemberApi({
        planId,
        contactName: contactName.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      });
      Alert.alert('Socio agregado', 'El socio fue registrado en el club.');
      router.back();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll loading={loading}>
      <Header title={MEMBERSHIP_LABELS.addMember} showBack />

      <Text style={[styles.label, { color: colors.textMuted }]}>Plan de cuota</Text>
      <View style={styles.planRow}>
        {plans.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => setPlanId(p.id)}
            style={[
              styles.planChip,
              {
                backgroundColor: planId === p.id ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={{ color: planId === p.id ? '#fff' : colors.text, fontWeight: '600' }}>
              {p.name}
            </Text>
          </Pressable>
        ))}
      </View>
      {plans.length === 0 ? (
        <Text style={{ color: colors.textMuted, marginBottom: Spacing.md }}>{MEMBERSHIP_LABELS.noPlans}</Text>
      ) : null}

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Nombre completo"
        placeholderTextColor={colors.textMuted}
        value={contactName}
        onChangeText={setContactName}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Email"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={contactEmail}
        onChangeText={setContactEmail}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder={MEMBERSHIP_LABELS.contactPhone}
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        value={contactPhone}
        onChangeText={setContactPhone}
      />

      <Button title="Registrar socio" onPress={save} disabled={saving || plans.length === 0} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: Spacing.xs },
  planRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  planChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: 16,
  },
});
