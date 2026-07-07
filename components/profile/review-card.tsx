import { StyleSheet, Text, View } from 'react-native';

import { StarRating } from '@/components/star-rating';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import type { Review } from '@/types/api';
import { useFeature } from '@/hooks/use-feature';

type ReviewCardProps = {
  review: Review;
  showInstructorResponse?: boolean;
};

export function ReviewCard({ review, showInstructorResponse = true }: ReviewCardProps) {
  const { colors } = useAppTheme();
  const reviewResponses = useFeature('reviewResponses');

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.author, { color: colors.textMuted }]}>{review.authorName}</Text>
      <StarRating rating={review.rating} reviewCount={1} size={16} showCount={false} />
      {review.comment ? (
        <Text style={[styles.comment, { color: colors.textSecondary }]}>{review.comment}</Text>
      ) : null}
      {showInstructorResponse && reviewResponses && review.response ? (
        <View style={[styles.responseBox, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.responseLabel, { color: colors.textMuted }]}>Respuesta del instructor</Text>
          <Text style={{ color: colors.textSecondary }}>{review.response}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  author: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
  comment: { marginTop: Spacing.sm, lineHeight: 20 },
  responseBox: { marginTop: Spacing.sm, padding: Spacing.sm, borderRadius: Radius.sm },
  responseLabel: { fontSize: 12, fontWeight: '600', marginBottom: 4 },
});
