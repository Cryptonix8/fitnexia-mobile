import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
} from 'react-native';

import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

export function Button({
  title,
  variant = 'primary',
  loading,
  size = 'md',
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[size],
        styles[variant],
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      disabled={isDisabled}
      {...rest}>
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? FitnexiaColors.primary : FitnexiaColors.white} />
      ) : (
        <Text style={[styles.text, styles[`text_${variant}`], styles[`text_${size}`]]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, minHeight: 36 },
  md: { paddingVertical: 14, paddingHorizontal: Spacing.lg, minHeight: 48 },
  lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 56 },
  primary: { backgroundColor: FitnexiaColors.primary },
  secondary: { backgroundColor: FitnexiaColors.gray900 },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: FitnexiaColors.primary,
  },
  ghost: { backgroundColor: FitnexiaColors.primaryLight },
  danger: { backgroundColor: FitnexiaColors.error },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '600' },
  text_primary: { color: FitnexiaColors.white },
  text_secondary: { color: FitnexiaColors.white },
  text_outline: { color: FitnexiaColors.primary },
  text_ghost: { color: FitnexiaColors.primaryDark },
  text_danger: { color: FitnexiaColors.white },
  text_sm: { fontSize: 14 },
  text_md: { fontSize: 16 },
  text_lg: { fontSize: 17 },
});
