import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileMenuItem } from '@/components/profile/menu-item';
import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

export default function GymProfileScreen() {
  const { user, logout } = useAuth();
  const profile = user?.institutionProfile;

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

  if (!profile) {
    return (
      <Screen>
        <Text>Profile not available</Text>
      </Screen>
    );
  }

  const locationLabel = [profile.address, profile.city].filter(Boolean).join(', ') || 'Not set';

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Gym profile</Text>
        <Pressable onPress={() => router.push('/(gym)/profile/edit')} hitSlop={8}>
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <UserAvatar size={72} kind="institution" uri={user.avatarUri} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          {profile.verified ? (
            <View style={styles.badgeWrap}>
              <Badge label="Verified" variant="verified" />
            </View>
          ) : null}
        </View>
      </View>

      {profile.description ? <Text style={styles.desc}>{profile.description}</Text> : null}

      <ProfileMenuItem
        icon="location-outline"
        label="Location"
        value={locationLabel}
        onPress={() => router.push('/(gym)/profile/edit')}
      />
      <ProfileMenuItem
        icon="ribbon-outline"
        label="Plan & commission"
        value="Institutional · 5%"
        onPress={() => router.push('/(gym)/profile/plan')}
      />
      <ProfileMenuItem
        icon="notifications-outline"
        label="Notifications"
        onPress={() => router.push('/(gym)/profile/notifications')}
      />
      <ProfileMenuItem
        icon="card-outline"
        label="Payout account"
        value={
          user.paymentMethods.length
            ? `${user.paymentMethods.length} saved`
            : 'None added'
        }
        onPress={() => router.push('/(gym)/profile/payment-methods')}
      />
      <ProfileMenuItem
        icon="help-circle-outline"
        label="Help & support"
        onPress={() => router.push('/(gym)/profile/support')}
      />

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
  screenTitle: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900 },
  editLink: { fontSize: 16, fontWeight: '600', color: FitnexiaColors.primary },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  logo: { marginRight: Spacing.md },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: FitnexiaColors.gray900 },
  email: { fontSize: 14, color: FitnexiaColors.gray500, marginTop: 2 },
  badgeWrap: { marginTop: Spacing.sm },
  desc: {
    fontSize: 15,
    color: FitnexiaColors.gray500,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
});
