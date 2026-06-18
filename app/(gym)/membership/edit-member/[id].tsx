import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { MEMBERSHIP_LABELS, membershipFeeStatusLabel } from '@/constants/labels';
import {
  fetchClubMemberById,
  fetchMembershipPlans,
  removeClubMemberApi,
  updateClubMemberApi,
} from '@/services/api/institutions.api';
import type { MembershipPlan } from '@/types/api';

export default function EditClubMemberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [planId, setPlanId] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [feeStatus, setFeeStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [member, planList] = await Promise.all([
        fetchClubMemberById(id),
        fetchMembershipPlans(),
      ]);
      setPlans(planList.filter((p) => p.active));
      setPlanId(member.planId);
      setContactName(member.contactName ?? '');
      setContactEmail(member.contactEmail ?? '');
      setContactPhone(member.contactPhone ?? '');
      setFeeStatus(member.feeStatus);
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
    if (!id || !planId) return;
    setSaving(true);
    try {
      await updateClubMemberApi(id, {
        planId,
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
      });
      Alert.alert('Guardado', 'Los datos del socio fueron actualizados.');
      router.back();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deregister = () => {
    if (!id) return;
    Alert.alert('Dar de baja', '¿Dar de baja a este socio?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Dar de baja',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await removeClubMemberApi(id);
            router.back();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll loading={loading}>
      <Header title={MEMBERSHIP_LABELS.editMember} showBack />

      {feeStatus ? (
        <Text style={[styles.status, { color: colors.textMuted }]}>
          Estado de cuota: {membershipFeeStatusLabel(feeStatus)}
        </Text>
      ) : null}

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

      <Button title="Guardar cambios" onPress={save} disabled={saving} />
      <Button
        title="Dar de baja"
        variant="outline"
        onPress={deregister}
        disabled={saving}
        style={{ marginTop: Spacing.sm }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  status: { fontSize: 14, marginBottom: Spacing.md },
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
