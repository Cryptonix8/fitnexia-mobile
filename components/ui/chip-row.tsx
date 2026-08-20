import { Pressable, StyleSheet, Text, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type ChipRowProps = ViewProps & {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
};

/** Horizontal chip selector — theme-aware for light and dark mode. */
export function ChipRow({ options, value, onChange, style, ...rest }: ChipRowProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.row, style]} {...rest}>
      {options.map((option) => {
        const active = value === option;
        return (
          <Pressable
            key={option}
            style={[
              styles.chip,
              {
                backgroundColor: active ? colors.primary : colors.surface,
                borderColor: active ? colors.primary : colors.border,
              },
            ]}
            onPress={() => onChange(option)}>
            <Text
              style={[
                styles.chipText,
                { color: active ? colors.onPrimary : colors.textSecondary },
              ]}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 14 },
});
