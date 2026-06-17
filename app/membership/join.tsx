import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { MEMBERSHIP_LABELS, membershipBillingLabel, formatMoney } from '@/constants/labels';
import { acceptMembershipInvite, fetchInvitePreview } from '@/services/api/memberships.api';
import { openMembershipAuthorization } from '@/utils/membership-payment';

export default function MembershipJoinScreen() {
  const { colors } = useAppTheme();
  const params = useLocalSearchParams<{ code?: string }>();
  const [code, setCode] = useState((params.code ?? '').toUpperCase());
  const [preview, setPreview] = useState<Awaited<ReturnType<typeof fetchInvitePreview>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState(false);

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true);
    try {
      setPreview(await fetchInvitePreview(code.trim()));
    } catch (err) {
      setPreview(null);
      Alert.alert('Código inválido', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const join = async () => {
    setJoining(true);
    try {
      const result = await acceptMembershipInvite(code.trim());
      if (result.authorizationUrl) {
        await openMembershipAuthorization(result.authorizationUrl, result.member.id);
      }
      router.replace({ pathname: '/membership/[memberId]', params: { memberId: result.member.id } });
    } catch (err) {
      Alert.alert('No se pudo unir', getErrorMessage(err));
    } finally {
      setJoining(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="Unirme al club" showBack />

      <Text style={[styles.label, { color: colors.textMuted }]}>{MEMBERSHIP_LABELS.inviteCode}</Text>
      <TextInput
        style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
        placeholder="Ej. A1B2C3D4"
        placeholderTextColor={colors.textMuted}
        autoCapitalize="characters"
        value={code}
        onChangeText={(v) => {
          setCode(v.toUpperCase());
          setPreview(null);
        }}
      />
      <Button title="Verificar código" variant="outline" onPress={lookup} disabled={loading} />

      {preview ? (
        <View style={[styles.preview, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.club, { color: colors.text }]}>{preview.institutionName}</Text>
          <Text style={{ color: colors.textMuted, marginTop: 4 }}>{preview.plan.name}</Text>
          <Text style={{ color: colors.text, marginTop: Spacing.sm, fontWeight: '600' }}>
            {formatMoney(preview.plan.price)} · {membershipBillingLabel(preview.plan.billingFrequency)}
          </Text>
          <Button title="Aceptar y autorizar débito" onPress={join} disabled={joining} style={{ marginTop: Spacing.md }} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, marginBottom: Spacing.xs },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: 18,
    letterSpacing: 2,
    marginBottom: Spacing.md,
  },
  preview: {
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  club: { fontSize: 20, fontWeight: '800' },
});
