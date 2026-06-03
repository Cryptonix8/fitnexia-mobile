import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_CREDITS } from '@/data/mock';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

export default function AthleteProfileScreen() {
  const { user, logout } = useAuth();
  const credits = MOCK_CREDITS;

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
        <Text style={styles.screenTitle}>Profile</Text>
        <Pressable onPress={() => router.push('/(athlete)/profile/edit')} hitSlop={8}>
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <UserAvatar size={72} kind="user" uri={user?.avatarUri} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.creditsCard}>
        <View style={styles.creditsTop}>
          <Ionicons name="gift" size={24} color={FitnexiaColors.primary} />
          <Text style={styles.creditsTitle}>Loyalty credits</Text>
        </View>
        <Text style={styles.creditsBalance}>
          {credits.balance} <Text style={styles.creditsOf}>/ 10</Text>
        </Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${(credits.balance / 10) * 100}%` }]} />
        </View>
        <Text style={styles.creditsHint}>
          {credits.creditsUntilReward} more for a free class (up to $30)
        </Text>
      </View>

      <MenuItem
        icon="heart-outline"
        label="Favorite sports"
        value={favoriteSportsLabel}
        onPress={() => router.push('/(athlete)/profile/favorite-sports')}
      />
      <MenuItem
        icon="notifications-outline"
        label="Notifications"
        onPress={() => router.push('/(athlete)/profile/notifications')}
      />
      <MenuItem
        icon="card-outline"
        label="Payment methods"
        value={
          user?.paymentMethods.length
            ? `${user.paymentMethods.length} saved`
            : 'None added'
        }
        onPress={() => router.push('/(athlete)/profile/payment-methods')}
      />
      <MenuItem
        icon="help-circle-outline"
        label="Help & support"
        onPress={() => router.push('/(athlete)/profile/support')}
      />

      <Button title="Sign out" variant="outline" onPress={signOut} style={{ marginTop: Spacing.lg }} />
    </Screen>
  );
}

function MenuItem({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={22} color={FitnexiaColors.gray700} />
      <Text style={styles.menuLabel}>{label}</Text>
      {value ? (
        <Text style={styles.menuValue} numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      <Ionicons name="chevron-forward" size={20} color={FitnexiaColors.gray400} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  screenTitle: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900 },
  editLink: { fontSize: 16, fontWeight: '600', color: FitnexiaColors.primary },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  avatar: { marginRight: Spacing.md },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: FitnexiaColors.gray900 },
  email: { fontSize: 14, color: FitnexiaColors.gray500, marginTop: 2 },
  creditsCard: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  creditsTop: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  creditsTitle: { fontSize: 16, fontWeight: '700', color: FitnexiaColors.gray900 },
  creditsBalance: { fontSize: 36, fontWeight: '800', color: FitnexiaColors.primary, marginTop: Spacing.sm },
  creditsOf: { fontSize: 20, color: FitnexiaColors.gray400 },
  progressBg: {
    height: 8,
    backgroundColor: FitnexiaColors.gray100,
    borderRadius: 4,
    marginTop: Spacing.sm,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: FitnexiaColors.primary },
  creditsHint: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: Spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  menuLabel: { flex: 1, fontSize: 16, color: FitnexiaColors.gray900 },
  menuValue: { fontSize: 13, color: FitnexiaColors.gray500, maxWidth: 120 },
});
