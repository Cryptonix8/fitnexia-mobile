import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FilterSelect } from '@/components/ui/filter-select';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { createCourtApi, type CourtSportType } from '@/services/api/courts.api';
import { getErrorMessage } from '@/services/api/errors';

export default function CreateCourtScreen() {
  const { colors } = useAppTheme();
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState<CourtSportType>('padel');
  const [locationType, setLocationType] = useState<'indoor' | 'outdoor'>('outdoor');
  const [hasLighting, setHasLighting] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido');
      return;
    }
    setLoading(true);
    try {
      await createCourtApi({
        name: name.trim(),
        sportType,
        locationType,
        hasLighting,
        surface: 'synthetic',
        operatingHours: {
          mon: { open: '08:00', close: '22:00' },
          tue: { open: '08:00', close: '22:00' },
          wed: { open: '08:00', close: '22:00' },
          thu: { open: '08:00', close: '22:00' },
          fri: { open: '08:00', close: '22:00' },
          sat: { open: '08:00', close: '22:00' },
          sun: { open: '08:00', close: '22:00' },
        },
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll header={<Header title="Nueva cancha" showBack />}>
      <Text style={[styles.label, { color: colors.textMuted }]}>Nombre</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        style={[styles.input, { borderColor: colors.border, color: colors.text }]}
        placeholder="Cancha 1"
        placeholderTextColor={colors.textMuted}
      />

      <FilterSelect
        label="Deporte"
        value={sportType}
        options={[
          { value: 'football_5', label: 'Fútbol 5' },
          { value: 'football_7', label: 'Fútbol 7' },
          { value: 'football_11', label: 'Fútbol 11' },
          { value: 'padel', label: 'Pádel' },
          { value: 'tennis', label: 'Tenis' },
          { value: 'rugby', label: 'Rugby' },
          { value: 'other', label: 'Otro' },
        ]}
        onChange={(v) => setSportType((v as CourtSportType) || 'other')}
        placeholder="Tipo"
      />

      <FilterSelect
        label="Ubicación"
        value={locationType}
        options={[
          { value: 'outdoor', label: 'Outdoor' },
          { value: 'indoor', label: 'Indoor' },
        ]}
        onChange={(v) => setLocationType((v as 'indoor' | 'outdoor') || 'outdoor')}
        placeholder="Indoor/Outdoor"
      />

      <View style={styles.switchRow}>
        <Text style={{ color: colors.text }}>Iluminación</Text>
        <Switch value={hasLighting} onValueChange={setHasLighting} />
      </View>

      <Button title="Guardar" onPress={save} loading={loading} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { marginBottom: Spacing.xs, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
});
