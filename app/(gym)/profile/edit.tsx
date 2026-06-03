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

export default function GymEditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const profile = user?.institutionProfile;

  const [name, setName] = useState(profile?.name ?? '');
  const [description, setDescription] = useState(profile?.description ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);

  const save = () => {
    if (!name.trim()) {
      Alert.alert('Missing info', 'Gym name is required.');
      return;
    }
    updateProfile({
      email: email.trim(),
      avatarUri,
      institutionProfile: {
        name: name.trim(),
        description: description.trim(),
        address: address.trim(),
        city: city.trim(),
        country: country.trim(),
      },
    });
    Alert.alert('Saved', 'Institution profile has been updated.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll>
      <Header title="Edit profile" showBack />
      <AvatarPicker
        uri={avatarUri}
        onChange={setAvatarUri}
        size={96}
        kind="institution"
        label="Logo / photo"
      />
      <Input label="Gym / school name" value={name} onChangeText={setName} />
      <Input label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Describe your facility..."
      />
      <Input label="Address" value={address} onChangeText={setAddress} placeholder="Street address" />
      <Input label="City" value={city} onChangeText={setCity} />
      <Input label="Country" value={country} onChangeText={setCountry} placeholder="e.g. AR" />
      <Button title="Save changes" onPress={save} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}
