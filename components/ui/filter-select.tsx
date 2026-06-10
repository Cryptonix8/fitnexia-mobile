import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

export type FilterSelectOption = {
  value: string;
  label: string;
};

type FilterSelectProps = {
  label: string;
  value: string | null;
  options: FilterSelectOption[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  style?: ViewStyle;
  /** When true, selecting the current value again clears the filter. */
  clearable?: boolean;
};

export function FilterSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Todos',
  style,
  clearable = true,
}: FilterSelectProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === (value ?? ''));
  const displayValue = selected?.label ?? placeholder;
  const isActive = value != null && value !== '' && value !== 'any';

  const pick = (next: string) => {
    if (clearable && next === (value ?? '')) {
      onChange(null);
    } else {
      onChange(next === 'any' || next === '' ? null : next);
    }
    setOpen(false);
  };

  return (
    <>
      <Pressable
        style={[
          styles.trigger,
          {
            backgroundColor: colors.input,
            borderColor: isActive ? colors.primary : colors.border,
          },
          style,
        ]}
        onPress={() => setOpen(true)}>
        <View style={styles.triggerText}>
          <Text style={[styles.label, { color: colors.textMuted }]} numberOfLines={1}>
            {label}
          </Text>
          <Text
            style={[styles.value, { color: isActive ? colors.primaryText : colors.text }]}
            numberOfLines={1}>
            {displayValue}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                paddingBottom: Math.max(insets.bottom, Spacing.md),
              },
            ]}
            onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.sheetTitle, { color: colors.text }]}>{label}</Text>
            <ScrollView style={styles.optionsList} bounces={false}>
              {options.map((option) => {
                const active = (value ?? '') === option.value || (value == null && option.value === '');
                return (
                  <Pressable
                    key={option.value || '__default__'}
                    style={[
                      styles.option,
                      active && { backgroundColor: colors.primaryMuted },
                    ]}
                    onPress={() => pick(option.value)}>
                    <Text
                      style={[
                        styles.optionLabel,
                        { color: active ? colors.primaryText : colors.text },
                      ]}>
                      {option.label}
                    </Text>
                    {active ? (
                      <Ionicons name="checkmark" size={20} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    minHeight: 52,
  },
  triggerText: { flex: 1, marginRight: Spacing.sm },
  label: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  value: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    maxHeight: '70%',
  },
  sheetHandle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.full,
    marginBottom: Spacing.md,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.sm,
  },
  optionsList: { maxHeight: 360 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: 2,
  },
  optionLabel: { fontSize: 16, fontWeight: '500', flex: 1 },
});
