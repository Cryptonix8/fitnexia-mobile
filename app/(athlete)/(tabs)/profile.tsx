import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileMenuItem } from '@/components/profile/menu-item';
import { DarkModeToggle } from '@/components/profile/dark-mode-toggle';
import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { isFeatureEnabled } from '@/constants/features';
import { Radius, Spacing } from '@/constants/fitnexia';

export default function AthleteProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();
  const showCredits = isFeatureEnabled('loyaltyCredits');
  const showPayments = isFeatureEnabled('integratedPayments');
  const showSupport = isFeatureEnabled('platformSupport');

  const favoriteSportsLabel =
    user?.favoriteSports.length ? user.favoriteSports.join(', ') : 'None selected';

  const signOut = () => {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Profile</Text>
        <Pressable onPress={() => router.push('/(athlete)/profile/edit')} hitSlop={8}>
          <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
        </Pressable>
      </View>

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
            <Text style={[styles.creditsTitle, { color: colors.text }]}>Loyalty credits</Text>
          </View>
          <Text style={[styles.creditsHint, { color: colors.textMuted }]}>
            Loyalty program coming in a future update.
          </Text>
        </View>
      ) : null}

      <DarkModeToggle />

      <ProfileMenuItem
        icon="heart-outline"
        label="Favorite sports"
        value={favoriteSportsLabel}
        onPress={() => router.push('/(athlete)/profile/favorite-sports')}
      />
      <ProfileMenuItem
        icon="notifications-outline"
        label="Notifications"
        onPress={() => router.push('/(athlete)/profile/notifications')}
      />
      {showPayments ? (
        <ProfileMenuItem
          icon="card-outline"
          label="Payment methods"
          value={
            user?.paymentMethods.length
              ? `${user.paymentMethods.length} saved`
              : 'None added'
          }
          onPress={() => router.push('/(athlete)/profile/payment-methods')}
        />
      ) : null}
      {showSupport ? (
        <ProfileMenuItem
          icon="help-circle-outline"
          label="Help & support"
          onPress={() => router.push('/(athlete)/profile/support')}
        />
      ) : null}

      <Button title="Sign out" variant="outline" onPress={signOut} style={{ marginTop: Spacing.lg }} />
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
