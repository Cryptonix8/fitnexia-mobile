import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { ProfileMenuItem } from '@/components/profile/menu-item';
import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

export default function InstructorProfileScreen() {
  const { user, logout, updateProfile } = useAuth();
  const profile = user?.instructorProfile;

  const toggleAvailable = () => {
    if (!profile) return;
    updateProfile({ instructorProfile: { availableNow: !profile.availableNow } });
  };

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

  const disciplinesLabel =
    profile.disciplines.length > 0 ? profile.disciplines.join(', ') : 'None selected';

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Text style={styles.screenTitle}>Profile</Text>
        <Pressable onPress={() => router.push('/(instructor)/profile/edit')} hitSlop={8}>
          <Text style={styles.editLink}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <UserAvatar size={72} kind="instructor" uri={user.avatarUri} style={styles.avatar} />
        <View style={styles.headerText}>
          <Text style={styles.name}>{profile.displayName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.badges}>
            {profile.verified ? <Badge label="Verified" variant="verified" /> : null}
            {profile.availableNow ? <Badge label="Available now" variant="success" /> : null}
          </View>
        </View>
      </View>

      <Pressable
        style={[styles.availableBtn, profile.availableNow && styles.availableOn]}
        onPress={toggleAvailable}>
        <Ionicons
          name={profile.availableNow ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={profile.availableNow ? FitnexiaColors.success : FitnexiaColors.gray400}
        />
        <Text style={styles.availableText}>
          {profile.availableNow ? 'Available now — tap to turn off' : 'Mark as available now'}
        </Text>
      </Pressable>

      {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

      <ProfileMenuItem
        icon="fitness-outline"
        label="Disciplines"
        value={disciplinesLabel}
        onPress={() => router.push('/(instructor)/profile/edit')}
      />
      <ProfileMenuItem
        icon="ribbon-outline"
        label="Plan & commission"
        value="Pro · 8%"
        onPress={() => router.push('/(instructor)/profile/plan')}
      />
      <ProfileMenuItem
        icon="notifications-outline"
        label="Notifications"
        onPress={() => router.push('/(instructor)/profile/notifications')}
      />
      <ProfileMenuItem
        icon="card-outline"
        label="Payout account"
        value={
          user.paymentMethods.length
            ? `${user.paymentMethods.length} saved`
            : 'None added'
        }
        onPress={() => router.push('/(instructor)/profile/payment-methods')}
      />
      <ProfileMenuItem
        icon="help-circle-outline"
        label="Help & support"
        onPress={() => router.push('/(instructor)/profile/support')}
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
  avatar: { marginRight: Spacing.md },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800', color: FitnexiaColors.gray900 },
  email: { fontSize: 14, color: FitnexiaColors.gray500, marginTop: 2 },
  badges: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm, flexWrap: 'wrap' },
  availableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: FitnexiaColors.white,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  availableOn: { backgroundColor: '#DCFCE7' },
  availableText: { flex: 1, fontSize: 15, fontWeight: '600', color: FitnexiaColors.gray700 },
  bio: {
    fontSize: 15,
    color: FitnexiaColors.gray500,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
});
