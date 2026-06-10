import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { UserAvatar } from '@/components/user-avatar';
import { Badge } from '@/components/ui/badge';
import { ClassCard } from '@/components/class-card';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useReviews } from '@/contexts/reviews-context';
import { useAppTheme } from '@/contexts/theme-context';
import { useClasses } from '@/contexts/classes-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BADGE_LABELS, PROFILE_MENU_LABELS } from '@/constants/labels';
import { fetchInstructorById } from '@/services/api/instructors.api';
import type { Instructor } from '@/types/api';

export default function InstructorProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { classes } = useClasses();
  const { getStaffReviewsForInstructor, loadStaffReviewsForInstructor } = useReviews();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([fetchInstructorById(id), loadStaffReviewsForInstructor(id)])
      .then(([data]) => setInstructor(data))
      .catch(() => setInstructor(null))
      .finally(() => setLoading(false));
  }, [id, loadStaffReviewsForInstructor]);

  const instructorClasses = classes.filter((c) => c.instructor.id === id);
  const staffReviews = getStaffReviewsForInstructor(id ?? '');

  if (loading) {
    return (
      <Screen>
        <Header title="Instructor" showBack />
        <ActivityIndicator style={{ marginTop: Spacing.xl }} />
      </Screen>
    );
  }

  if (!instructor) {
    return (
      <Screen>
        <Header title="Instructor" showBack />
        <Text style={{ color: colors.text }}>Instructor no encontrado</Text>
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <Header title="Instructor" showBack />
      <View style={styles.hero}>
        <UserAvatar size={100} kind="instructor" uri={instructor.photoUrl} style={styles.photo} />
        <Text style={[styles.name, { color: colors.text }]}>{instructor.displayName}</Text>
        <View style={styles.meta}>
          {instructor.verified ? <Badge label={BADGE_LABELS.verified} variant="verified" /> : null}
          {instructor.availableNow ? (
            <Badge label={BADGE_LABELS.availableNow} variant="success" />
          ) : null}
        </View>
        <Text style={[styles.rating, { color: colors.textMuted }]}>
          ★ {instructor.averageRating} ({instructor.reviewCount} reseñas de atletas)
        </Text>
        <Text style={[styles.bio, { color: colors.textSecondary }]}>{instructor.bio}</Text>
      </View>

      {instructor.disciplines.length > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.text }]}>{PROFILE_MENU_LABELS.disciplines}</Text>
          <View style={styles.chips}>
            {instructor.disciplines.map((d) => (
              <View key={d} style={[styles.chip, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={{ color: colors.textSecondary }}>{d}</Text>
              </View>
            ))}
          </View>
        </>
      ) : null}

      {(instructor.certifications?.length ?? 0) > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.text }]}>
            {PROFILE_MENU_LABELS.certifications}
          </Text>
          {instructor.certifications!.map((cert, index) => (
            <View
              key={`${cert.name}-${cert.year}-${index}`}
              style={[
                styles.certCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}>
              <Text style={[styles.certName, { color: colors.text }]}>{cert.name}</Text>
              <Text style={[styles.certMeta, { color: colors.textMuted }]}>
                {cert.issuer} · {cert.year}
              </Text>
            </View>
          ))}
        </>
      ) : null}

      {staffReviews.length > 0 ? (
        <>
          <Text style={[styles.section, { color: colors.text }]}>Reseñas del staff del gimnasio</Text>
          {staffReviews.map((review) => (
            <View
              key={review.id}
              style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.reviewGym, { color: colors.textMuted }]}>{review.institutionName}</Text>
              <Text style={{ color: colors.warning }}>{'★'.repeat(review.rating)}</Text>
              {review.comment ? (
                <Text style={[styles.reviewComment, { color: colors.textSecondary }]}>{review.comment}</Text>
              ) : null}
            </View>
          ))}
        </>
      ) : null}

      <Text style={[styles.section, { color: colors.text }]}>Próximas clases</Text>
      {instructorClasses.length === 0 ? (
        <Text style={[styles.empty, { color: colors.textMuted }]}>No hay clases próximas publicadas.</Text>
      ) : (
        instructorClasses.map((c) => <ClassCard key={c.id} item={c} />)
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', marginBottom: Spacing.lg },
  photo: { marginBottom: Spacing.md },
  name: { fontSize: 24, fontWeight: '800' },
  meta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  rating: { marginTop: Spacing.sm, fontSize: 14 },
  bio: { marginTop: Spacing.md, textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.md },
  section: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md, marginTop: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full },
  certCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  certName: { fontSize: 16, fontWeight: '700' },
  certMeta: { fontSize: 13, marginTop: 4 },
  reviewCard: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  reviewGym: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  reviewComment: { marginTop: Spacing.sm, lineHeight: 20 },
  empty: { marginBottom: Spacing.lg },
});
