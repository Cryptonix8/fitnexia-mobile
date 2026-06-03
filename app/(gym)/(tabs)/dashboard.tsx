import { StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Screen } from '@/components/ui/screen';
import { MOCK_INSTITUTIONS } from '@/data/mock';
import { useClasses } from '@/contexts/classes-context';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

export default function GymDashboardScreen() {
  const { classes } = useClasses();
  const gym = MOCK_INSTITUTIONS[0];
  const gymClasses = classes.filter((c) => c.institution?.id === gym.id);

  return (
    <Screen scroll>
      <Text style={styles.greet}>{gym.name}</Text>
      <Text style={styles.title}>Control panel</Text>

      <View style={styles.stats}>
        <MiniStat label="Bookings today" value="12" />
        <MiniStat label="Revenue (week)" value="$2.4k" />
        <MiniStat label="Occupancy" value="78%" />
      </View>

      <Text style={styles.section}>Group classes</Text>
      {gymClasses.length ? (
        gymClasses.map((c) => <ClassCard key={c.id} item={c} />)
      ) : (
        <Text style={styles.empty}>No group classes yet</Text>
      )}
    </Screen>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { fontSize: 14, color: FitnexiaColors.gray500 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.md },
  stats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  stat: {
    flex: 1,
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  statValue: { fontSize: 18, fontWeight: '800', color: FitnexiaColors.primary },
  statLabel: { fontSize: 11, color: FitnexiaColors.gray500, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  empty: { color: FitnexiaColors.gray500 },
});
