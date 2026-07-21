import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { GoogleSignInButton } from '@/components/google-sign-in-button';
import { AppleSignInButton } from '@/components/apple-sign-in-button';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage, useAuth } from '@/contexts/auth-context';
import { FitnexiaColors, Spacing } from '@/constants/fitnexia';
import { ALERT_LABELS, AUTH_LABELS, BUTTON_LABELS } from '@/constants/labels';
import { consumeSessionExpiredAlertPending } from '@/utils/auth-navigation';
import { useFeature } from '@/hooks/use-feature';
import { useGoogleSignIn } from '@/hooks/use-google-sign-in';
import { useAppleSignIn } from '@/hooks/use-apple-sign-in';
import { useAppleSignInFeature } from '@/hooks/use-apple-sign-in-feature';
import { completeGoogleSignIn } from '@/utils/google-auth';
import { completeAppleSignIn } from '@/utils/apple-auth';
import { validateLoginForm } from '@/utils/validation';

export default function LoginScreen() {
  const { expired } = useLocalSearchParams<{ expired?: string }>();
  const googleSignIn = useFeature('googleSignIn');
  const appleSignIn = useAppleSignInFeature();
  const passwordRecovery = useFeature('passwordRecovery');
  const { login, loginWithGoogle, loginWithApple } = useAuth();
  const { signIn: getGoogleIdToken, pending: googlePending, ready: googleReady } = useGoogleSignIn();
  const { signIn: appleSignInFn, pending: applePending, ready: appleReady } = useAppleSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expired !== '1' && !consumeSessionExpiredAlertPending()) return;
    Alert.alert(AUTH_LABELS.sessionExpiredTitle, AUTH_LABELS.sessionExpiredMessage);
  }, [expired]);

  const handleLogin = async () => {
    const validation = validateLoginForm(email, password);
    if (!validation.ok) {
      Alert.alert(ALERT_LABELS.validationFailedTitle, validation.message);
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      Alert.alert('Error al iniciar sesión', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await completeGoogleSignIn({
      loginWithGoogle,
      getIdToken: getGoogleIdToken,
    });
  };

  const handleAppleSignIn = async () => {
    await completeAppleSignIn({
      loginWithApple,
      signIn: appleSignInFn,
    });
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

      {passwordRecovery ? (
        <Pressable onPress={() => router.push('/forgot-password')}>
          <Text style={styles.forgot}>¿Olvidaste tu contraseña?</Text>
        </Pressable>
      ) : null}

      <Button title={BUTTON_LABELS.signIn} disabled={loading} onPress={handleLogin} />

      {googleSignIn ? (
        <GoogleSignInButton
          onPress={handleGoogleSignIn}
          disabled={!googleReady || loading || googlePending || applePending}
        />
      ) : null}

      {appleSignIn && appleReady ? (
        <AppleSignInButton
          onPress={handleAppleSignIn}
          disabled={loading || googlePending || applePending}
        />
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿Sos nuevo? </Text>
        <Pressable onPress={() => router.push('/register')}>
          <Text style={styles.link}>Crear cuenta</Text>
        </Pressable>
      </View>

      <LoadingOverlay
        visible={loading || googlePending || applePending}
        message={
          applePending
            ? 'Iniciando sesión con Apple…'
            : googlePending
              ? 'Iniciando sesión con Google…'
              : 'Iniciando sesión…'
        }
      />
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
