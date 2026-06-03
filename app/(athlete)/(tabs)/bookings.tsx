import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import {
  formatClassDate,
  formatMoney,
  getClassById,
  MOCK_BOOKINGS,
} from '@/data/mock';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

export default function BookingsScreen() {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');

  const upcoming = MOCK_BOOKINGS.filter((b) => b.status === 'confirmed');
  const past = MOCK_BOOKINGS.filter((b) => b.status === 'completed');
  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <Screen scroll>
      <Text style={styles.title}>My bookings</Text>
      <View style={styles.tabs}>
        <Tab label="Upcoming" active={tab === 'upcoming'} onPress={() => setTab('upcoming')} />
        <Tab label="History" active={tab === 'past'} onPress={() => setTab('past')} />
      </View>

      {list.length === 0 ? (
        <Text style={styles.empty}>No bookings yet. Explore classes to book!</Text>
      ) : (
        list.map((b) => {
          const cls = getClassById(b.classId);
          if (!cls) return null;
          return (
            <View key={b.id} style={styles.card}>
              <Text style={styles.cardTitle}>{cls.title}</Text>
              <Text style={styles.meta}>{formatClassDate(cls.startAt)}</Text>
              <Text style={styles.meta}>{cls.instructor.displayName}</Text>
              <View style={styles.row}>
                <Text style={styles.price}>{formatMoney(b.price)}</Text>
                <View style={[styles.badge, b.status === 'completed' && styles.badgeDone]}>
                  <Text style={styles.badgeText}>{b.status}</Text>
                </View>
              </View>
              {b.status === 'completed' ? (
                <Button
                  title="Leave a review"
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/review/${b.id}`)}
                />
              ) : (
                <Pressable onPress={() => router.push(`/class/${cls.id}`)}>
                  <Text style={styles.link}>View class</Text>
                </Pressable>
              )}
            </View>
          );
        })
      )}
    </Screen>
  );
}

function Tab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FitnexiaColors.gray900,
    marginBottom: Spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: FitnexiaColors.gray100,
    borderRadius: Radius.md,
    padding: 4,
    marginBottom: Spacing.lg,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: FitnexiaColors.white },
  tabText: { fontWeight: '600', color: FitnexiaColors.gray500 },
  tabTextActive: { color: FitnexiaColors.primary },
  empty: { textAlign: 'center', color: FitnexiaColors.gray500, marginTop: Spacing.xl },
  card: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardTitle: { fontSize: 17, fontWeight: '700', color: FitnexiaColors.gray900 },
  meta: { fontSize: 14, color: FitnexiaColors.gray500, marginTop: 4 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  price: { fontSize: 16, fontWeight: '700', color: FitnexiaColors.primary },
  badge: {
    backgroundColor: FitnexiaColors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeDone: { backgroundColor: FitnexiaColors.gray100 },
  badgeText: { fontSize: 12, fontWeight: '600', color: FitnexiaColors.primaryDark },
  link: { color: FitnexiaColors.primary, fontWeight: '600' },
});
