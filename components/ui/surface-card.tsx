import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type SurfaceCardProps = ViewProps & {
  /** Default `md` — use `none` for nested cards. */
  padding?: keyof typeof Spacing | 'none';
  /** Optional border using theme token. */
  bordered?: boolean;
};

export function SurfaceCard({
  children,
  style,
  padding = 'md',
  bordered = false,
  ...rest
}: SurfaceCardProps) {
  const { colors } = useAppTheme();
  const pad = padding === 'none' ? 0 : Spacing[padding];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          padding: pad,
          borderColor: bordered ? colors.border : 'transparent',
          borderWidth: bordered ? 1 : 0,
        },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
  },
});
