import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPicker } from '@/components/avatar-picker';
import { RoleCard } from '@/components/role-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { DISCIPLINES, FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import type { UserRole } from '@/types/api';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<UserRole>('athlete');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [favoriteSports, setFavoriteSports] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleSport = (sport: string) => {
    setFavoriteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  };

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await register({
        email: email.trim(),
        password,
        role,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        avatarUri,
        favoriteSports: role === 'athlete' ? favoriteSports : [],
      });
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll>
      <Pressable onPress={() => (step === 1 ? router.back() : setStep(1))}>
        <Text style={styles.back}>← Back</Text>
      </Pressable>
      <Text style={styles.title}>{step === 1 ? 'Choose your profile' : 'Create account'}</Text>
      <Text style={styles.sub}>
        {step === 1 ? 'How will you use Fitnexia?' : 'Complete your basic profile'}
      </Text>

      {step === 1 ? (
        <>
          <RoleCard role="athlete" selected={role === 'athlete'} onPress={() => setRole('athlete')} />
          <RoleCard
            role="instructor"
            selected={role === 'instructor'}
            onPress={() => setRole('instructor')}
          />
          <RoleCard
            role="institution"
            selected={role === 'institution'}
            onPress={() => setRole('institution')}
          />
          <Button title="Continue" onPress={() => setStep(2)} />
        </>
      ) : (
        <>
          <AvatarPicker uri={avatarUri} onChange={setAvatarUri} size={96} />
          <Input label="First name" value={firstName} onChangeText={setFirstName} />
          <Input label="Last name" value={lastName} onChangeText={setLastName} />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          {role === 'athlete' ? (
            <>
              <Text style={styles.sportsLabel}>Favorite sports (optional)</Text>
              <View style={styles.sportsGrid}>
                {DISCIPLINES.map((sport) => {
                  const active = favoriteSports.includes(sport);
                  return (
                    <Pressable
                      key={sport}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleSport(sport)}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{sport}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

          <Button title="Create account" loading={loading} onPress={submit} />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { color: FitnexiaColors.primary, fontWeight: '600', marginTop: Spacing.md },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FitnexiaColors.gray900,
    marginTop: Spacing.md,
  },
  sub: { fontSize: 15, color: FitnexiaColors.gray500, marginBottom: Spacing.lg },
  sportsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FitnexiaColors.gray700,
    marginBottom: Spacing.sm,
  },
  sportsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.lg },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: FitnexiaColors.white,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
  },
  chipActive: { backgroundColor: FitnexiaColors.primary, borderColor: FitnexiaColors.primary },
  chipText: { fontSize: 14, color: FitnexiaColors.gray700 },
  chipTextActive: { color: FitnexiaColors.white, fontWeight: '600' },
});
