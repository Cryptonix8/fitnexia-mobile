import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileMenuItem } from '@/components/profile/menu-item';
import { CloseAccountButton } from '@/components/profile/close-account-button';
import { SignOutButton } from '@/components/profile/sign-out-button';
import { DarkModeToggle } from '@/components/profile/dark-mode-toggle';
import { UserAvatar } from '@/components/user-avatar';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, NOTIFICATION_LABELS, PROFILE_MENU_LABELS, SCREEN_TITLES, translateDisciplineLabels } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { MOCK_CREDITS } from '@/data/mock';

export default function AthleteProfileScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const showCredits = useFeature('loyaltyCredits');
  const showPaymentMethods = useFeature('savedPaymentMethods');
  const showSupport = useFeature('platformSupport');
  const showCourts = useFeature('courts');
  const credits = MOCK_CREDITS;

  const favoriteSportsLabel =
    user?.favoriteSports.length
      ? translateDisciplineLabels(user.favoriteSports).join(', ')
      : 'Ninguno seleccionado';

  return (
    <Screen
      scroll
      header={
        <View style={styles.headerRow}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>{SCREEN_TITLES.profile}</Text>
          <Pressable onPress={() => router.push('/(athlete)/profile/edit')} hitSlop={8}>
            <Text style={[styles.editLink, { color: colors.primary }]}>{BUTTON_LABELS.edit}</Text>
          </Pressable>
        </View>
      }>
      <View style={styles.header}>
        <UserAvatar size={72} kind="user" uri={user?.avatarUri} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>{user?.email}</Text>
        </View>
      </View>

      {showCredits ? (
        <View style={[styles.creditsCard, { backgroundColor: colors.surface }]}>
          <View style={styles.creditsTop}>
            <Ionicons name="gift" size={24} color={colors.primary} />
            <Text style={[styles.creditsTitle, { color: colors.text }]}>Créditos de fidelidad</Text>
          </View>
          <Text style={[styles.creditsBalance, { color: colors.primary }]}>
            {credits.balance} <Text style={{ color: colors.textMuted }}>/ 10</Text>
          </Text>
          <View style={[styles.progressBg, { backgroundColor: colors.surfaceMuted }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${(credits.balance / 10) * 100}%`, backgroundColor: colors.primary },
              ]}
            />
          </View>
          <Text style={[styles.creditsHint, { color: colors.textMuted }]}>
            {credits.creditsUntilReward} más para una clase gratis (hasta 1.500 UYU)
          </Text>
        </View>
      ) : null}

      <DarkModeToggle />

      <ProfileMenuItem
        icon="heart-outline"
        label={PROFILE_MENU_LABELS.favoriteSports}
        value={favoriteSportsLabel}
        onPress={() => router.push('/(athlete)/profile/favorite-sports')}
      />
      {useFeature('clubMemberships') ? (
        <ProfileMenuItem
          icon="card-outline"
          label={PROFILE_MENU_LABELS.clubMembership}
          onPress={() => router.push('/membership')}
        />
      ) : null}
      {showCourts ? (
        <ProfileMenuItem
          icon="football-outline"
          label="Reservas de canchas"
          onPress={() => router.push('/(athlete)/courts/reservations')}
        />
      ) : null}
      <ProfileMenuItem
        icon="notifications-outline"
        label={PROFILE_MENU_LABELS.notifications}
        onPress={() => router.push('/(athlete)/notifications')}
      />
      <ProfileMenuItem
        icon="options-outline"
        label={NOTIFICATION_LABELS.preferencesTitle}
        onPress={() => router.push('/(athlete)/profile/notifications')}
      />
      {showPaymentMethods ? (
        <ProfileMenuItem
          icon="card-outline"
          label={PROFILE_MENU_LABELS.paymentMethods}
          value={
            user?.paymentMethods.length
              ? `${user.paymentMethods.length} guardados`
              : 'Ninguno agregado'
          }
          onPress={() => router.push('/(athlete)/profile/payment-methods')}
        />
      ) : null}
      {showSupport ? (
        <ProfileMenuItem
          icon="help-circle-outline"
          label={PROFILE_MENU_LABELS.helpSupport}
          onPress={() => router.push('/(athlete)/profile/support')}
        />
      ) : null}

      <SignOutButton />
      <CloseAccountButton />
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { marginRight: Spacing.md },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800' },
  email: { fontSize: 14, marginTop: 2 },
  creditsCard: {
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  creditsTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  creditsTitle: { fontSize: 16, fontWeight: '700' },
  creditsBalance: { fontSize: 36, fontWeight: '800', marginTop: Spacing.sm },
  progressBg: {
    height: 8,
    borderRadius: 4,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%' },
  creditsHint: { fontSize: 13, marginTop: Spacing.sm },
});
