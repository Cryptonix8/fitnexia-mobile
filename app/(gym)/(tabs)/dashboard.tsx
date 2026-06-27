import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { VerificationBanner } from '@/components/profile/verification-banner';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { formatClassDate } from '@/data/mock';
import { Radius, Spacing } from '@/constants/fitnexia';
import {
  computeClassBooked,
  computeGymDashboardStats,
  resolveInstitutionId,
} from '@/utils/gym-classes';
import { LOADING_LABELS } from '@/constants/labels';
import { formatAttendanceRate, formatRevenueCompact } from '@/utils/gym-metrics';

export default function GymDashboardScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { classes, isLoading } = useClasses();
  const institutionId = resolveInstitutionId(user);
  const profile = user?.institutionProfile;
  const stats = computeGymDashboardStats(institutionId, classes);

  return (
    <Screen
      scroll
      loading={isLoading && stats.gymClasses.length === 0}
      loadingMessage={LOADING_LABELS.classes}>
      {profile ? (
        <VerificationBanner
          verificationStatus={profile.verificationStatus}
          profileRoute="/(gym)/profile/verify"
        />
      ) : null}
      <Text style={[styles.greet, { color: colors.textMuted }]}>
        {profile?.name ?? 'Gimnasio'}
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>Panel de control</Text>

      <View style={styles.stats}>
        <MiniStat
          label="Reservas hoy"
          value={String(stats.todayBookings)}
          colors={colors}
        />
        <MiniStat
          label="Ingresos (reservados)"
          value={formatRevenueCompact(stats.weekRevenueCents)}
          colors={colors}
        />
        <MiniStat
          label="Ocupación"
          value={formatAttendanceRate(stats.occupancyRate)}
          colors={colors}
        />
      </View>

      <View style={styles.row}>
        <Text style={[styles.section, { color: colors.text }]}>Agenda de hoy</Text>
        <Button title="+ Nueva" size="sm" onPress={() => router.push('/create-class')} />
      </View>

      {stats.todayClasses.length === 0 ? (
        <EmptyState
          compact
          icon="today-outline"
          title="Sin clases hoy"
          description="No hay clases grupales programadas para hoy."
        />
      ) : (
        stats.todayClasses.map((c) => {
          const booked = computeClassBooked(c);
          const cap = c.capacity ?? 0;
          return (
            <View key={c.id} style={styles.scheduleItem}>
              <View
                style={[
                  styles.scheduleCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}>
                <View style={styles.scheduleRow}>
                  <UserAvatar
                    size={52}
                    kind="institution"
                    uri={c.institution?.logoUrl ?? user?.avatarUri}
                    style={styles.scheduleAvatar}
                  />
                  <View style={styles.scheduleBody}>
                    <View style={styles.scheduleHeader}>
                      <Text style={[styles.scheduleTime, { color: colors.primary }]}>
                        {formatClassDate(c.startAt)}
                      </Text>
                      <Text style={[styles.occupancyBadge, { color: colors.textMuted }]}>
                        {booked}/{cap} reservados
                      </Text>
                    </View>
                    <Text style={[styles.scheduleTitle, { color: colors.text }]}>{c.title}</Text>
                    <Text style={[styles.scheduleMeta, { color: colors.textMuted }]}>
                      {c.instructor.displayName} · {cap - booked} lugares disponibles
                    </Text>
                    <Pressable
                      onPress={() =>
                        router.push({ pathname: '/edit-class/[id]', params: { id: c.id } })
                      }>
                      <Text style={[styles.editLink, { color: colors.primary }]}>Gestionar</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          );
        })
      )}

      <Text style={[styles.section, { color: colors.text, marginTop: Spacing.lg }]}>
        Todas las clases grupales
      </Text>
      {stats.gymClasses.length ? (
        stats.gymClasses.map((c) => (
          <ClassCard key={c.id} item={c} institutionLogoUri={user?.avatarUri} />
        ))
      ) : (
        <EmptyState
          compact
          icon="fitness-outline"
          title="Sin clases grupales"
          description="Creá tu primera clase grupal para empezar a recibir reservas."
        />
      )}
    </Screen>
  );
}

function MiniStat({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { surface: string; primary: string; textMuted: string };
}) {
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]}>
      <Text style={[styles.statValue, { color: colors.primary }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { fontSize: 14 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.md },
  stats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  stat: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 11, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  section: { fontSize: 18, fontWeight: '700' },
  scheduleItem: { marginBottom: Spacing.sm },
  scheduleCard: {
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  scheduleAvatar: { marginTop: 2 },
  scheduleBody: { flex: 1, minWidth: 0 },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleTime: { fontSize: 12, fontWeight: '600' },
  occupancyBadge: { fontSize: 12, fontWeight: '600' },
  scheduleTitle: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  scheduleMeta: { fontSize: 13, marginTop: 4 },
  editLink: { fontSize: 14, fontWeight: '600', marginTop: Spacing.sm },
});
