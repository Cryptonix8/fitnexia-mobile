import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { AvatarPicker } from '@/components/avatar-picker';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { Spacing } from '@/constants/fitnexia';
import { AUTH_LABELS, BUTTON_LABELS, SCREEN_TITLES, ALERT_LABELS } from '@/constants/labels';
import { validateAthleteProfileForm } from '@/utils/validation';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);

  useEffect(() => {
    setAvatarUri(user?.avatarUri ?? null);
  }, [user?.avatarUri]);

  const save = async () => {
    const validation = validateAthleteProfileForm({ firstName, lastName, email });
    if (!validation.ok) {
      Alert.alert(ALERT_LABELS.validationFailedTitle, validation.message);
      return;
    }

    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        avatarUri,
      });
      Alert.alert(ALERT_LABELS.savedTitle, 'Tu perfil fue actualizado.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(ALERT_LABELS.validationFailedTitle, getErrorMessage(err));
    }
  };

  return (
    <Screen scroll header={<Header title={SCREEN_TITLES.editProfile} showBack />}>
      <AvatarPicker uri={avatarUri} onChange={setAvatarUri} size={96} />
      <Input label={AUTH_LABELS.firstName} value={firstName} onChangeText={setFirstName} />
      <Input label={AUTH_LABELS.lastName} value={lastName} onChangeText={setLastName} />
      <Input
        label={AUTH_LABELS.email}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Button title={BUTTON_LABELS.saveChanges} onPress={save} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}
