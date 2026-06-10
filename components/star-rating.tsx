import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/contexts/theme-context';

type StarRatingProps = {
  rating?: number;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
  style?: ViewStyle;
};

export function StarRating({
  rating = 0,
  reviewCount = 0,
  size = 14,
  showCount = true,
  style,
}: StarRatingProps) {
  const { colors } = useAppTheme();
  const hasRating = reviewCount > 0;
  const filledStars = hasRating ? Math.min(5, Math.max(0, Math.round(rating))) : 0;

  return (
    <View style={[styles.row, style]}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Ionicons
            key={n}
            name={n <= filledStars ? 'star' : 'star-outline'}
            size={size}
            color={colors.warning}
          />
        ))}
      </View>
      {showCount && hasRating ? (
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {rating.toFixed(1)} ({reviewCount})
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  count: {
    fontSize: 12,
    fontWeight: '500',
  },
});
