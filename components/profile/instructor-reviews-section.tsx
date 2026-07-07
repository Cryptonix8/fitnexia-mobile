import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { ReviewCard } from '@/components/profile/review-card';
import { Button } from '@/components/ui/button';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS } from '@/constants/labels';
import type { Review } from '@/types/api';

const PREVIEW_LIMIT = 3;

type InstructorReviewsSectionProps = {
  reviews: Review[];
  title?: string;
  seeMoreHref?: string;
  emptyMessage?: string;
};

export function InstructorReviewsSection({
  reviews,
  title = 'Reseñas de atletas',
  seeMoreHref,
  emptyMessage = 'Sin reseñas de atletas todavía.',
}: InstructorReviewsSectionProps) {
  const { colors } = useAppTheme();
  const preview = reviews.slice(0, PREVIEW_LIMIT);
  const hasMore = reviews.length > PREVIEW_LIMIT;

  if (reviews.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.empty, { color: colors.textMuted }]}>{emptyMessage}</Text>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      {preview.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
      {hasMore && seeMoreHref ? (
        <Button
          title={BUTTON_LABELS.seeMore}
          variant="outline"
          size="sm"
          onPress={() => router.push(seeMoreHref as never)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: Spacing.sm, marginBottom: Spacing.md },
  title: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.md },
  empty: { fontSize: 14, lineHeight: 20, textAlign: 'center'},
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
