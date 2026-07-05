import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { DarkModeToggle } from '@/components/profile/dark-mode-toggle';
import { CloseAccountButton } from '@/components/profile/close-account-button';
import { SignOutButton } from '@/components/profile/sign-out-button';
import { ProfileMenuItem } from '@/components/profile/menu-item';
import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { BADGE_LABELS, BUTTON_LABELS, LOADING_LABELS, PROFILE_MENU_LABELS, SCREEN_TITLES, VERIFICATION_LABELS, formatUserPlanSummary, translateDisciplineLabels } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { formatWeeklyScheduleSummary, defaultWeeklySchedule } from '@/utils/schedule';

export default function InstructorProfileScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useAppTheme();
  const showSupport = useFeature('platformSupport');
  const showPayoutAccount = useFeature('marketplacePayouts') || useFeature('integratedPayments');
  const showReviewResponses = useFeature('reviewResponses');
  const profile = user?.instructorProfile;
  const [togglingAvailable, setTogglingAvailable] = useState(false);

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

  if (!profile) {
    return (
      <Screen>
        <Text>Perfil no disponible</Text>
      </Screen>
    );
  }

  const disciplinesLabel =
    profile.disciplines.length > 0
      ? translateDisciplineLabels(profile.disciplines).join(', ')
      : 'Ninguna seleccionada';
  const certificationsLabel =
    (profile.certifications?.length ?? 0) > 0
      ? `${profile.certifications!.length} agregadas`
      : 'Ninguna agregada';
  const scheduleLabel = formatWeeklyScheduleSummary(
    profile.weeklySchedule ?? defaultWeeklySchedule(),
  );

  return (
    <Screen
      scroll
      header={
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>{SCREEN_TITLES.profile}</Text>
          <Pressable onPress={() => router.push('/(instructor)/profile/edit')} hitSlop={8}>
            <Text style={[styles.editLink, { color: colors.primary }]}>{BUTTON_LABELS.edit}</Text>
          </Pressable>
        </View>
      }>
      <View style={styles.header}>
        <UserAvatar size={72} kind="instructor" uri={user.avatarUri} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]}>{profile.displayName}</Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>
          <View style={styles.badges}>
            {profile.verificationStatus === 'verified' || profile.verified ? (
              <Badge label={BADGE_LABELS.verified} variant="verified" />
            ) : null}
            {profile.verificationStatus === 'pending' ? (
              <Badge label={VERIFICATION_LABELS.pendingBadge} variant="warning" />
            ) : null}
            {profile.availableNow ? <Badge label={BADGE_LABELS.availableNow} variant="success" /> : null}
          </View>
        </View>
      </View>

      <Pressable
        style={[
          styles.availableBtn,
          { backgroundColor: profile.availableNow ? colors.successMuted : colors.surface },
        ]}
        disabled={togglingAvailable}
        onPress={() => void toggleAvailable()}>
        <Ionicons
          name={profile.availableNow ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={profile.availableNow ? colors.success : colors.textMuted}
        />
        <Text style={[styles.availableText, { color: colors.textSecondary }]}>
          {profile.availableNow ? 'Disponible ahora — tocá para desactivar' : 'Marcar como disponible ahora'}
        </Text>
      </Pressable>

      {profile.bio ? (
        <Text style={[styles.bio, { color: colors.textMuted }]}>{profile.bio}</Text>
      ) : null}

      <DarkModeToggle />

      <ProfileMenuItem
        icon="calendar-outline"
        label={PROFILE_MENU_LABELS.scheduleAvailability}
        value={scheduleLabel}
        onPress={() => router.push('/(instructor)/profile/availability')}
      />
      <ProfileMenuItem
        icon="school-outline"
        label={PROFILE_MENU_LABELS.certifications}
        value={certificationsLabel}
        onPress={() => router.push('/(instructor)/profile/certifications')}
      />
      <ProfileMenuItem
        icon="fitness-outline"
        label={PROFILE_MENU_LABELS.disciplines}
        value={disciplinesLabel}
        onPress={() => router.push('/(instructor)/profile/edit')}
      />
      <ProfileMenuItem
        icon="briefcase-outline"
        label="Bolsa de trabajo"
        onPress={() => router.push('/(instructor)/jobs')}
      />
      <ProfileMenuItem
        icon="shield-checkmark-outline"
        label={VERIFICATION_LABELS.screenTitle}
        value={
          profile.verificationStatus === 'verified'
            ? BADGE_LABELS.verified
            : profile.verificationStatus === 'pending'
              ? VERIFICATION_LABELS.pendingBadge
              : VERIFICATION_LABELS.cta
        }
        onPress={() => router.push('/(instructor)/profile/verify')}
      />
      <ProfileMenuItem
        icon="ribbon-outline"
        label={PROFILE_MENU_LABELS.planCommission}
        value={formatUserPlanSummary(profile.plan)}
        onPress={() => router.push('/(instructor)/profile/plan')}
      />
      {showReviewResponses ? (
        <ProfileMenuItem
          icon="chatbubble-ellipses-outline"
          label="Responder reseñas"
          onPress={() => router.push('/(instructor)/profile/reviews')}
        />
      ) : null}
      <ProfileMenuItem
        icon="notifications-outline"
        label={PROFILE_MENU_LABELS.notifications}
        onPress={() => router.push('/(instructor)/profile/notifications')}
      />
      {showPayoutAccount ? (
        <ProfileMenuItem
          icon="wallet-outline"
          label={PROFILE_MENU_LABELS.payoutAccount}
          value="Mercado Pago"
          onPress={() => router.push('/(instructor)/profile/payment-methods')}
        />
      ) : null}
      {showSupport ? (
        <ProfileMenuItem
          icon="help-circle-outline"
          label={PROFILE_MENU_LABELS.helpSupport}
          onPress={() => router.push('/(instructor)/profile/support')}
        />
      ) : null}

      <SignOutButton />
      <CloseAccountButton />

      <LoadingOverlay visible={togglingAvailable} message={LOADING_LABELS.availability} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  screenTitle: { fontSize: 26, fontWeight: '800' },
  editLink: { fontSize: 16, fontWeight: '600' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  avatar: { marginRight: Spacing.md },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800' },
  email: { fontSize: 14, marginTop: 2 },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  availableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  availableText: { flex: 1, fontSize: 15, fontWeight: '600' },
  bio: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
});
