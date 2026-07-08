import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { CourtFormFields } from '@/components/courts/court-form-fields';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { defaultCourtOperatingHours } from '@/constants/courts';
import {
  deleteCourtApi,
  fetchGymCourts,
  updateCourtApi,
  type CourtSportType,
} from '@/services/api/courts.api';
import { getErrorMessage } from '@/services/api/errors';

export default function EditCourtScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState<CourtSportType>('padel');
  const [surface, setSurface] = useState('synthetic');
  const [locationType, setLocationType] = useState<'indoor' | 'outdoor'>('outdoor');
  const [hasLighting, setHasLighting] = useState(false);
  const [operatingHours, setOperatingHours] = useState(defaultCourtOperatingHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchGymCourts()
      .then((courts) => {
        const court = courts.find((c) => c.id === id);
        if (!court) return;
        setName(court.name);
        setSportType(court.sportType);
        setSurface(court.surface);
        setLocationType(court.locationType);
        setHasLighting(court.hasLighting);
        setOperatingHours(court.operatingHours ?? defaultCourtOperatingHours());
      })
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    if (!id || !name.trim()) {
      Alert.alert('Nombre requerido');
      return;
    }
    setSaving(true);
    try {
      await updateCourtApi(id, {
        name: name.trim(),
        sportType,
        surface,
        locationType,
        hasLighting,
        operatingHours,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deactivate = () => {
    Alert.alert('Desactivar cancha', '¿La cancha dejará de mostrarse para reservas?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desactivar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteCourtApi(id!);
            router.back();
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          }
        },
      },
    ]);
  };

  return (
    <Screen scroll loading={loading} header={<Header title="Editar cancha" showBack />}>
      <CourtFormFields
        name={name}
        sportType={sportType}
        surface={surface}
        locationType={locationType}
        hasLighting={hasLighting}
        operatingHours={operatingHours}
        onChangeName={setName}
        onChangeSportType={setSportType}
        onChangeSurface={setSurface}
        onChangeLocationType={setLocationType}
        onChangeLighting={setHasLighting}
        onChangeHours={setOperatingHours}
      />
      <Button title="Guardar cambios" onPress={save} loading={saving} style={{ marginBottom: 16 }} />
      <Button title="Desactivar cancha" variant="outline" onPress={deactivate} style={{ marginBottom: 16 }} />
    </Screen>
  );
}
