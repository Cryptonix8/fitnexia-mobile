import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { computeClassBooked, getGymClasses, resolveInstitutionId } from '@/utils/gym-classes';

export default function GymClassesScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { classes } = useClasses();
  const institutionId = resolveInstitutionId(user);
  const gymClasses = getGymClasses(institutionId, classes);

  return (
    <Screen scroll>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Group classes</Text>
        <Button title="New" size="sm" onPress={() => router.push('/create-class')} />
      </View>

      {gymClasses.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>
          Create a group class with capacity limits and assign an instructor.
        </Text>
      ) : (
        gymClasses.map((c) => {
          const booked = computeClassBooked(c);
          const cap = c.capacity ?? 0;
          return (
            <View key={c.id} style={styles.cardWrap}>
              <ClassCard item={c} />
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {c.instructor.displayName} · {booked}/{cap} booked
                </Text>
                <Button
                  title="Edit"
                  size="sm"
                  variant="outline"
                  onPress={() =>
                    router.push({ pathname: '/edit-class/[id]', params: { id: c.id } })
                  }
                />
              </View>
            </View>
          );
        })
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
  empty: { fontSize: 15, lineHeight: 22, textAlign: 'center', marginTop: Spacing.xl },
  cardWrap: { marginBottom: Spacing.xs },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.xs,
  },
  meta: { fontSize: 13, flex: 1 },
});
