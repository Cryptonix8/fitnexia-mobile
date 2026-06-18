import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import {
  MEMBERSHIP_LABELS,
  membershipFeeStatusLabel,
  membershipBillingLabel,
  formatMoney,
} from '@/constants/labels';
import {
  authorizeMembership,
  fetchMembershipStatement,
  payMembershipDebt,
} from '@/services/api/memberships.api';
import type { MembershipStatement } from '@/types/api';
import { openMembershipAuthorization, openMembershipCheckout } from '@/utils/membership-payment';

export default function MembershipStatementScreen() {
  const { memberId } = useLocalSearchParams<{ memberId: string }>();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [statement, setStatement] = useState<MembershipStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);

  const load = useCallback(async () => {
    if (!memberId) return;
    setLoading(true);
    setLoadError(null);
    try {
      setStatement(await fetchMembershipStatement(memberId));
    } catch (err) {
      setStatement(null);
      setLoadError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [memberId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const authorize = async () => {
    if (!memberId) return;
    setPaying(true);
    try {
      const result = await authorizeMembership(memberId);
      if (result.authorizationUrl) {
        await openMembershipAuthorization(result.authorizationUrl, memberId);
      }
      await load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  const payDebt = async () => {
    if (!memberId) return;
    setPaying(true);
    try {
      const result = await payMembershipDebt(memberId);
      if (result.checkoutUrl) {
        await openMembershipCheckout(result.checkoutUrl, memberId);
      }
      await load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setPaying(false);
    }
  };

  if (!statement && !loading) {
    return (
      <Screen scroll>
        <Header title="Estado de cuenta" showBack />
        <View
          style={[
            styles.notFoundBox,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}>
          <Text style={[styles.notFoundTitle, { color: colors.text }]}>
            {MEMBERSHIP_LABELS.membershipNotFoundTitle}
          </Text>
          <Text style={{ color: colors.textMuted, lineHeight: 20 }}>
            {MEMBERSHIP_LABELS.membershipNotFoundHint}
          </Text>
          {user?.email ? (
            <Text style={{ color: colors.text, marginTop: Spacing.md, fontWeight: '600' }}>
              Tu sesión: {user.email}
            </Text>
          ) : null}
          {loadError ? (
            <Text style={{ color: colors.warning, marginTop: Spacing.sm, fontSize: 13 }}>{loadError}</Text>
          ) : null}
        </View>
        <Button title="Reintentar" onPress={load} style={{ marginTop: Spacing.md }} />
        <Button
          title="Volver a membresías"
          variant="outline"
          onPress={() => router.replace('/membership')}
          style={{ marginTop: Spacing.sm }}
        />
      </Screen>
    );
  }

  const member = statement?.member;
  const needsAuth = member?.status === 'pending_authorization';
  const hasDebt = Boolean(statement?.amountDue);

  return (
    <Screen scroll loading={loading}>
      <Header title="Estado de cuenta" showBack />

      {member ? (
        <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.club, { color: colors.text }]}>{member.institutionName}</Text>
          <Text style={{ color: colors.textMuted }}>{statement?.plan.name}</Text>
          <View style={{ marginTop: Spacing.sm }}>
            <Badge label={membershipFeeStatusLabel(member.feeStatus)} variant="verified" />
          </View>
          {statement?.plan ? (
            <Text style={{ color: colors.text, marginTop: Spacing.sm }}>
              Cuota: {formatMoney(statement.plan.price)} ·{' '}
              {membershipBillingLabel(statement.plan.billingFrequency)}
            </Text>
          ) : null}
          {statement?.nextDueDate ? (
            <Text style={{ color: colors.textMuted, marginTop: 4 }}>
              {MEMBERSHIP_LABELS.nextDue}: {new Date(statement.nextDueDate).toLocaleDateString('es-UY')}
            </Text>
          ) : null}
          {statement?.amountDue ? (
            <Text style={{ color: colors.warning, marginTop: Spacing.sm, fontWeight: '700' }}>
              {MEMBERSHIP_LABELS.amountDue}: {formatMoney(statement.amountDue)}
            </Text>
          ) : null}
        </View>
      ) : null}

      {needsAuth ? (
        <Button
          title={MEMBERSHIP_LABELS.authorizeDebit}
          onPress={authorize}
          disabled={paying}
          style={{ marginBottom: Spacing.md }}
        />
      ) : null}
      {hasDebt ? (
        <Button title={MEMBERSHIP_LABELS.payDebt} onPress={payDebt} disabled={paying} style={{ marginBottom: Spacing.md }} />
      ) : null}

      <Text style={[styles.section, { color: colors.text }]}>Historial de pagos</Text>
      {(statement?.payments ?? []).length === 0 ? (
        <Text style={{ color: colors.textMuted }}>Sin pagos registrados.</Text>
      ) : (
        statement?.payments.map((p) => (
          <View
            key={p.id}
            style={[styles.paymentRow, { borderColor: colors.border }]}>
            <Text style={{ color: colors.text }}>{formatMoney(p.amount)}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 13 }}>
              {new Date(p.createdAt).toLocaleDateString('es-UY')} · {p.status}
            </Text>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  club: { fontSize: 20, fontWeight: '800' },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  paymentRow: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  notFoundBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  notFoundTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
});
