import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { getLinkedInstructorId } from '@/utils/instructor';
import {
  fetchInstructorAthleteReviews,
  respondToReviewApi,
} from '@/services/api/v2-features.api';
import { getErrorMessage } from '@/services/api/errors';
import type { Review } from '@/types/api';

export default function InstructorReviewsScreen() {
  const { user } = useAuth();
  const { colors } = useAppTheme();
  const instructorId = getLinkedInstructorId(user);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!instructorId) return;
    setLoading(true);
    try {
      setReviews(await fetchInstructorAthleteReviews(instructorId));
    } catch {
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [instructorId]);

  useFocusEffect(
    useCallback(() => {
      load();
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
      header={<Header title="Reseñas" showBack />}>
      {reviews.map((review) => (
        <View
          key={review.id}
          style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={{ color: colors.textMuted }}>{review.authorName}</Text>
          <StarRating rating={review.rating} reviewCount={1} size={16} showCount={false} />
          {review.comment ? (
            <Text style={{ color: colors.text, marginTop: Spacing.sm }}>{review.comment}</Text>
          ) : null}
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
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 8, padding: Spacing.md, marginBottom: Spacing.md },
  response: { marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    minHeight: 72,
  },
});
