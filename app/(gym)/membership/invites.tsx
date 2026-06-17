import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { MEMBERSHIP_LABELS } from '@/constants/labels';
import {
  cancelMembershipInviteApi,
  createMembershipInviteApi,
  fetchMembershipInvites,
  fetchMembershipPlans,
} from '@/services/api/institutions.api';
import type { MembershipInvite, MembershipPlan } from '@/types/api';

export default function GymMembershipInvitesScreen() {
  const { colors } = useAppTheme();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [invites, setInvites] = useState<MembershipInvite[]>([]);
  const [planId, setPlanId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, i] = await Promise.all([fetchMembershipPlans(), fetchMembershipInvites()]);
      setPlans(p.filter((x) => x.active));
      setInvites(i);
      if (!planId && p.length) setPlanId(p.find((x) => x.active)?.id ?? '');
    } catch {
      setPlans([]);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const sendInvite = async () => {
    if (!planId) {
      Alert.alert('Seleccioná un plan', 'Creá un plan de cuota antes de invitar.');
      return;
    }
    setSaving(true);
    try {
      const invite = await createMembershipInviteApi({
        planId,
        email: email.trim() || undefined,
        invitedName: name.trim() || undefined,
      });
      Alert.alert('Invitación creada', `Código: ${invite.code}`);
      setEmail('');
      setName('');
      await load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const cancelInvite = (invite: MembershipInvite) => {
    Alert.alert('Cancelar invitación', `¿Cancelar código ${invite.code}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelMembershipInviteApi(invite.id);
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
      <Header title="Invitar socios" showBack />

      <Text style={[styles.label, { color: colors.textMuted }]}>Plan</Text>
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
            <Text style={{ color: planId === p.id ? '#fff' : colors.text, fontWeight: '600' }}>{p.name}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Email (opcional)"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Nombre (opcional)"
        placeholderTextColor={colors.textMuted}
        value={name}
        onChangeText={setName}
      />
      <Button title="Generar invitación" onPress={sendInvite} disabled={saving} />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Invitaciones</Text>
      {invites.map((invite) => (
        <View
          key={invite.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.code, { color: colors.text }]}>{invite.code}</Text>
          <Text style={{ color: colors.textMuted }}>
            {invite.planName} · {invite.status}
            {invite.email ? ` · ${invite.email}` : ''}
          </Text>
          {invite.status === 'pending' ? (
            <Pressable onPress={() => cancelInvite(invite)} style={{ marginTop: Spacing.sm }}>
              <Text style={{ color: colors.warning, fontWeight: '600' }}>Cancelar</Text>
            </Pressable>
          ) : null}
        </View>
      ))}
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
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  code: { fontSize: 20, fontWeight: '800', letterSpacing: 2 },
});
