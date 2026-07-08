import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/components/ui/badge';
import { ActionHubGrid } from '@/components/ui/action-hub-grid';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import {
  LOADING_LABELS,
  MEMBERSHIP_LABELS,
  memberAppLinkLabel,
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

  const actions = useMemo(
    () => [
      {
        id: 'add',
        label: MEMBERSHIP_LABELS.addMember,
        subtitle: 'Alta manual de un nuevo socio',
        icon: 'person-add-outline' as const,
        tint: colors.primary,
        iconColor: colors.surface,
        featured: true,
        onPress: () => router.push('/(gym)/membership/add-member'),
      },
      {
        id: 'collections',
        label: 'Cobranzas',
        subtitle: 'Panel de pagos del mes',
        icon: 'wallet-outline' as const,
        tint: colors.warningMuted,
        iconColor: colors.warning,
        onPress: () => router.push('/(gym)/membership/collections'),
      },
      {
        id: 'plans',
        label: 'Planes',
        subtitle: 'Cuotas y beneficios',
        icon: 'card-outline' as const,
        tint: colors.primaryMuted,
        iconColor: colors.primary,
        onPress: () => router.push('/(gym)/membership/plans'),
      },
      {
        id: 'invites',
        label: 'Invitar',
        subtitle: 'Códigos y emails',
        icon: 'mail-outline' as const,
        tint: colors.successMuted,
        iconColor: colors.success,
        onPress: () => router.push('/(gym)/membership/invites'),
      },
    ],
    [colors],
  );

  const filters: { key: string | undefined; label: string; count?: number }[] = [
    { key: undefined, label: 'Todos', count: summary.total },
    { key: 'up_to_date', label: MEMBERSHIP_LABELS.feeUpToDate, count: summary.upToDate },
    { key: 'pending', label: MEMBERSHIP_LABELS.feePending, count: summary.pending },
    { key: 'overdue', label: MEMBERSHIP_LABELS.feeOverdue, count: summary.overdue },
  ];

  return (
    <Screen
      scroll
      loading={loading && members.length === 0}
      loadingMessage={LOADING_LABELS.default}
      header={<Text style={[styles.title, { color: colors.text }]}>Socios</Text>}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Gestioná socios, cuotas, cobranzas e invitaciones.
      </Text>

      <View style={styles.summaryRow}>
        <SummaryStat
          label="Al día"
          value={summary.upToDate}
          icon="checkmark-circle-outline"
          tint={colors.successMuted}
          iconColor={colors.success}
          colors={colors}
        />
        <SummaryStat
          label="Pendientes"
          value={summary.pending}
          icon="time-outline"
          tint={colors.warningMuted}
          iconColor={colors.warning}
          colors={colors}
        />
        <SummaryStat
          label="Morosos"
          value={summary.overdue}
          icon="alert-circle-outline"
          tint={colors.error + '18'}
          iconColor={colors.error}
          colors={colors}
        />
      </View>

      <ActionHubGrid actions={actions} />

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
                borderColor: filter === f.key ? colors.primary : colors.border,
              },
            ]}>
            <Text
              style={{
                color: filter === f.key ? colors.surface : colors.text,
                fontWeight: '600',
                fontSize: 13,
              }}>
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
                <Text
                  style={[
                    styles.linkMeta,
                    { color: member.userId ? colors.primary : colors.warning },
                  ]}>
                  {memberAppLinkLabel(member)}
                </Text>
              </View>
              <Badge label={membershipFeeStatusLabel(member.feeStatus)} variant={feeBadgeVariant(member.feeStatus)} />
            </View>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

function SummaryStat({
  label,
  value,
  icon,
  tint,
  iconColor,
  colors,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  iconColor: string;
  colors: { text: string; textMuted: string };
}) {
  return (
    <View style={[styles.stat, { backgroundColor: tint }]}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.xs },
  hint: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 11, fontWeight: '600' },
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
  linkMeta: { fontSize: 12, marginTop: 6, fontWeight: '600' },
});
