import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';

import { ReviewCard } from '@/components/profile/review-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchInstructorAthleteReviews } from '@/services/api/v2-features.api';
import type { Review } from '@/types/api';

export default function InstructorReviewsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(null);
    fetchInstructorAthleteReviews(id)
      .then(setReviews)
      .catch(() => {
        setReviews([]);
        setError('No se pudieron cargar las reseñas.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Reseñas de atletas" showBack />}>
      {error ? <Text style={{ color: colors.error }}>{error}</Text> : null}
      {!loading && !error && reviews.length === 0 ? (
        <EmptyState
          icon="star-outline"
          title="Sin reseñas"
          description="Este instructor todavía no tiene reseñas de atletas."
        />
      ) : null}
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </Screen>
  );
}
