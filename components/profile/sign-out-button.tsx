import { StyleSheet } from 'react-native';

import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, LOADING_LABELS } from '@/constants/labels';
import { useSignOut } from '@/hooks/use-sign-out';

export function SignOutButton() {
  const { signOut, signingOut } = useSignOut();

  return (
    <>
      <Button
        title={BUTTON_LABELS.signOut}
        variant="outline"
        icon="log-out-outline"
        onPress={signOut}
        disabled={signingOut}
        style={styles.button}
      />
      <LoadingOverlay visible={signingOut} message={LOADING_LABELS.signingOut} />
    </>
  );
}

const styles = StyleSheet.create({
  button: { marginTop: Spacing.lg },
});
