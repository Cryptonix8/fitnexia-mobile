import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import {
  formatClassDate,
  formatMoney,
  getInstructorById,
} from '@/data/mock';
import { useClasses } from '@/contexts/classes-context';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getClassById } = useClasses();
  const cls = getClassById(id ?? '');
  const instructor = cls ? getInstructorById(cls.instructor.id) : undefined;

  if (!cls) {
    return (
      <Screen>
        <Header title="Class" showBack />
        <Text>Class not found</Text>
      </Screen>
    );
  }

  const full = cls.spotsLeft === 0;

  return (
    <Screen scroll>
      <Header title="Class details" showBack />
      <View style={styles.hero}>
        <Text style={styles.title}>{cls.title}</Text>
        <View style={styles.tags}>
          <Badge label={cls.discipline} />
          <Badge
            label={cls.modality === 'online' ? 'Online' : 'In person'}
            variant="success"
          />
        </View>
      </View>

      <View style={styles.card}>
        <Row icon="calendar-outline" label="When" value={formatClassDate(cls.startAt)} />
        <Row icon="time-outline" label="Duration" value={`${cls.durationMinutes} min`} />
        <Row
          icon="location-outline"
          label="Where"
          value={
            cls.modality === 'online'
              ? 'Live stream on Fitnexia'
              : (cls.location?.label ?? 'TBD')
          }
        />
        <Row icon="cash-outline" label="Price" value={formatMoney(cls.price)} />
        {cls.capacity ? (
          <Row
            icon="people-outline"
            label="Spots"
            value={full ? 'Full — waitlist available' : `${cls.spotsLeft} of ${cls.capacity} left`}
          />
        ) : null}
      </View>

      <PressableInstructor
        name={cls.instructor.displayName}
        verified={instructor?.verified}
        rating={instructor?.averageRating}
        onPress={() => router.push(`/instructor/${cls.instructor.id}`)}
      />

      <Text style={styles.section}>About</Text>
      <Text style={styles.desc}>
        Join {cls.instructor.displayName} for an engaging {cls.discipline.toLowerCase()} session.
        Suitable for all levels. Bring water and comfortable gear.
      </Text>

      {full ? (
        <Button
          title="Join waiting list"
          variant="secondary"
          onPress={() => router.push(`/book/${cls.id}?waitlist=1`)}
        />
      ) : (
        <Button title="Book now" onPress={() => router.push(`/book/${cls.id}`)} />
      )}
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={FitnexiaColors.primary} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

function PressableInstructor({
  name,
  verified,
  rating,
  onPress,
}: {
  name: string;
  verified?: boolean;
  rating?: number;
  onPress: () => void;
}) {
  return (
    <View style={styles.instructorCard}>
      <UserAvatar size={56} kind="instructor" />
      <View style={{ flex: 1 }}>
        <Text style={styles.instructorName}>{name}</Text>
        {verified ? <Badge label="Verified" variant="verified" /> : null}
        {rating ? (
          <Text style={styles.rating}>★ {rating.toFixed(1)}</Text>
        ) : null}
      </View>
      <Button title="Profile" variant="ghost" size="sm" onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  hero: { marginBottom: Spacing.md },
  title: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900 },
  tags: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  card: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  rowText: { flex: 1 },
  rowLabel: { fontSize: 12, color: FitnexiaColors.gray500 },
  rowValue: { fontSize: 15, fontWeight: '600', color: FitnexiaColors.gray900, marginTop: 2 },
  instructorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  instructorName: { fontSize: 17, fontWeight: '700', color: FitnexiaColors.gray900 },
  rating: { fontSize: 14, color: FitnexiaColors.gray500, marginTop: 4 },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.sm },
  desc: { fontSize: 15, color: FitnexiaColors.gray500, lineHeight: 22, marginBottom: Spacing.lg },
});
