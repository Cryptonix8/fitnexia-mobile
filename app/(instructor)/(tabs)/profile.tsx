import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_INSTRUCTORS } from '@/data/mock';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

export default function InstructorProfileScreen() {
  const { logout } = useAuth();
  const profile = MOCK_INSTRUCTORS[0];
  const [availableNow, setAvailableNow] = useState(profile.availableNow);

  return (
    <Screen scroll>
      <Text style={styles.title}>Professional profile</Text>
      <View style={styles.hero}>
        <UserAvatar size={72} kind="instructor" style={styles.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile.displayName}</Text>
          {profile.verified ? <Badge label="Verified" variant="verified" /> : null}
        </View>
      </View>

      <Pressable
        style={[styles.toggle, availableNow && styles.toggleOn]}
        onPress={() => setAvailableNow(!availableNow)}>
        <Ionicons
          name={availableNow ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color={availableNow ? FitnexiaColors.success : FitnexiaColors.gray400}
        />
        <Text style={styles.toggleText}>Available now</Text>
      </Pressable>

      <Input label="Bio" value={profile.bio} multiline />
      <Input label="Disciplines" value={profile.disciplines.join(', ')} />
      <Button title="Save changes" onPress={() => Alert.alert('Saved', 'Profile updated (mock).')} />

      <Button
        title="Sign out"
        variant="outline"
        onPress={() => {
          logout();
          router.replace('/(auth)/login');
        }}
        style={{ marginTop: Spacing.lg }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.md },
  hero: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  avatar: {},
  name: { fontSize: 20, fontWeight: '700' },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: FitnexiaColors.white,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.lg,
  },
  toggleOn: { backgroundColor: '#DCFCE7' },
  toggleText: { fontSize: 16, fontWeight: '600' },
});
