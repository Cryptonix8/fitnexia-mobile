import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, LOADING_LABELS } from '@/constants/labels';
import { computeClassBooked, getGymClasses, resolveInstitutionId } from '@/utils/gym-classes';

export default function GymClassesScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const { classes, isLoading } = useClasses();
  const institutionId = resolveInstitutionId(user);
  const gymClasses = getGymClasses(institutionId, classes);

  return (
    <Screen
      scroll
      loading={isLoading && gymClasses.length === 0}
      loadingMessage={LOADING_LABELS.classes}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Clases grupales</Text>
        <Button title="Nueva" size="sm" onPress={() => router.push('/create-class')} />
      </View>

      {gymClasses.length === 0 ? (
        <EmptyState
          icon="people-outline"
          title="Sin clases grupales"
          description="Creá una clase grupal con cupos limitados y asigná un instructor."
        />
      ) : (
        gymClasses.map((c) => {
          const booked = computeClassBooked(c);
          const cap = c.capacity ?? 0;
          return (
            <View key={c.id} style={styles.cardWrap}>
              <ClassCard item={c} institutionLogoUri={user?.avatarUri} />
              <View style={styles.metaRow}>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {c.instructor.displayName} · {booked}/{cap} reservados
                </Text>
                <Button
                  title={BUTTON_LABELS.edit}
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
