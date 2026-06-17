import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarPicker } from '@/components/avatar-picker';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { DISCIPLINES, FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { AUTH_LABELS, BUTTON_LABELS, SCREEN_TITLES, ALERT_LABELS, PROFILE_MENU_LABELS } from '@/constants/labels';
import { validateInstructorProfileForm } from '@/utils/validation';

export default function InstructorEditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const profile = user?.instructorProfile;

  const [displayName, setDisplayName] = useState(profile?.displayName ?? '');
  const [bio, setBio] = useState(profile?.bio ?? '');
  const [hourlyRate, setHourlyRate] = useState(profile?.hourlyRate ?? '');
  const [disciplines, setDisciplines] = useState<string[]>(profile?.disciplines ?? []);
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);
  const [email, setEmail] = useState(user?.email ?? '');

  const toggleDiscipline = (sport: string) => {
    setDisciplines((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport],
    );
  };

  const save = async () => {
    const validation = validateInstructorProfileForm({
      displayName,
      email,
      bio,
      hourlyRate,
    });
    if (!validation.ok) {
      Alert.alert(ALERT_LABELS.validationFailedTitle, validation.message);
      return;
    }

    try {
      await updateProfile({
        email: email.trim(),
        avatarUri,
        instructorProfile: {
          displayName: displayName.trim(),
          bio: bio.trim(),
          hourlyRate: hourlyRate.trim(),
          disciplines,
        },
      });
      Alert.alert(ALERT_LABELS.savedTitle, 'Tu perfil profesional fue actualizado.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(ALERT_LABELS.validationFailedTitle, getErrorMessage(err));
    }
  };

  return (
    <Screen scroll>
      <Header title={SCREEN_TITLES.editProfile} showBack />
      <AvatarPicker uri={avatarUri} onChange={setAvatarUri} size={96} kind="instructor" />
      <Input label="Nombre público" value={displayName} onChangeText={setDisplayName} />
      <Input label={AUTH_LABELS.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input label={AUTH_LABELS.bio} value={bio} onChangeText={setBio} multiline placeholder="Contales a los atletas sobre tu experiencia..." />
      <Input
        label={`Tarifa por hora (${DEFAULT_CURRENCY}, opcional)`}
        value={hourlyRate}
        onChangeText={setHourlyRate}
        keyboardType="decimal-pad"
        placeholder="ej. 1300"
      />

      <Text style={styles.label}>{PROFILE_MENU_LABELS.disciplines}</Text>
      <View style={styles.grid}>
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

      <Button title={BUTTON_LABELS.saveChanges} onPress={save} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: FitnexiaColors.gray700, marginBottom: Spacing.sm },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
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
