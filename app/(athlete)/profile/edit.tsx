import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AvatarPicker } from '@/components/avatar-picker';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { Spacing } from '@/constants/fitnexia';

export default function EditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);

  const save = () => {
    if (!firstName.trim() || !lastName.trim()) {
      Alert.alert('Missing info', 'First and last name are required.');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Missing info', 'Email is required.');
      return;
    }

    updateProfile({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      avatarUri,
    });
    Alert.alert('Saved', 'Your profile has been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll>
      <Header title="Edit profile" showBack />
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
      <Button title="Save changes" onPress={save} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}
