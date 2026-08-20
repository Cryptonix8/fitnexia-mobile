import { Pressable, StyleSheet, Text, type TextStyle, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type ToggleChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
};

/** Theme-aware selectable chip for filters, sports, disciplines, etc. */
export function ToggleChip({ label, active, onPress, style, textStyle }: ToggleChipProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.primary : colors.surface,
          borderColor: active ? colors.primary : colors.border,
        },
        style,
      ]}
      onPress={onPress}>
      <Text
        style={[
          styles.text,
          { color: active ? colors.onPrimary : colors.textSecondary },
          active && styles.textActive,
          textStyle,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  text: { fontSize: 14 },
  textActive: { fontWeight: '600' },
});
