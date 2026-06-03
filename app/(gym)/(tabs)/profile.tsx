import { router } from 'expo-router';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_INSTITUTIONS } from '@/data/mock';
import { Spacing } from '@/constants/fitnexia';

export default function GymProfileScreen() {
  const { logout } = useAuth();
  const gym = MOCK_INSTITUTIONS[0];

  return (
    <Screen scroll>
      <Text style={styles.title}>Institution profile</Text>
      <View style={styles.hero}>
        <UserAvatar size={64} kind="institution" style={styles.logo} />
        <View>
          <Text style={styles.name}>{gym.name}</Text>
          {gym.verified ? <Badge label="Verified" variant="verified" /> : null}
        </View>
      </View>

      <Input label="Description" value={gym.description} multiline />
      <Input
        label="Address"
        value={gym.location ? `${gym.location.address}, ${gym.location.city}` : ''}
      />

      <Button title="Save" onPress={() => Alert.alert('Saved', 'Institution profile (mock).')} />
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
  logo: {},
  name: { fontSize: 20, fontWeight: '700' },
});
