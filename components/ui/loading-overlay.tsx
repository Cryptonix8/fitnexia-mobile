import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/fitnexia';
import { useAppTheme } from '@/contexts/theme-context';

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export function LoadingOverlay({ visible, message }: LoadingOverlayProps) {
  const { colors } = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <ActivityIndicator size="large" color={colors.primary} />
        {message ? (
          <Text style={[styles.message, { color: colors.surface }]}>{message}</Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  message: {
    marginTop: Spacing.md,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
  },
});
