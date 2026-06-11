import { Fragment } from 'react';
import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';

type ScreenProps = ViewProps & {
  scroll?: boolean;
  padded?: boolean;
  edges?: ('top' | 'bottom')[];
  /** Full-screen overlay while primary server data is loading. */
  loading?: boolean;
  loadingMessage?: string;
};

export function Screen({
  children,
  scroll = false,
  padded = true,
  edges = ['top', 'bottom'],
  loading = false,
  loadingMessage = LOADING_LABELS.default,
  style,
  ...rest
}: ScreenProps) {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const paddingTop = edges.includes('top') ? insets.top : 0;
  const paddingBottom = edges.includes('bottom') ? insets.bottom : 0;

  const content = (
    <View
      style={[
        styles.inner,
        padded && styles.padded,
        { paddingTop: paddingTop + (padded ? Spacing.md : 0), paddingBottom },
        style,
      ]}
      {...rest}>
      {children}
    </View>
  );

  const overlay = <LoadingOverlay visible={loading} message={loadingMessage} />;

  if (scroll) {
    return (
      <Fragment>
        <ScrollView
          style={[styles.root, { backgroundColor: colors.background }]}
          contentContainerStyle={[
            styles.scrollContent,
            padded && styles.padded,
            {
              paddingTop: paddingTop + (padded ? Spacing.md : 0),
              paddingBottom,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {children}
        </ScrollView>
        {overlay}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <View style={[styles.root, { backgroundColor: colors.background }]}>{content}</View>
      {overlay}
    </Fragment>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  inner: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: Spacing.md,
  },
});
