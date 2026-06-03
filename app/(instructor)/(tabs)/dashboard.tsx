import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { MOCK_CLASSES } from '@/data/mock';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

export default function InstructorDashboard() {
  const { user } = useAuth();
  const todayClasses = MOCK_CLASSES.filter((c) => c.instructor.id === 'inst-1').slice(0, 2);

  return (
    <Screen scroll>
      <Text style={styles.greet}>Hi, {user?.firstName} 👋</Text>
      <Text style={styles.title}>{"Today's overview"}</Text>

      <View style={styles.stats}>
        <StatCard label="Bookings" value="3" icon="calendar" />
        <StatCard label="Revenue" value="$127" icon="cash" />
        <StatCard label="Classes" value="2" icon="fitness" />
      </View>

      <Pressable
        style={styles.availableBtn}
        onPress={() => router.push('/(instructor)/(tabs)/profile')}>
        <Ionicons name="radio-button-on" size={20} color={FitnexiaColors.success} />
        <Text style={styles.availableText}>Available now — tap to toggle</Text>
      </Pressable>

      <View style={styles.row}>
        <Text style={styles.section}>{"Today's classes"}</Text>
        <Button
          title="+ New"
          size="sm"
          onPress={() => router.push('/create-class')}
        />
      </View>

      {todayClasses.length ? (
        todayClasses.map((c) => <ClassCard key={c.id} item={c} />)
      ) : (
        <Text style={styles.empty}>No classes scheduled today</Text>
      )}
    </Screen>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={22} color={FitnexiaColors.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { fontSize: 14, color: FitnexiaColors.gray500 },
  title: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900, marginBottom: Spacing.md },
  stats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    flex: 1,
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: FitnexiaColors.gray900, marginTop: Spacing.sm },
  statLabel: { fontSize: 12, color: FitnexiaColors.gray500 },
  availableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#DCFCE7',
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  availableText: { fontWeight: '600', color: '#166534' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  section: { fontSize: 18, fontWeight: '700' },
  empty: { color: FitnexiaColors.gray500 },
});
