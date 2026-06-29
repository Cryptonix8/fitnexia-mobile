import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type PressableProps } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: keyof typeof Ionicons.glyphMap;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  icon,
  disabled,
  style,
  ...rest
}: ButtonProps) {
  const { colors } = useAppTheme();

  const variantStyles = {
    primary: { bg: colors.primary, text: colors.surface, border: colors.primary },
    secondary: { bg: colors.text, text: colors.surface, border: colors.text },
    outline: { bg: 'transparent', text: colors.primary, border: colors.primary },
    ghost: { bg: colors.primaryMuted, text: colors.primaryText, border: colors.primaryMuted },
    danger: { bg: colors.error, text: colors.surface, border: colors.error },
  }[variant];

  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 22 : 20;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        styles[size],
        {
          backgroundColor: variantStyles.bg,
          borderColor: variantStyles.border,
          borderWidth: variant === 'outline' ? 1.5 : 0,
        },
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      disabled={disabled}
      {...rest}>
      <View style={styles.content}>
        {icon ? (
          <Ionicons name={icon} size={iconSize} color={variantStyles.text} style={styles.icon} />
        ) : null}
        <Text
          style={[
            styles.text,
            styles[`text_${size}`],
            { color: variantStyles.text },
          ]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: Spacing.sm,
  },
  sm: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md, minHeight: 36 },
  md: { paddingVertical: 14, paddingHorizontal: Spacing.lg, minHeight: 48 },
  lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 56 },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.5 },
  text: { fontWeight: '600' },
  text_sm: { fontSize: 14 },
  text_md: { fontSize: 16 },
  text_lg: { fontSize: 17 },
});
