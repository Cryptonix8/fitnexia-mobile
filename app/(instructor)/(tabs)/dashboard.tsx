import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { getLinkedInstructorId } from '@/utils/instructor';
import { computeInstructorTodayStats } from '@/utils/instructor-metrics';
import { formatRevenueCompact } from '@/utils/gym-metrics';
import { isSameCalendarDay } from '@/utils/schedule';

export default function InstructorDashboard() {
  const { user, updateProfile } = useAuth();
  const { getClassesByInstructor } = useClasses();
  const { colors } = useAppTheme();
  const profile = user?.instructorProfile;
  const instructorId = getLinkedInstructorId(user);
  const allClasses = getClassesByInstructor(instructorId);
  const today = new Date();
  const todayClasses = allClasses.filter((c) => isSameCalendarDay(new Date(c.startAt), today));
  const todayStats = computeInstructorTodayStats(todayClasses);

  const toggleAvailable = () => {
    if (!profile) return;
    updateProfile({ instructorProfile: { availableNow: !profile.availableNow } });
  };

  return (
    <Screen scroll>
      <Text style={[styles.greet, { color: colors.textMuted }]}>Hi, {user?.firstName} 👋</Text>
      <Text style={[styles.title, { color: colors.text }]}>{"Today's overview"}</Text>

      <View style={styles.stats}>
        <StatCard
          label="Bookings"
          value={String(todayStats.bookings)}
          icon="calendar"
          colors={colors}
        />
        <StatCard
          label="Revenue"
          value={formatRevenueCompact(todayStats.revenueCents)}
          icon="cash"
          colors={colors}
        />
        <StatCard
          label="Classes"
          value={String(todayStats.classes)}
          icon="fitness"
          colors={colors}
        />
      </View>

      <Pressable
        style={[
          styles.availableBtn,
          { backgroundColor: profile?.availableNow ? colors.successMuted : colors.surface },
        ]}
        onPress={toggleAvailable}>
        <Ionicons
          name={profile?.availableNow ? 'radio-button-on' : 'radio-button-off'}
          size={20}
          color={profile?.availableNow ? colors.success : colors.textMuted}
        />
        <Text style={[styles.availableText, { color: colors.textSecondary }]}>
          {profile?.availableNow ? 'Available now — tap to turn off' : 'Mark as available now'}
        </Text>
      </Pressable>

      <View style={styles.row}>
        <Text style={[styles.section, { color: colors.text }]}>{"Today's classes"}</Text>
        <Button title="+ New" size="sm" onPress={() => router.push('/create-class')} />
      </View>

      {todayClasses.length ? (
        todayClasses.map((c) => <ClassCard key={c.id} item={c} />)
      ) : (
        <Text style={[styles.empty, { color: colors.textMuted }]}>No classes scheduled today</Text>
      )}
    </Screen>
  );
}

function StatCard({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  colors: { primary: string; text: string; textMuted: string; surface: string };
}) {
  return (
    <View style={[styles.stat, { backgroundColor: colors.surface }]}>
      <Ionicons name={icon} size={22} color={colors.primary} />
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greet: { fontSize: 14 },
  title: { fontSize: 26, fontWeight: '800', marginBottom: Spacing.md },
  stats: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  stat: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', marginTop: Spacing.sm },
  statLabel: { fontSize: 12 },
  availableBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.lg,
  },
  availableText: { fontWeight: '600' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  section: { fontSize: 18, fontWeight: '700' },
  empty: {},
});
