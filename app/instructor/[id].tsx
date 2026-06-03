import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { ClassCard } from '@/components/class-card';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { getInstructorById, MOCK_CLASSES } from '@/data/mock';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

export default function InstructorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const instructor = getInstructorById(id ?? '');
  const classes = MOCK_CLASSES.filter((c) => c.instructor.id === id);

  if (!instructor) {
    return (
      <Screen>
        <Header title="Instructor" showBack />
        <Text>Instructor not found</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title="Instructor" showBack />
      <View style={styles.hero}>
        <UserAvatar size={100} kind="instructor" style={styles.photo} />
        <Text style={styles.name}>{instructor.displayName}</Text>
        <View style={styles.meta}>
          {instructor.verified ? <Badge label="Verified" variant="verified" /> : null}
          {instructor.availableNow ? (
            <Badge label="Available now" variant="success" />
          ) : null}
        </View>
        <Text style={styles.rating}>
          ★ {instructor.averageRating} ({instructor.reviewCount} reviews)
        </Text>
        <Text style={styles.bio}>{instructor.bio}</Text>
        <Text style={styles.disciplines}>
          {instructor.disciplines.join(' · ')}
        </Text>
      </View>

      <Text style={styles.section}>Upcoming classes</Text>
      {classes.length ? (
        classes.map((c) => <ClassCard key={c.id} item={c} />)
      ) : (
        <Text style={styles.empty}>No upcoming classes</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: Spacing.lg },
  photo: { marginBottom: Spacing.md },
  name: { fontSize: 24, fontWeight: '800', color: FitnexiaColors.gray900 },
  meta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  rating: { fontSize: 15, color: FitnexiaColors.gray500, marginTop: Spacing.sm },
  bio: {
    fontSize: 15,
    color: FitnexiaColors.gray700,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  disciplines: { fontSize: 14, color: FitnexiaColors.primary, fontWeight: '600', marginTop: Spacing.sm },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  empty: { color: FitnexiaColors.gray500 },
});
