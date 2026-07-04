import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Radius, Spacing } from '@/constants/fitnexia';
import { BADGE_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import type { ClassListItem } from '@/types/api';
import { isRecurringClass } from '@/utils/recurring-class';

type RecurringClassBadgeProps = {
  item: Pick<ClassListItem, 'seriesId' | 'recurrence'>;
  compact?: boolean;
};

export function RecurringClassBadge({ item, compact }: RecurringClassBadgeProps) {
  const { colors } = useAppTheme();

  if (!isRecurringClass(item)) return null;

  if (compact) {
    return <Badge label={BADGE_LABELS.recurring} variant="verified" />;
  }

  return (
    <View style={[styles.pill, { backgroundColor: colors.primaryMuted }]}>
      <Ionicons name="repeat" size={11} color={colors.primaryText} />
      <Text style={[styles.pillText, { color: colors.primaryText }]}>{BADGE_LABELS.recurring}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  pillText: { fontSize: 11, fontWeight: '600' },
});
