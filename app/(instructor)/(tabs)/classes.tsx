import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { MOCK_CLASSES } from '@/data/mock';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

export default function InstructorClassesScreen() {
  const mine = MOCK_CLASSES.filter((c) => c.instructor.id === 'inst-1' || c.instructor.id === 'inst-3');

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>My classes</Text>
        <Button title="New class" size="sm" onPress={() => router.push('/create-class')} />
      </View>
      {mine.map((c) => (
        <ClassCard key={c.id} item={c} />
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
  title: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900 },
});
