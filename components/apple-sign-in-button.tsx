import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform, StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/fitnexia';

type AppleSignInButtonProps = {
  onPress: () => void | Promise<void>;
  disabled?: boolean;
};

export function AppleSignInButton({ onPress, disabled = false }: AppleSignInButtonProps) {
  if (Platform.OS !== 'ios') return null;

  return (
    <View style={[styles.wrap, disabled && styles.disabled]} pointerEvents={disabled ? 'none' : 'auto'}>
      <AppleAuthentication.AppleAuthenticationButton
        buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
        buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
        cornerRadius={12}
        style={styles.button}
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: Spacing.md },
  button: { width: '100%', height: 48 },
  disabled: { opacity: 0.6 },
});
