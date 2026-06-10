import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { forgotPasswordApi } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { AUTH_LABELS } from '@/constants/labels';
import { getErrorMessage } from '@/services/api/errors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  return (
    <Screen scroll>
      <Header title="Restablecer contraseña" showBack />
      <Text style={styles.body}>
        Ingresá tu email y te enviaremos un enlace para restablecer tu contraseña.
      </Text>
      <Input
        label={AUTH_LABELS.email}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button
        title="Enviar enlace"
        onPress={async () => {
          try {
            await forgotPasswordApi(email.trim());
            Alert.alert('Email enviado', 'Si existe una cuenta, se enviará un enlace de restablecimiento.', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
});
