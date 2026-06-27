import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { VerificationBanner } from '@/components/profile/verification-banner';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import {
  acceptGymInviteApi,
  fetchMyGymInvitesApi,
  type GymStaffInvite,
} from '@/services/api/instructors.api';
import { getLinkedInstructorId } from '@/utils/instructor';
import { computeInstructorTodayStats } from '@/utils/instructor-metrics';
import { formatRevenueCompact } from '@/utils/gym-metrics';
import { isSameCalendarDay } from '@/utils/schedule';

export default function InstructorDashboard() {
  const { user, updateProfile } = useAuth();
  const { getClassesByInstructor, isLoading } = useClasses();
  const { colors } = useAppTheme();
  const profile = user?.instructorProfile;
  const instructorId = getLinkedInstructorId(user);
  const allClasses = getClassesByInstructor(instructorId);
  const today = new Date();
  const todayClasses = allClasses.filter((c) => isSameCalendarDay(new Date(c.startAt), today));
  const todayStats = computeInstructorTodayStats(todayClasses);
  const [gymInvites, setGymInvites] = useState<GymStaffInvite[]>([]);
  const [acceptingInviteId, setAcceptingInviteId] = useState<string | null>(null);
  const [togglingAvailable, setTogglingAvailable] = useState(false);

  const loadGymInvites = useCallback(async () => {
    try {
      const invites = await fetchMyGymInvitesApi();
      setGymInvites(invites);
    } catch {
      setGymInvites([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGymInvites();
    }, [loadGymInvites]),
  );

  const toggleAvailable = async () => {
    if (!profile || togglingAvailable) return;
    setTogglingAvailable(true);
    try {
      await updateProfile({
        instructorProfile: { availableNow: !profile.availableNow },
      });
    } catch (err) {
      Alert.alert('No se pudo actualizar disponibilidad', getErrorMessage(err));
    } finally {
      setTogglingAvailable(false);
    }
  };

  const acceptInvite = async (invite: GymStaffInvite) => {
    setAcceptingInviteId(invite.id);
    try {
      const result = await acceptGymInviteApi(invite.id);
      setGymInvites((prev) => prev.filter((item) => item.id !== invite.id));
      Alert.alert('Invitación aceptada', `Te uniste a ${result.institutionName} como instructor del equipo.`);
    } catch (err) {
      Alert.alert('No se pudo aceptar la invitación', getErrorMessage(err));
    } finally {
      setAcceptingInviteId(null);
    }
  };

  return (
    <Screen
      scroll
      loading={isLoading && allClasses.length === 0}
      loadingMessage={LOADING_LABELS.classes}
      header={<Text style={[styles.title, { color: colors.text }]}>Resumen de hoy</Text>}>
      {profile ? (
        <VerificationBanner
          verificationStatus={profile.verificationStatus}
          profileRoute="/(instructor)/profile/verify"
        />
      ) : null}
      <Text style={[styles.greet, { color: colors.textMuted }]}>Hola, {user?.firstName} 👋</Text>

      {gymInvites.length > 0 ? (
        <View style={styles.invitesSection}>
          <Text style={[styles.invitesTitle, { color: colors.text }]}>Invitaciones de gimnasios</Text>
          {gymInvites.map((invite) => (
            <View
              key={invite.id}
              style={[
                styles.inviteCard,
                { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
              ]}>
              <View style={styles.inviteBody}>
                <Text style={[styles.inviteName, { color: colors.text }]}>{invite.institutionName}</Text>
                <Text style={[styles.inviteMeta, { color: colors.textMuted }]}>
                  Te invitó a unirte a su equipo
                  {invite.message ? ` · "${invite.message}"` : ''}
                </Text>
              </View>
              <Button
                title="Aceptar"
                size="sm"
                disabled={acceptingInviteId === invite.id}
                onPress={() => acceptInvite(invite)}
              />
            </View>
          ))}
        </View>
      ) : null}

      <View style={styles.stats}>
        <StatCard
          label="Reservas"
          value={String(todayStats.bookings)}
          icon="calendar"
          colors={colors}
        />
        <StatCard
          label="Ingresos"
          value={formatRevenueCompact(todayStats.revenueCents)}
          icon="cash"
          colors={colors}
        />
        <StatCard
          label="Clases"
          value={String(todayStats.classes)}
          icon="fitness"
          colors={colors}
        />
      </View>

      <Pressable
        style={[
          styles.availableBtn,
          { backgroundColor: profile?.availableNow ? colors.successMuted : colors.surface },
        ]}
        disabled={togglingAvailable}
        onPress={() => void toggleAvailable()}>
        <Ionicons
          name={profile?.availableNow ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={profile?.availableNow ? colors.success : colors.textMuted}
        />
        <Text style={[styles.availableText, { color: colors.textSecondary }]}>
          {profile?.availableNow ? 'Disponible ahora — tocá para desactivar' : 'Marcar como disponible ahora'}
        </Text>
      </Pressable>

      <View style={styles.row}>
        <Text style={[styles.section, { color: colors.text }]}>Clases de hoy</Text>
        <Button title="+ Nueva" size="sm" onPress={() => router.push('/create-class')} />
      </View>

      {todayClasses.length ? (
        todayClasses.map((c) => <ClassCard key={c.id} item={c} />)
      ) : (
        <EmptyState
          compact
          icon="calendar-outline"
          title="No hay clases hoy"
          description="Programá una clase para empezar a recibir reservas."
        />
      )}

      <LoadingOverlay
        visible={acceptingInviteId !== null || togglingAvailable}
        message={togglingAvailable ? LOADING_LABELS.availability : 'Aceptando invitación…'}
      />
    </Screen>
  );
}

function StatCard({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: { primary: string; text: string; textMuted: string; surface: string };
}) {
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { fontSize: 14 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.md },
  invitesSection: { marginBottom: Spacing.lg },
  invitesTitle: { fontSize: 16, fontWeight: '700', marginBottom: Spacing.sm },
  inviteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  inviteBody: { flex: 1 },
  inviteName: { fontSize: 15, fontWeight: '700' },
  inviteMeta: { fontSize: 13, marginTop: 2, lineHeight: 18 },
  stats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: Spacing.sm },
  statLabel: { fontSize: 12 },
  availableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  availableText: { fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  section: { fontSize: 18, fontWeight: '700' },
});
