import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';

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
        onPress={() => {
          Alert.alert('Email sent', 'Reset flow will connect to the API later.', [
            { text: 'OK', onPress: () => router.back() },
          ]);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
});
