import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { getLinkedInstructorId } from '@/utils/instructor';

export default function InstructorClassesScreen() {
  const { user } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const { colors } = useAppTheme();
  const instructorId = getLinkedInstructorId(user);
  const mine = getClassesByInstructor(instructorId);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>My classes</Text>
        <Button title="New class" size="sm" onPress={() => router.push('/create-class')} />
      </View>

      {mine.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          No classes yet. Create your first class to open bookings.
        </Text>
      ) : (
        mine.map((c) => <ClassCard key={c.id} item={c} />)
      )}
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
  empty: { fontSize: 15, lineHeight: 22 },
});
