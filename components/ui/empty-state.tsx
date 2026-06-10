import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { Button } from '@/components/ui/button';
import { Radius, Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type EmptyStateProps = {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
  style,
}: EmptyStateProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.root,
        compact ? styles.compact : null,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
      ]}>
      <View style={[styles.iconWrap, { backgroundColor: colors.surfaceMuted }]}>
        <Ionicons name={icon} size={compact ? 28 : 40} color={colors.textMuted} />
      </View>
      <Text style={[styles.title, compact ? styles.titleCompact : null, { color: colors.text }]}>
        {title}
      </Text>
      {description ? (
        <Text
          style={[
            styles.description,
            compact ? styles.descriptionCompact : null,
            { color: colors.textMuted },
          ]}>
          {description}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button
          title={actionLabel}
          variant="outline"
          size="sm"
          onPress={onAction}
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: Spacing.md,
  },
  compact: {
    padding: Spacing.lg,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: Spacing.md,
    textAlign: 'center',
  },
  titleCompact: {
    fontSize: 15,
    marginTop: Spacing.sm,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: Spacing.sm,
    maxWidth: 280,
  },
  descriptionCompact: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  action: {
    marginTop: Spacing.md,
    alignSelf: 'stretch',
  },
});
