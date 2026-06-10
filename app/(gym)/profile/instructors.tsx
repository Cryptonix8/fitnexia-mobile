import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { StaffInstructorCard } from '@/components/gym/staff-instructor-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { PROFILE_MENU_LABELS } from '@/constants/labels';
import {
  cancelInviteApi,
  fetchStaffRoster,
  inviteInstructorApi,
  unlinkInstructorApi,
  type StaffRosterEntry,
} from '@/services/api/institutions.api';

function sortByName(a: StaffRosterEntry, b: StaffRosterEntry) {
  return a.displayName.localeCompare(b.displayName);
}

function RosterSection({
  title,
  emptyMessage,
  instructors,
  loadingId,
  onInvite,
  onCancel,
  onRemove,
}: {
  title: string;
  emptyMessage: string;
  instructors: StaffRosterEntry[];
  loadingId: string | null;
  onInvite: (instructor: StaffRosterEntry) => void;
  onCancel: (instructor: StaffRosterEntry) => void;
  onRemove: (instructor: StaffRosterEntry) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {instructors.length === 0 ? (
        <EmptyState compact icon="people-outline" title="Sin resultados" description={emptyMessage} />
      ) : (
        instructors.map((instructor) => (
          <StaffInstructorCard
            key={instructor.id}
            instructor={instructor}
            busy={loadingId === instructor.id}
            onInvite={onInvite}
            onCancel={onCancel}
            onRemove={onRemove}
          />
        ))
      )}
    </View>
  );
}

export default function GymManageInstructorsScreen() {
  const { colors } = useAppTheme();
  const [roster, setRoster] = useState<StaffRosterEntry[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadRoster = useCallback(async () => {
    try {
      setRoster(await fetchStaffRoster());
    } catch {
      setRoster([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRoster();
    }, [loadRoster]),
  );

  const linked = useMemo(
    () => roster.filter((i) => i.staffStatus === 'linked').sort(sortByName),
    [roster],
  );
  const pending = useMemo(
    () => roster.filter((i) => i.staffStatus === 'pending').sort(sortByName),
    [roster],
  );
  const available = useMemo(
    () => roster.filter((i) => i.staffStatus === 'none').sort(sortByName),
    [roster],
  );

  const inviteInstructor = async (instructor: StaffRosterEntry) => {
    setLoadingId(instructor.id);
    try {
      await inviteInstructorApi({ instructorId: instructor.id });
      await loadRoster();
      Alert.alert(
        'Invitación enviada',
        `Invitamos a ${instructor.displayName}. Verán la invitación en su app.`,
      );
    } catch (err) {
      Alert.alert('No se pudo invitar', getErrorMessage(err));
    } finally {
      setLoadingId(null);
    }
  };

  const cancelInvite = (instructor: StaffRosterEntry) => {
    if (!instructor.inviteId) return;
    Alert.alert('Cancelar invitación', `¿Retirar la invitación a ${instructor.displayName}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Cancelar invitación',
        style: 'destructive',
        onPress: async () => {
          setLoadingId(instructor.id);
          try {
            await cancelInviteApi(instructor.inviteId!);
            await loadRoster();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          } finally {
            setLoadingId(null);
          }
        },
      },
    ]);
  };

  const removeInstructor = (instructor: StaffRosterEntry) => {
    Alert.alert('Desvincular instructor', `¿Quitar a ${instructor.displayName} del staff?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Desvincular',
        style: 'destructive',
        onPress: async () => {
          setLoadingId(instructor.id);
          try {
            await unlinkInstructorApi(instructor.id);
            await loadRoster();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          } finally {
            setLoadingId(null);
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <Header title={PROFILE_MENU_LABELS.instructors} showBack />

      <View style={styles.statsRow}>
        <View style={[styles.statPill, { backgroundColor: colors.successMuted }]}>
          <Text style={[styles.statValue, { color: colors.success }]}>{linked.length}</Text>
          <Text style={[styles.statLabel, { color: colors.success }]}>Vinculados</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.warningMuted }]}>
          <Text style={[styles.statValue, { color: colors.textSecondary }]}>{pending.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pendientes</Text>
        </View>
        <View style={[styles.statPill, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{available.length}</Text>
          <Text style={[styles.statLabel, { color: colors.textMuted }]}>Sin invitar</Text>
        </View>
      </View>

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Instructores registrados en la plataforma. Invitalos para que dicten clases grupales en tu
        gimnasio.
      </Text>

      <RosterSection
        title={`Vinculados (${linked.length})`}
        emptyMessage="Todavía no hay instructores vinculados."
        instructors={linked}
        loadingId={loadingId}
        onInvite={inviteInstructor}
        onCancel={cancelInvite}
        onRemove={removeInstructor}
      />

      <RosterSection
        title={`Pendientes (${pending.length})`}
        emptyMessage="No hay invitaciones pendientes."
        instructors={pending}
        loadingId={loadingId}
        onInvite={inviteInstructor}
        onCancel={cancelInvite}
        onRemove={removeInstructor}
      />

      <RosterSection
        title={`Sin invitar (${available.length})`}
        emptyMessage="Todos los instructores registrados ya fueron invitados o vinculados."
        instructors={available}
        loadingId={loadingId}
        onInvite={inviteInstructor}
        onCancel={cancelInvite}
        onRemove={removeInstructor}
      />

      <LoadingOverlay visible={loadingId !== null} message="Procesando…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  statPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.md,
  },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  hint: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.lg },
  section: { marginBottom: Spacing.lg },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: Spacing.sm },
});
