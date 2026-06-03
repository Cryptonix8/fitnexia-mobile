import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type DateTimeFieldProps = {
  label: string;
  mode: 'date' | 'time';
  value: Date;
  onChange: (date: Date) => void;
  minimumDate?: Date;
};

export function DateTimeField({
  label,
  mode,
  value,
  onChange,
  minimumDate,
}: DateTimeFieldProps) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);

  const display =
    mode === 'date'
      ? value.toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : value.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        });

  const onPickerChange = (_event: DateTimePickerEvent, selected?: Date) => {
    if (Platform.OS === 'android') setOpen(false);
    if (selected) onChange(selected);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
      <Pressable
        style={[
          styles.field,
          { backgroundColor: colors.input, borderColor: colors.border },
        ]}
        onPress={() => setOpen(true)}>
        <Text style={[styles.value, { color: colors.text }]}>{display}</Text>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value}
          mode={mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={minimumDate}
          onChange={onPickerChange}
        />
      ) : null}
      {open && Platform.OS === 'ios' ? (
        <Pressable onPress={() => setOpen(false)} style={styles.done}>
          <Text style={[styles.doneText, { color: colors.primary }]}>Done</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  field: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
  },
  value: { fontSize: 16 },
  done: { alignItems: 'flex-end', marginTop: Spacing.xs },
  doneText: { fontSize: 16, fontWeight: '600' },
});
