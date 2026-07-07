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

function starIconName(starIndex: number, rating: number): keyof typeof Ionicons.glyphMap {
  const value = rating - starIndex + 1;
  if (value >= 0.75) return 'star';
  if (value >= 0.25) return 'star-half';
  return 'star-outline';
}

export function StarRating({
  rating = 0,
  reviewCount = 0,
  size = 14,
  showCount = true,
  style,
}: StarRatingProps) {
  const { colors } = useAppTheme();
  const hasRating = reviewCount > 0;

  return (
    <View style={[styles.row, style]}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Ionicons
            key={n}
            name={hasRating ? starIconName(n, rating) : 'star-outline'}
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
