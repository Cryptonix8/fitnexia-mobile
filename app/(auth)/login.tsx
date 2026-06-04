import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { AUTH_LABELS, BUTTON_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import type { UserRole } from '@/types/api';

export default function LoginScreen() {
  const googleSignIn = useFeature('googleSignIn');
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@fitnexia.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (role?: UserRole) => {
    setLoading(true);
    try {
      await login(email, password, role);
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Text style={styles.logo}>Fitnexia</Text>
      <Text style={styles.title}>{AUTH_LABELS.welcomeBack}</Text>
      <Text style={styles.sub}>{AUTH_LABELS.signInSubtitle}</Text>

      <Input
        label={AUTH_LABELS.email}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input
        label={AUTH_LABELS.password}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable onPress={() => router.push('/(auth)/forgot-password')}>
        <Text style={styles.forgot}>Forgot password?</Text>
      </Pressable>

      <Button title={BUTTON_LABELS.signIn} loading={loading} onPress={() => handleLogin()} />

      {googleSignIn ? (
        <Pressable
          style={styles.google}
          onPress={() => Alert.alert('Google Sign-In', 'Connect when backend is ready.')}>
          <Ionicons name="logo-google" size={20} color={FitnexiaColors.gray700} />
          <Text style={styles.googleText}>Continue with Google</Text>
        </Pressable>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>New here? </Text>
        <Pressable onPress={() => router.push('/(auth)/register')}>
          <Text style={styles.link}>Create account</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: FitnexiaColors.primary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  title: { fontSize: 28, fontWeight: '800', color: FitnexiaColors.gray900 },
  sub: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  forgot: {
    color: FitnexiaColors.primary,
    fontWeight: '600',
    textAlign: 'right',
    marginBottom: Spacing.lg,
    marginTop: -Spacing.sm,
  },
  google: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: FitnexiaColors.white,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: Spacing.md,
  },
  googleText: { fontSize: 16, fontWeight: '600', color: FitnexiaColors.gray700 },
  demoLabel: {
    fontSize: 12,
    color: FitnexiaColors.gray500,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  demoRow: { flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.xl },
  footerText: { color: FitnexiaColors.gray500 },
  link: { color: FitnexiaColors.primary, fontWeight: '700' },
});
