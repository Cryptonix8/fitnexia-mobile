import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, LOADING_LABELS } from '@/constants/labels';
import { useCloseAccount } from '@/hooks/use-close-account';

export function CloseAccountButton() {
  const { confirmCloseAccount, closing } = useCloseAccount();

  return (
    <>
      <Button
        title={BUTTON_LABELS.closeAccount}
        variant="danger"
        icon="person-remove-outline"
        onPress={confirmCloseAccount}
        disabled={closing}
        style={styles.button}
      />
      <LoadingOverlay visible={closing} message={LOADING_LABELS.closingAccount} />
    </>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: Spacing.sm },
});
