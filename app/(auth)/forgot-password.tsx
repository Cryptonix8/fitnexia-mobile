import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { forgotPasswordApi } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { AUTH_LABELS } from '@/constants/labels';
import { getErrorMessage } from '@/services/api/errors';
import { validateForgotPasswordForm } from '@/utils/validation';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const validation = validateForgotPasswordForm(email);
    if (!validation.ok) {
      Alert.alert('Email inválido', validation.message);
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordApi(email.trim());
      Alert.alert(
        'Email enviado',
        'Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña. Revisá también la carpeta de spam o correo no deseado.',
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Header title="Restablecer contraseña" showBack />
      <Text style={styles.body}>
        Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña. Si no lo ves en unos
        minutos, revisá la carpeta de spam.
      </Text>
      <Input
        label={AUTH_LABELS.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button title="Enviar enlace" disabled={loading} onPress={submit} />
      <LoadingOverlay visible={loading} message="Enviando enlace…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg, lineHeight: 22 },
});
