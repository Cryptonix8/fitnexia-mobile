import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { ClassCard } from '@/components/class-card';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useReviews } from '@/contexts/reviews-context';
import { useAppTheme } from '@/contexts/theme-context';
import { getInstructorById } from '@/data/mock';
import { useClasses } from '@/contexts/classes-context';
import { Radius, Spacing } from '@/constants/fitnexia';

export default function InstructorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { classes } = useClasses();
  const { getStaffReviewsForInstructor } = useReviews();
  const instructor = getInstructorById(id ?? '');
  const instructorClasses = classes.filter((c) => c.instructor.id === id);
  const staffReviews = getStaffReviewsForInstructor(id ?? '');

  if (!instructor) {
    return (
      <Screen>
        <Header title="Instructor" showBack />
        <Text style={{ color: colors.text }}>Instructor not found</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title="Instructor" showBack />
      <View style={styles.hero}>
        <UserAvatar size={100} kind="instructor" style={styles.photo} />
        <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
        <View style={styles.meta}>
          {instructor.verified ? <Badge label="Verified" variant="verified" /> : null}
          {instructor.availableNow ? (
            <Badge label="Available now" variant="success" />
          ) : null}
        </View>
        <Text style={[styles.rating, { color: colors.textMuted }]}>
          ★ {instructor.averageRating} ({instructor.reviewCount} athlete reviews)
        </Text>
        <Text style={[styles.bio, { color: colors.textSecondary }]}>{instructor.bio}</Text>
        <Text style={[styles.disciplines, { color: colors.primary }]}>
          {instructor.disciplines.join(' · ')}
        </Text>
      </View>

      {staffReviews.length > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Reviews from gyms</Text>
          {staffReviews.map((review) => (
            <View
              key={review.id}
              style={[
                styles.reviewCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <View style={styles.reviewHeader}>
                <Text style={[styles.reviewAuthor, { color: colors.text }]}>
                  {review.institutionName}
                </Text>
                <Badge label="Verified gym" variant="verified" />
              </View>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <Ionicons
                    key={n}
                    name={n <= review.rating ? 'star' : 'star-outline'}
                    size={16}
                    color={colors.warning}
                  />
                ))}
              </View>
              {review.comment ? (
                <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>
                  {review.comment}
                </Text>
              ) : null}
              <Text style={[styles.reviewDate, { color: colors.textMuted }]}>
                {new Date(review.createdAt).toLocaleDateString()}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      {instructor.certifications?.length ? (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Certifications</Text>
          {instructor.certifications.map((cert) => (
            <View
              key={`${cert.name}-${cert.year}`}
              style={[styles.certCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.certName, { color: colors.text }]}>{cert.name}</Text>
              <Text style={[styles.certMeta, { color: colors.textMuted }]}>
                {cert.issuer} · {cert.year}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      <Text style={[styles.section, { color: colors.text }]}>Upcoming classes</Text>
      {instructorClasses.length ? (
        instructorClasses.map((c) => <ClassCard key={c.id} item={c} />)
      ) : (
        <Text style={{ color: colors.textMuted }}>No upcoming classes</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: Spacing.lg },
  photo: { marginBottom: Spacing.md },
  name: { fontSize: 24, fontWeight: '800' },
  meta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  rating: { fontSize: 15, marginTop: Spacing.sm },
  bio: {
    fontSize: 15,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
    paddingHorizontal: Spacing.md,
  },
  disciplines: { fontSize: 14, fontWeight: '600', marginTop: Spacing.sm },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  reviewCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  reviewAuthor: { fontSize: 15, fontWeight: '700', flex: 1 },
  stars: { flexDirection: 'row', gap: 2, marginTop: Spacing.sm },
  reviewComment: { fontSize: 14, lineHeight: 20, marginTop: Spacing.sm },
  reviewDate: { fontSize: 12, marginTop: Spacing.sm },
  certCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  certName: { fontSize: 15, fontWeight: '600' },
  certMeta: { fontSize: 13, marginTop: 2 },
});
