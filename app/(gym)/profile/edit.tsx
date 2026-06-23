import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { AvatarPicker } from '@/components/avatar-picker';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth, getErrorMessage } from '@/contexts/auth-context';
import { Spacing } from '@/constants/fitnexia';
import { AUTH_LABELS, BUTTON_LABELS, SCREEN_TITLES, ALERT_LABELS } from '@/constants/labels';
import { validateInstitutionProfileForm } from '@/utils/validation';

export default function GymEditProfileScreen() {
  const { user, updateProfile } = useAuth();
  const profile = user?.institutionProfile;

  const [name, setName] = useState(profile?.name ?? '');
  const [description, setDescription] = useState(profile?.description ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [country, setCountry] = useState(profile?.country ?? '');
  const [contactPhone, setContactPhone] = useState(profile?.contactPhone ?? '');
  const [contactEmail, setContactEmail] = useState(profile?.contactEmail ?? '');
  const [website, setWebsite] = useState(profile?.website ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user?.avatarUri ?? null);

  const save = async () => {
    const validation = validateInstitutionProfileForm({
      name,
      email,
      description,
      address,
      city,
      country,
    });
    if (!validation.ok) {
      Alert.alert(ALERT_LABELS.validationFailedTitle, validation.message);
      return;
    }

    try {
      await updateProfile({
        email: email.trim(),
        avatarUri,
        institutionProfile: {
          name: name.trim(),
          description: description.trim(),
          address: address.trim(),
          city: city.trim(),
          country: country.trim().toUpperCase(),
          contactPhone: contactPhone.trim(),
          contactEmail: contactEmail.trim(),
          website: website.trim(),
        },
      });
      Alert.alert(ALERT_LABELS.savedTitle, 'El perfil de la institución fue actualizado.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert(ALERT_LABELS.validationFailedTitle, getErrorMessage(err));
    }
  };

  return (
    <Screen scroll>
      <Header title={SCREEN_TITLES.editProfile} showBack />
      <AvatarPicker
        uri={avatarUri}
        onChange={setAvatarUri}
        size={96}
        kind="institution"
        label={AUTH_LABELS.logoPhoto}
      />
      <Input label={AUTH_LABELS.gymSchoolName} value={name} onChangeText={setName} />
      <Input label={AUTH_LABELS.email} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Describí tu instalación..."
      />
      <Input label="Dirección" value={address} onChangeText={setAddress} placeholder="Calle y número" />
      <Input label="Ciudad" value={city} onChangeText={setCity} />
      <Input label="País" value={country} onChangeText={setCountry} placeholder="ej. AR" />
      <Input
        label="Teléfono del club"
        value={contactPhone}
        onChangeText={setContactPhone}
        keyboardType="phone-pad"
      />
      <Input
        label="Email de contacto del club"
        value={contactEmail}
        onChangeText={setContactEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Input label="Sitio web" value={website} onChangeText={setWebsite} autoCapitalize="none" />
      <Button title={BUTTON_LABELS.saveChanges} onPress={save} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}
