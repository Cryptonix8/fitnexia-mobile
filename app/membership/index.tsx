import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Header } from '@/components/ui/header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import {
  MEMBERSHIP_LABELS,
  membershipFeeStatusLabel,
  PROFILE_MENU_LABELS,
} from '@/constants/labels';
import { fetchMyMemberships } from '@/services/api/memberships.api';
import type { ClubMember } from '@/types/api';

function feeBadgeVariant(status: string): 'verified' | 'warning' | 'default' {
  if (status === 'up_to_date') return 'verified';
  if (status === 'overdue') return 'warning';
  return 'default';
}

export default function AthleteMembershipsScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const [memberships, setMemberships] = useState<ClubMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setMemberships(await fetchMyMemberships());
    } catch (err) {
      setMemberships([]);
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  return (
    <Screen scroll loading={loading && memberships.length === 0} header={<Header title={PROFILE_MENU_LABELS.clubMembership} showBack />}>

      <Button
        title="Unirme con código"
        variant="outline"
        onPress={() => router.push('/membership/join')}
        style={{ marginBottom: Spacing.md }}
      />

      {memberships.length === 0 && !loading ? (
        <View>
          <EmptyState
            icon="card-outline"
            title={MEMBERSHIP_LABELS.noMembershipsTitle}
            description={MEMBERSHIP_LABELS.noMembershipsHint}
          />
          {user?.email ? (
            <View
              style={[
                styles.emailBox,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Text style={[styles.emailLabel, { color: colors.textMuted }]}>Tu sesión actual</Text>
              <Text style={[styles.emailValue, { color: colors.text }]}>{user.email}</Text>
              <Text style={[styles.emailHint, { color: colors.textMuted }]}>
                El gimnasio debe registrar este mismo email en el socio.
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        memberships.map((m) => (
          <Pressable
            key={m.id}
            onPress={() =>
              router.push({ pathname: '/membership/[memberId]', params: { memberId: m.id } })
            }
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.club, { color: colors.text }]}>{m.institutionName}</Text>
                <Text style={{ color: colors.textMuted }}>{m.planName}</Text>
                {m.nextBillingAt ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                    {MEMBERSHIP_LABELS.nextDue}:{' '}
                    {new Date(m.nextBillingAt).toLocaleDateString('es-UY')}
                  </Text>
                ) : m.status === 'pending_authorization' ? (
                  <Text style={{ color: colors.textMuted, fontSize: 13, marginTop: 4 }}>
                    {MEMBERSHIP_LABELS.nextDue}: {MEMBERSHIP_LABELS.pendingActivation}
                  </Text>
                ) : null}
                {m.status === 'pending_authorization' ? (
                  <Text style={{ color: colors.primary, fontSize: 13, marginTop: 6, fontWeight: '600' }}>
                    Tocá para autorizar el débito automático
                  </Text>
                ) : null}
              </View>
              <Badge
                label={membershipFeeStatusLabel(m.feeStatus)}
                variant={feeBadgeVariant(m.feeStatus)}
              />
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  club: { fontSize: 17, fontWeight: '700' },
  emailBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  emailLabel: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  emailValue: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  emailHint: { fontSize: 13, marginTop: Spacing.sm, lineHeight: 18 },
});
