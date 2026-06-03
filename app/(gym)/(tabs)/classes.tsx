import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useClasses } from '@/contexts/classes-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

export default function GymClassesScreen() {
  const { classes } = useClasses();
  const gymClasses = classes.filter((c) => c.institution);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={styles.title}>Group classes</Text>
        <Button title="New" size="sm" onPress={() => router.push('/create-class')} />
      </View>
      {gymClasses.map((c) => (
        <ClassCard key={c.id} item={c} />
      ))}
      {gymClasses.length === 0 ? (
        <Text style={styles.empty}>Create a group class with capacity limits.</Text>
      ) : null}
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
  empty: { color: FitnexiaColors.gray500, textAlign: 'center', marginTop: Spacing.xl },
});
