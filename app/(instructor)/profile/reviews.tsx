import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { ReviewCard } from '@/components/profile/review-card';
import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import {
  fetchInstructorAthleteReviews,
  respondToReviewApi,
} from '@/services/api/v2-features.api';
import { fetchInstructorById } from '@/services/api/instructors.api';
import { getErrorMessage } from '@/services/api/errors';
import type { Instructor, Review } from '@/types/api';

export default function InstructorReviewsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const instructorId = user?.instructorId;
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!instructorId) {
      setReviews([]);
      setInstructor(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [profile, reviewList] = await Promise.all([
        fetchInstructorById(instructorId),
        fetchInstructorAthleteReviews(instructorId),
      ]);
      setInstructor(profile);
      setReviews(reviewList);
    } catch (err) {
      setReviews([]);
      setInstructor(null);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const submit = async (reviewId: string) => {
    const response = drafts[reviewId]?.trim();
    if (!response) return;
    try {
      await respondToReviewApi(reviewId, response);
      setDrafts((prev) => ({ ...prev, [reviewId]: '' }));
      load();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    }
  };

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Reseñas recibidas" showBack />}>
      {!instructorId ? (
        <Text style={{ color: colors.textMuted }}>Perfil de instructor no disponible.</Text>
      ) : error ? (
        <Text style={{ color: colors.error }}>{error}</Text>
      ) : (
        <>
          {instructor && instructor.reviewCount > 0 ? (
            <View style={styles.summary}>
              <StarRating
                rating={instructor.averageRating}
                reviewCount={instructor.reviewCount}
                size={18}
              />
            </View>
          ) : null}
          {reviews.length === 0 ? (
            <EmptyState
              icon="star-outline"
              title="Sin reseñas todavía"
              description="Cuando un atleta deje una reseña después de una clase, aparecerá acá."
            />
          ) : (
            reviews.map((review) => (
              <View key={review.id}>
                <ReviewCard review={review} showInstructorResponse={false} />
                {review.response ? (
                  <View style={[styles.response, { backgroundColor: colors.surfaceMuted }]}>
                    <Text style={{ color: colors.textSecondary }}>{review.response}</Text>
                  </View>
                ) : (
                  <>
                    <TextInput
                      value={drafts[review.id] ?? ''}
                      onChangeText={(t) => setDrafts((prev) => ({ ...prev, [review.id]: t }))}
                      placeholder="Tu respuesta pública..."
                      placeholderTextColor={colors.textMuted}
                      multiline
                      style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    />
                    <Button title="Publicar respuesta" onPress={() => submit(review.id)} />
                  </>
                )}
              </View>
            ))
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { marginBottom: Spacing.lg, alignItems: 'center' },
  response: { marginTop: -Spacing.xs, marginBottom: Spacing.md, padding: Spacing.sm, borderRadius: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    minHeight: 72,
  },
});
