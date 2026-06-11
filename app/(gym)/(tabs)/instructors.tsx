import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { StaffInstructorCard } from '@/components/gym/staff-instructor-card';
import { EmptyState } from '@/components/ui/empty-state';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import {
  cancelInviteApi,
  fetchStaffRoster,
  inviteInstructorApi,
  unlinkInstructorApi,
  type StaffRosterEntry,
} from '@/services/api/institutions.api';

export default function GymInstructorsScreen() {
  const { refreshUser } = useAuth();
  const { colors } = useAppTheme();
  const [roster, setRoster] = useState<StaffRosterEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadRoster = useCallback(async () => {
    setLoading(true);
    try {
      const [data] = await Promise.all([fetchStaffRoster(), refreshUser()]);
      setRoster(data);
    } catch {
      setRoster([]);
    } finally {
      setLoading(false);
    }
  }, [refreshUser]);

  useFocusEffect(
    useCallback(() => {
      loadRoster();
    }, [loadRoster]),
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

  const linkedCount = roster.filter((i) => i.staffStatus === 'linked').length;
  const pendingCount = roster.filter((i) => i.staffStatus === 'pending').length;
  const availableCount = roster.filter((i) => i.staffStatus === 'none').length;

  return (
    <Screen
      scroll
      loading={loading && roster.length === 0}
      loadingMessage={LOADING_LABELS.roster}>
      <Text style={[styles.title, { color: colors.text }]}>Equipo</Text>

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Todos los instructores registrados. Invitalos para que acepten y puedan dictar clases
        grupales en tu gimnasio.
      </Text>

      <Text style={[styles.summary, { color: colors.textSecondary }]}>
        {linkedCount} vinculados · {pendingCount} pendientes · {availableCount} sin invitar
      </Text>

      {roster.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Sin instructores registrados"
          description="Cuando haya instructores en la plataforma, podrás invitarlos a tu equipo acá."
        />
      ) : (
        roster.map((instructor) => (
          <StaffInstructorCard
            key={instructor.id}
            instructor={instructor}
            busy={loadingId === instructor.id}
            onInvite={inviteInstructor}
            onCancel={cancelInvite}
            onRemove={removeInstructor}
          />
        ))
      )}

      <LoadingOverlay visible={loadingId !== null} message="Procesando…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.md },
  hint: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.sm },
  summary: { fontSize: 13, marginBottom: Spacing.md },
});
