import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';
import {
  addMonths,
  buildMonthGrid,
  formatMonthYear,
  getWeekdayLabels,
  isToday,
  toDateKey,
} from '@/utils/calendar';
import { isSameCalendarDay } from '@/utils/schedule';

type BookingsCalendarProps = {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  markedDateKeys: Set<string>;
};

export function BookingsCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  markedDateKeys,
}: BookingsCalendarProps) {
  const { colors } = useAppTheme();
  const grid = buildMonthGrid(month);
  const weekdays = getWeekdayLabels();

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.monthRow}>
        <Pressable
          onPress={() => onMonthChange(addMonths(month, -1))}
          hitSlop={12}
          accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
        </Pressable>
        <Text style={[styles.monthLabel, { color: colors.text }]}>{formatMonthYear(month)}</Text>
        <Pressable
          onPress={() => onMonthChange(addMonths(month, 1))}
          hitSlop={12}
          accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {weekdays.map((label) => (
          <Text key={label} style={[styles.weekday, { color: colors.textMuted }]}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((day, index) => {
          if (!day) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const key = toDateKey(day);
          const selected = isSameCalendarDay(day, selectedDate);
          const today = isToday(day);
          const marked = markedDateKeys.has(key);

          return (
            <Pressable
              key={key}
              style={styles.dayCell}
              onPress={() => onSelectDate(day)}
              accessibilityLabel={day.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
              accessibilityState={{ selected }}>
              <View
                style={[
                  styles.dayInner,
                  selected && { backgroundColor: colors.primary },
                  !selected && today && {
                    borderWidth: 2,
                    borderColor: colors.primary,
                  },
                ]}>
                <Text
                  style={[
                    styles.dayText,
                    { color: colors.text },
                    selected && { color: colors.onPrimary, fontWeight: '700' },
                  ]}>
                  {day.getDate()}
                </Text>
                {marked ? (
                  <View
                    style={[
                      styles.dot,
                      {
                        backgroundColor: selected ? colors.onPrimary : colors.primary,
                      },
                    ]}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  dayInner: {
    width: '88%',
    height: '88%',
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayText: {
    fontSize: 15,
    fontWeight: '500',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 2,
  },
});
