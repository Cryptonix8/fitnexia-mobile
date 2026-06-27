import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { createGymJobApi } from '@/services/api/institutions.api';

export default function CreateGymJobScreen() {
  const { colors } = useAppTheme();
  const [title, setTitle] = useState('');
  const [roleType, setRoleType] = useState('instructor');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const publish = async () => {
    if (!title.trim()) {
      Alert.alert('Falta el título', 'Ingresá un título para la oferta.');
      return;
    }
    setSaving(true);
    try {
      await createGymJobApi({
        title: title.trim(),
        roleType,
        description: description.trim(),
        status: 'open',
      });
      Alert.alert('Publicada', 'La oferta ya está visible para instructores.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll header={<Header title="Nueva oferta" showBack />}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Los instructores registrados podrán ver y postularse a esta búsqueda.
      </Text>
      <Input label="Título" value={title} onChangeText={setTitle} placeholder="ej. Instructor de yoga" />
      <Input label="Rol" value={roleType} onChangeText={setRoleType} placeholder="instructor" />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Horarios, requisitos, remuneración…"
      />
      <Button title="Publicar" onPress={publish} disabled={saving} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 14, marginBottom: Spacing.md },
});
