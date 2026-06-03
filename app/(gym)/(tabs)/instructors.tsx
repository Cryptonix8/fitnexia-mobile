import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { MOCK_INSTRUCTORS } from '@/data/mock';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

export default function GymInstructorsScreen() {
  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Instructors</Text>
        <Button
          title="Invite"
          size="sm"
          onPress={() => Alert.alert('Invite', 'Email invite flow (mock).')}
        />
      </View>

      {MOCK_INSTRUCTORS.map((i) => (
        <View key={i.id} style={styles.card}>
          <UserAvatar size={48} kind="instructor" />
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{i.displayName}</Text>
            <Text style={styles.meta}>{i.disciplines.join(', ')}</Text>
          </View>
          <Pressable onPress={() => Alert.alert('Unlink', `Remove ${i.displayName}?`)}>
            <Ionicons name="ellipsis-horizontal" size={22} color={FitnexiaColors.gray500} />
          </Pressable>
        </View>
      ))}
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  name: { fontWeight: '700', fontSize: 16 },
  meta: { fontSize: 13, color: FitnexiaColors.gray500, marginTop: 2 },
});
