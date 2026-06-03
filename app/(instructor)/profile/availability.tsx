import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { DateTimeField } from '@/components/date-time-field';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Radius, Spacing } from '@/constants/fitnexia';
import type { WeeklyDaySchedule } from '@/types/api';
import {
  dateToTimeString,
  defaultWeeklySchedule,
  formatScheduleDay,
  timeStringToDate,
  weekdayLabel,
} from '@/utils/schedule';

export default function InstructorAvailabilityScreen() {
  const { user, updateProfile } = useAuth();
  const { colors } = useAppTheme();
  const profile = user?.instructorProfile;

  const [availableNow, setAvailableNow] = useState(profile?.availableNow ?? false);
  const [schedule, setSchedule] = useState<WeeklyDaySchedule[]>(
    profile?.weeklySchedule ?? defaultWeeklySchedule(),
  );
  const [editingDay, setEditingDay] = useState<number | null>(null);

  if (!profile) {
    return (
      <Screen>
        <Header title="Schedule & availability" showBack />
        <Text>Profile not available</Text>
      </Screen>
    );
  }

  const toggleDay = (weekday: number) => {
    setSchedule((prev) =>
      prev.map((day) =>
        day.weekday === weekday ? { ...day, enabled: !day.enabled } : day,
      ),
    );
  };

  const updateDayTime = (weekday: number, field: 'startTime' | 'endTime', date: Date) => {
    const value = dateToTimeString(date);
    setSchedule((prev) =>
      prev.map((day) => (day.weekday === weekday ? { ...day, [field]: value } : day)),
    );
  };

  const save = () => {
    const invalid = schedule.find((day) => {
      if (!day.enabled) return false;
      return day.startTime >= day.endTime;
    });
    if (invalid) {
      Alert.alert('Invalid hours', `${weekdayLabel(invalid.weekday)} end time must be after start time.`);
      return;
    }

    updateProfile({
      instructorProfile: {
        availableNow,
        weeklySchedule: schedule,
      },
    });
    Alert.alert('Saved', 'Your availability has been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll>
      <Header title="Schedule & availability" showBack />

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Available now</Text>
      <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
        Show athletes you are free for immediate bookings.
      </Text>
      <Pressable
        style={[
          styles.nowRow,
          { backgroundColor: availableNow ? colors.successMuted : colors.surface, borderColor: colors.border },
        ]}
        onPress={() => setAvailableNow(!availableNow)}>
        <Ionicons
          name={availableNow ? 'radio-button-on' : 'radio-button-off'}
          size={22}
          color={availableNow ? colors.success : colors.textMuted}
        />
        <Text style={[styles.nowText, { color: colors.textSecondary }]}>
          {availableNow ? 'Available now — athletes can see you online' : 'Mark as available now'}
        </Text>
        <Switch value={availableNow} onValueChange={setAvailableNow} />
      </Pressable>

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: Spacing.lg }]}>
        Weekly hours
      </Text>
      <Text style={[styles.sectionHint, { color: colors.textMuted }]}>
        Set when you usually accept bookings. Used for discovery and scheduling hints.
      </Text>

      {schedule.map((day) => (
        <View
          key={day.weekday}
          style={[styles.dayCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.dayHeader}>
            <Text style={[styles.dayName, { color: colors.text }]}>{weekdayLabel(day.weekday)}</Text>
            <Switch value={day.enabled} onValueChange={() => toggleDay(day.weekday)} />
          </View>
          {day.enabled ? (
            <>
              <Text style={[styles.dayHours, { color: colors.textMuted }]}>
                {formatScheduleDay(day)}
              </Text>
              <Pressable onPress={() => setEditingDay(editingDay === day.weekday ? null : day.weekday)}>
                <Text style={[styles.editLink, { color: colors.primary }]}>
                  {editingDay === day.weekday ? 'Hide times' : 'Edit times'}
                </Text>
              </Pressable>
              {editingDay === day.weekday ? (
                <View style={styles.timePickers}>
                  <DateTimeField
                    label="From"
                    mode="time"
                    value={timeStringToDate(day.startTime)}
                    onChange={(d) => updateDayTime(day.weekday, 'startTime', d)}
                  />
                  <DateTimeField
                    label="Until"
                    mode="time"
                    value={timeStringToDate(day.endTime)}
                    onChange={(d) => updateDayTime(day.weekday, 'endTime', d)}
                  />
                </View>
              ) : null}
            </>
          ) : (
            <Text style={[styles.dayHours, { color: colors.textMuted }]}>Unavailable</Text>
          )}
        </View>
      ))}

      <Button title="Save availability" onPress={save} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.xs },
  sectionHint: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  nowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  nowText: { flex: 1, fontSize: 15, fontWeight: '600' },
  dayCard: {
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayName: { fontSize: 16, fontWeight: '700' },
  dayHours: { fontSize: 14, marginTop: Spacing.xs },
  editLink: { fontSize: 14, fontWeight: '600', marginTop: Spacing.sm },
  timePickers: { marginTop: Spacing.sm },
});
