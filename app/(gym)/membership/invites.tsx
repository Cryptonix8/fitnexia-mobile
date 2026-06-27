import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Pressable, Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { MEMBERSHIP_LABELS } from '@/constants/labels';
import {
  bulkCreateMembershipInvitesApi,
  cancelMembershipInviteApi,
  createMembershipInviteApi,
  fetchMembershipInvites,
  fetchMembershipPlans,
} from '@/services/api/institutions.api';
import type { MembershipInvite, MembershipPlan } from '@/types/api';
import { parseMembershipInviteCsv } from '@/utils/membership-invite-csv';

function inviteShareMessage(invite: MembershipInvite) {
  const link = invite.joinUrl ?? `fitnexia://membership/join?code=${invite.code}`;
  return `${invite.institutionName ?? 'Tu club'} te invitó como socio.\nCódigo: ${invite.code}\n${link}`;
}

export default function GymMembershipInvitesScreen() {
  const { colors } = useAppTheme();
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [invites, setInvites] = useState<MembershipInvite[]>([]);
  const [planId, setPlanId] = useState('');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [showBulk, setShowBulk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bulkSaving, setBulkSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, i] = await Promise.all([fetchMembershipPlans(), fetchMembershipInvites()]);
      const activePlans = p.filter((x) => x.active);
      setPlans(activePlans);
      setInvites(i);
      setPlanId((current) => current || activePlans[0]?.id || '');
    } catch {
      setPlans([]);
      setInvites([]);
    } finally {
      setLoading(false);
    }
  }, []);

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

  const sendBulkInvites = async () => {
    if (!planId) {
      Alert.alert('Seleccioná un plan', 'Creá un plan de cuota antes de invitar.');
      return;
    }
    const rows = parseMembershipInviteCsv(bulkText);
    if (!rows.length) {
      Alert.alert('Sin datos', 'Pegá al menos una fila con email o nombre.');
      return;
    }
    setBulkSaving(true);
    try {
      const result = await bulkCreateMembershipInvitesApi(
        rows.map((row) => ({
          planId,
          email: row.email,
          invitedName: row.invitedName,
          invitedPhone: row.invitedPhone,
        })),
      );
      const ok = result.results.filter((r) => (r as { ok?: boolean }).ok).length;
      const failed = result.results.length - ok;
      Alert.alert(
        'Carga masiva',
        `${ok} ${MEMBERSHIP_LABELS.bulkInviteResult}${failed ? `, ${failed} ${MEMBERSHIP_LABELS.bulkInviteFailed}` : ''}.`,
      );
      setBulkText('');
      setShowBulk(false);
      await load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setBulkSaving(false);
    }
  };

  const shareInvite = async (invite: MembershipInvite) => {
    try {
      await Share.share({ message: inviteShareMessage(invite) });
    } catch {
      // User dismissed share sheet.
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
    <Screen scroll loading={loading && invites.length === 0} header={<Header title="Invitar socios" showBack />}>

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

      <Pressable onPress={() => setShowBulk((v) => !v)} style={{ marginTop: Spacing.md }}>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>
          {showBulk ? 'Ocultar carga masiva' : MEMBERSHIP_LABELS.bulkInviteTitle}
        </Text>
      </Pressable>

      {showBulk ? (
        <View style={{ marginTop: Spacing.sm }}>
          <Text style={{ color: colors.textMuted, marginBottom: Spacing.xs, lineHeight: 18 }}>
            {MEMBERSHIP_LABELS.bulkInviteHint}
          </Text>
          <TextInput
            style={[
              styles.bulkInput,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface },
            ]}
            placeholder={MEMBERSHIP_LABELS.bulkInvitePlaceholder}
            placeholderTextColor={colors.textMuted}
            multiline
            value={bulkText}
            onChangeText={setBulkText}
          />
          <Button
            title={MEMBERSHIP_LABELS.bulkInviteSubmit}
            variant="outline"
            onPress={sendBulkInvites}
            disabled={bulkSaving}
          />
        </View>
      ) : null}

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
            <View style={styles.cardActions}>
              <Pressable onPress={() => shareInvite(invite)}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>
                  {MEMBERSHIP_LABELS.shareInvite}
                </Text>
              </Pressable>
              <Pressable onPress={() => cancelInvite(invite)}>
                <Text style={{ color: colors.warning, fontWeight: '600' }}>Cancelar</Text>
              </Pressable>
            </View>
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
  bulkInput: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.lg, marginBottom: Spacing.sm },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  code: { fontSize: 20, fontWeight: '800', letterSpacing: 2 },
  cardActions: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
});
