import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
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
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const loadRoster = useCallback(async () => {
    try {
      const [data] = await Promise.all([fetchStaffRoster(), refreshUser()]);
      setRoster(data);
    } catch {
      setRoster([]);
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
      const result = await inviteInstructorApi({ instructorId: instructor.id });
      await loadRoster();
      if (result.emailSent) {
        Alert.alert(
          'Invitación enviada',
          `Invitamos a ${instructor.displayName}. Verán la invitación en su app y por email.`,
        );
      } else {
        Alert.alert(
          'Invitación guardada',
          `Invitamos a ${instructor.displayName}. Verán la invitación al iniciar sesión en la app.`,
        );
      }
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

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Equipo</Text>
        <Pressable
          style={[styles.headerAction, { backgroundColor: colors.primaryMuted }]}
          onPress={() => router.push('/(gym)/profile/invite-instructor')}>
          <Text style={[styles.headerActionText, { color: colors.primaryText }]}>Por email</Text>
        </Pressable>
      </View>

      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Todos los instructores registrados. Invitalos para que acepten y puedan dictar clases
        grupales en tu gimnasio.
      </Text>

      <Text style={[styles.summary, { color: colors.textSecondary }]}>
        {linkedCount} vinculados · {pendingCount} pendientes · {roster.length} en total
      </Text>

      {roster.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          Todavía no hay instructores registrados en la plataforma.
        </Text>
      ) : (
        roster.map((instructor) => {
          const busy = loadingId === instructor.id;
          const hasStaffReview = Boolean(instructor.staffReview);
          const canReview = instructor.canLeaveStaffReview;
          const reviewPendingClass =
            instructor.staffStatus === 'linked' &&
            !hasStaffReview &&
            !instructor.hasCompletedClass;

          return (
            <View
              key={instructor.id}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Pressable
                style={styles.cardMain}
                onPress={() => router.push(`/instructor/${instructor.id}`)}>
                <UserAvatar size={44} kind="instructor" uri={instructor.photoUrl} />
                <View style={styles.cardBody}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
                    {instructor.staffStatus === 'linked' ? (
                      <View style={[styles.badge, { backgroundColor: colors.successMuted }]}>
                        <Text style={[styles.badgeText, { color: colors.success }]}>Vinculado</Text>
                      </View>
                    ) : instructor.staffStatus === 'pending' ? (
                      <View style={[styles.badge, { backgroundColor: colors.warningMuted }]}>
                        <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Pendiente</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
                    {instructor.disciplines.join(', ') || 'Sin disciplinas'}
                  </Text>
                  <StarRating
                    rating={instructor.averageRating}
                    reviewCount={instructor.reviewCount}
                    size={14}
                  />
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </Pressable>

              <View style={[styles.cardFooter, { borderTopColor: colors.border }]}>
                {instructor.staffStatus === 'linked' ? (
                  <>
                    {hasStaffReview || canReview ? (
                      <Pressable
                        style={[
                          styles.reviewChip,
                          hasStaffReview
                            ? { backgroundColor: colors.surface, borderColor: colors.border }
                            : { backgroundColor: colors.primaryMuted, borderColor: colors.primary },
                        ]}
                        onPress={() =>
                          router.push({
                            pathname: '/(gym)/review-instructor/[id]',
                            params: { id: instructor.id },
                          })
                        }>
                        <Ionicons
                          name={hasStaffReview ? 'document-text-outline' : 'create-outline'}
                          size={15}
                          color={hasStaffReview ? colors.textSecondary : colors.primary}
                        />
                        <Text
                          style={[
                            styles.reviewChipText,
                            { color: hasStaffReview ? colors.textSecondary : colors.primary },
                          ]}>
                          {hasStaffReview ? 'Ver reseña' : 'Dejar reseña'}
                        </Text>
                      </Pressable>
                    ) : reviewPendingClass ? (
                      <Text style={[styles.reviewHint, { color: colors.textMuted }]}>
                        Reseña disponible después de una clase
                      </Text>
                    ) : null}
                    <Button
                      title="Desvincular"
                      size="sm"
                      variant="outline"
                      loading={busy}
                      onPress={() => removeInstructor(instructor)}
                    />
                  </>
                ) : instructor.staffStatus === 'pending' ? (
                  <Button
                    title="Cancelar"
                    size="sm"
                    variant="outline"
                    loading={busy}
                    onPress={() => cancelInvite(instructor)}
                  />
                ) : (
                  <Button
                    title="Invitar"
                    size="sm"
                    loading={busy}
                    onPress={() => inviteInstructor(instructor)}
                  />
                )}
              </View>
            </View>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: { fontSize: 26, fontWeight: '800' },
  headerAction: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
  },
  headerActionText: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 15, lineHeight: 22, marginBottom: Spacing.sm },
  summary: { fontSize: 13, marginBottom: Spacing.md },
  empty: { fontSize: 15, lineHeight: 22 },
  card: {
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  cardBody: { flex: 1, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  name: { fontWeight: '700', fontSize: 16 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  meta: { fontSize: 13, marginTop: 2 },
  reviewHint: { flex: 1, fontSize: 12, lineHeight: 16, marginRight: Spacing.sm },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    paddingTop: Spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  reviewChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: 'auto',
  },
  reviewChipText: { fontSize: 13, fontWeight: '600' },
});
