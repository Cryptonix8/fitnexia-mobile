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
import { ALERT_LABELS, AUTH_LABELS, BUTTON_LABELS } from '@/constants/labels';
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
  const [disciplines, setDisciplines] = useState<string[]>([]);
  const [institutionName, setInstitutionName] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleSport = (sport: string) => {
    setFavoriteSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  };

  const toggleDiscipline = (sport: string) => {
    setDisciplines((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  };

  const submit = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim()) {
      Alert.alert(ALERT_LABELS.missingInfoTitle, ALERT_LABELS.fillAllFields);
      return;
    }
    if (role === 'institution' && !institutionName.trim()) {
      Alert.alert(ALERT_LABELS.missingInfoTitle, ALERT_LABELS.gymNameRequired);
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
        disciplines: role === 'instructor' ? disciplines : [],
        institutionName: role === 'institution' ? institutionName.trim() : undefined,
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
      <Text style={styles.title}>
        {step === 1 ? AUTH_LABELS.chooseProfile : AUTH_LABELS.createAccount}
      </Text>
      <Text style={styles.sub}>
        {step === 1 ? AUTH_LABELS.howWillYouUse : AUTH_LABELS.completeProfile}
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
          <Button title={BUTTON_LABELS.continue} onPress={() => setStep(2)} />
        </>
      ) : (
        <>
          <AvatarPicker
            uri={avatarUri}
            onChange={setAvatarUri}
            size={96}
            kind={role === 'institution' ? 'institution' : role === 'instructor' ? 'instructor' : 'user'}
            label={role === 'institution' ? AUTH_LABELS.logoPhoto : AUTH_LABELS.profilePhoto}
          />
          {role === 'institution' ? (
            <Input
              label={AUTH_LABELS.gymSchoolName}
              value={institutionName}
              onChangeText={setInstitutionName}
              placeholder={AUTH_LABELS.gymSchoolPlaceholder}
            />
          ) : null}
          <Input label={AUTH_LABELS.firstName} value={firstName} onChangeText={setFirstName} />
          <Input label={AUTH_LABELS.lastName} value={lastName} onChangeText={setLastName} />
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

          {role === 'instructor' ? (
            <>
              <Text style={styles.sportsLabel}>Disciplines (optional)</Text>
              <View style={styles.sportsGrid}>
                {DISCIPLINES.map((sport) => {
                  const active = disciplines.includes(sport);
                  return (
                    <Pressable
                      key={sport}
                      style={[styles.chip, active && styles.chipActive]}
                      onPress={() => toggleDiscipline(sport)}>
                      <Text style={[styles.chipText, active && styles.chipTextActive]}>{sport}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </>
          ) : null}

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

          <Button title={BUTTON_LABELS.createAccount} loading={loading} onPress={submit} />
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
