import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import {
  LOADING_LABELS,
  MEMBERSHIP_LABELS,
  membershipFeeStatusLabel,
} from '@/constants/labels';
import {
  fetchClubMembers,
  fetchMembersSummary,
} from '@/services/api/institutions.api';
import type { ClubMember } from '@/types/api';

function feeBadgeVariant(status: string): 'verified' | 'warning' | 'success' | 'default' {
  if (status === 'up_to_date') return 'verified';
  if (status === 'overdue') return 'warning';
  if (status === 'inactive') return 'default';
  return 'warning';
}

export default function GymMembersScreen() {
  const { colors } = useAppTheme();
  const [members, setMembers] = useState<ClubMember[]>([]);
  const [summary, setSummary] = useState({ upToDate: 0, pending: 0, overdue: 0, total: 0 });
  const [filter, setFilter] = useState<string | undefined>();
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, sum] = await Promise.all([fetchClubMembers(filter), fetchMembersSummary()]);
      setMembers(list);
      setSummary(sum);
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const filters: { key: string | undefined; label: string; count?: number }[] = [
    { key: undefined, label: 'Todos', count: summary.total },
    { key: 'up_to_date', label: MEMBERSHIP_LABELS.feeUpToDate, count: summary.upToDate },
    { key: 'pending', label: MEMBERSHIP_LABELS.feePending, count: summary.pending },
    { key: 'overdue', label: MEMBERSHIP_LABELS.feeOverdue, count: summary.overdue },
  ];

  return (
    <Screen scroll loading={loading && members.length === 0} loadingMessage={LOADING_LABELS.default}>
      <Text style={[styles.title, { color: colors.text }]}>Socios</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Registro de socios, estado de cuotas e invitaciones.
      </Text>

      <View style={styles.actions}>
        <Button
          title={MEMBERSHIP_LABELS.addMember}
          onPress={() => router.push('/(gym)/membership/add-member')}
          style={styles.actionBtn}
        />
        <View style={styles.actionRow}>
          <Button
            title="Planes"
            variant="outline"
            onPress={() => router.push('/(gym)/membership/plans')}
            style={styles.actionBtnHalf}
          />
          <Button
            title="Invitar"
            variant="outline"
            onPress={() => router.push('/(gym)/membership/invites')}
            style={styles.actionBtnHalf}
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}>
        {filters.map((f) => (
          <Pressable
            key={f.key ?? 'all'}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterChip,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.surface,
                borderColor: colors.border,
              },
            ]}>
            <Text style={{ color: filter === f.key ? '#fff' : colors.text, fontWeight: '600', fontSize: 13 }}>
              {f.label}
              {f.count != null ? ` (${f.count})` : ''}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {members.length === 0 && !loading ? (
        <EmptyState
          icon="people-outline"
          title={MEMBERSHIP_LABELS.noMembers}
          description="Creá planes e invitá socios con un código o email."
        />
      ) : (
        members.map((member) => (
          <Pressable
            key={member.id}
            onPress={() =>
              router.push({
                pathname: '/(gym)/membership/edit-member/[id]',
                params: { id: member.id },
              })
            }
            style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>
                  {member.contactName || member.contactEmail || 'Sin nombre'}
                </Text>
                {member.contactEmail ? (
                  <Text style={[styles.meta, { color: colors.textMuted }]}>{member.contactEmail}</Text>
                ) : null}
                {member.contactPhone ? (
                  <Text style={[styles.meta, { color: colors.textMuted }]}>{member.contactPhone}</Text>
                ) : null}
                {member.planName ? (
                  <Text style={[styles.meta, { color: colors.textMuted }]}>
                    {member.planName}
                    {member.nextBillingAt
                      ? ` · ${MEMBERSHIP_LABELS.nextDue}: ${new Date(member.nextBillingAt).toLocaleDateString('es-UY')}`
                      : ''}
                  </Text>
                ) : null}
              </View>
              <Badge label={membershipFeeStatusLabel(member.feeStatus)} variant={feeBadgeVariant(member.feeStatus)} />
            </View>
          </Pressable>
        ))
      )}

    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.xs },
  hint: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  actions: { gap: Spacing.sm, marginBottom: Spacing.md },
  actionBtn: { alignSelf: 'stretch' },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  actionBtnHalf: { flex: 1 },
  filterScroll: { marginBottom: Spacing.md, flexGrow: 0 },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, paddingRight: Spacing.md },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  name: { fontSize: 16, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 2 },
});
