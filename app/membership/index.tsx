import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
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
    <Screen scroll loading={loading}>
      <Text style={[styles.title, { color: colors.text }]}>{PROFILE_MENU_LABELS.clubMembership}</Text>

      <Button
        title="Unirme con código"
        variant="outline"
        onPress={() => router.push('/membership/join')}
        style={{ marginBottom: Spacing.md }}
      />

      {memberships.length === 0 && !loading ? (
        <EmptyState
          icon="card-outline"
          title="Sin membresías"
          description="Si tu club te invitó, ingresá el código de invitación."
        />
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
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.md },
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  club: { fontSize: 17, fontWeight: '700' },
});
