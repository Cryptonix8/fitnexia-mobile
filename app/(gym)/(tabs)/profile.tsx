import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { DarkModeToggle } from '@/components/profile/dark-mode-toggle';
import { ProfileMenuItem } from '@/components/profile/menu-item';
import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { MOCK_INSTRUCTORS } from '@/data/mock';
import { isFeatureEnabled } from '@/constants/features';
import { Radius, Spacing } from '@/constants/fitnexia';

export default function GymProfileScreen() {
  const { user, logout } = useAuth();
  const { colors } = useAppTheme();
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

  const showPayments = isFeatureEnabled('integratedPayments');
  const showSupport = isFeatureEnabled('platformSupport');
  const locationLabel = [profile.address, profile.city].filter(Boolean).join(', ') || 'Not set';
  const gallery = profile.gallery ?? [];
  const instructorIds = profile.instructorIds ?? [];
  const linkedInstructors = instructorIds
    .map((id) => MOCK_INSTRUCTORS.find((i) => i.id === id))
    .filter((i): i is (typeof MOCK_INSTRUCTORS)[number] => Boolean(i));

  return (
    <Screen scroll>
      <View style={styles.headerRow}>
        <Text style={[styles.screenTitle, { color: colors.text }]}>Gym profile</Text>
        <Pressable onPress={() => router.push('/(gym)/profile/edit')} hitSlop={8}>
          <Text style={[styles.editLink, { color: colors.primary }]}>Edit</Text>
        </Pressable>
      </View>

      <View style={styles.header}>
        <UserAvatar size={72} kind="institution" uri={user.avatarUri} style={styles.logo} />
        <View style={styles.headerText}>
          <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
          <Text style={[styles.email, { color: colors.textMuted }]}>{user.email}</Text>
          {profile.verified ? (
            <View style={styles.badgeWrap}>
              <Badge label="Verified" variant="verified" />
            </View>
          ) : null}
        </View>
      </View>

      {profile.description ? (
        <Text style={[styles.desc, { color: colors.textMuted }]}>{profile.description}</Text>
      ) : null}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Photo gallery</Text>
        <Pressable onPress={() => router.push('/(gym)/profile/gallery')} hitSlop={8}>
          <Text style={[styles.sectionLink, { color: colors.primary }]}>Manage</Text>
        </Pressable>
      </View>
      {gallery.length === 0 ? (
        <Pressable
          style={[styles.galleryEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/(gym)/profile/gallery')}>
          <Ionicons name="images-outline" size={28} color={colors.textMuted} />
          <Text style={[styles.galleryEmptyText, { color: colors.textMuted }]}>
            Add photos of your facility
          </Text>
        </Pressable>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryRow}>
          {gallery.map((uri, index) => (
            <Image
              key={`${uri}-${index}`}
              source={{ uri }}
              style={styles.galleryThumb}
              contentFit="cover"
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Instructors</Text>
        <Pressable onPress={() => router.push('/(gym)/profile/instructors')} hitSlop={8}>
          <Text style={[styles.sectionLink, { color: colors.primary }]}>Manage</Text>
        </Pressable>
      </View>
      {linkedInstructors.length === 0 ? (
        <Pressable
          style={[styles.galleryEmpty, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => router.push('/(gym)/profile/instructors')}>
          <Ionicons name="people-outline" size={28} color={colors.textMuted} />
          <Text style={[styles.galleryEmptyText, { color: colors.textMuted }]}>
            Link instructors to your gym
          </Text>
        </Pressable>
      ) : (
        linkedInstructors.map((i) => (
          <Pressable
            key={i.id}
            style={[styles.instructorRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => router.push(`/instructor/${i.id}`)}>
            <UserAvatar size={44} kind="instructor" />
            <View style={styles.instructorBody}>
              <Text style={[styles.instructorName, { color: colors.text }]}>{i.displayName}</Text>
              <Text style={[styles.instructorMeta, { color: colors.textMuted }]}>
                {i.disciplines.join(' · ')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        ))
      )}

      <DarkModeToggle />

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
      {showPayments ? (
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
      ) : null}
      {showSupport ? (
        <ProfileMenuItem
          icon="help-circle-outline"
          label="Help & support"
          onPress={() => router.push('/(gym)/profile/support')}
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
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  logo: { marginRight: Spacing.md },
  headerText: { flex: 1 },
  name: { fontSize: 22, fontWeight: '800' },
  email: { fontSize: 14, marginTop: 2 },
  badgeWrap: { marginTop: Spacing.sm },
  desc: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
  sectionLink: { fontSize: 14, fontWeight: '600' },
  galleryEmpty: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  galleryEmptyText: { fontSize: 14 },
  galleryRow: { marginBottom: Spacing.md },
  galleryThumb: {
    width: 120,
    height: 90,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
  },
  instructorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  instructorBody: { flex: 1 },
  instructorName: { fontSize: 16, fontWeight: '700' },
  instructorMeta: { fontSize: 13, marginTop: 2 },
});
