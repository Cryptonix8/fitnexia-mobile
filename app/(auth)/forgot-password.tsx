import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { forgotPasswordApi } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { getErrorMessage } from '@/services/api/errors';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');

  return (
    <Screen scroll>
      <Header title="Reset password" showBack />
      <Text style={styles.body}>
        Enter your email and we will send you a link to reset your password.
      </Text>
      <Input
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Button
        title="Send reset link"
        onPress={async () => {
          try {
            await forgotPasswordApi(email.trim());
            Alert.alert('Email sent', 'If an account exists, a reset link will be sent.', [
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
