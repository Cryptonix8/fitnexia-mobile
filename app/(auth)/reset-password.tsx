import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { resetPasswordApi } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { AUTH_LABELS, BUTTON_LABELS } from '@/constants/labels';
import { getErrorMessage } from '@/services/api/errors';
import { validateResetPasswordForm } from '@/utils/validation';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const resetToken = typeof token === 'string' ? token.trim() : '';

  if (!resetToken) {
    return (
      <Screen scroll>
        <Header title="Nueva contraseña" showBack />
        <Text style={styles.body}>
          El enlace de restablecimiento no es válido. Pedí uno nuevo desde la pantalla de inicio de
          sesión.
        </Text>
        <Button title="Volver al inicio de sesión" onPress={() => router.replace('/(auth)/login')} />
      </Screen>
    );
  }

  const submit = async () => {
    const validation = validateResetPasswordForm(password, confirmPassword);
    if (!validation.ok) {
      Alert.alert('Datos inválidos', validation.message);
      return;
    }

    setLoading(true);
    try {
      await resetPasswordApi(resetToken, password);
      Alert.alert('Contraseña actualizada', 'Ya podés iniciar sesión con tu nueva contraseña.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (err) {
      Alert.alert('No se pudo restablecer la contraseña', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="Nueva contraseña" showBack />
      <Text style={styles.body}>Elegí una contraseña nueva para tu cuenta.</Text>
      <Input
        label={AUTH_LABELS.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <Input
        label="Confirmar contraseña"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />
      <Button title={BUTTON_LABELS.save} disabled={loading} onPress={submit} />
      <LoadingOverlay visible={loading} message="Guardando contraseña…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg, lineHeight: 22 },
});
