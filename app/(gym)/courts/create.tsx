import { router } from 'expo-router';
import { useState } from 'react';
import { Alert } from 'react-native';

import { CourtFormFields } from '@/components/courts/court-form-fields';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Screen } from '@/components/ui/screen';
import { defaultCourtOperatingHours } from '@/constants/courts';
import { createCourtApi, type CourtSportType } from '@/services/api/courts.api';
import { getErrorMessage } from '@/services/api/errors';

export default function CreateCourtScreen() {
  const [name, setName] = useState('');
  const [sportType, setSportType] = useState<CourtSportType>('padel');
  const [surface, setSurface] = useState('synthetic');
  const [locationType, setLocationType] = useState<'indoor' | 'outdoor'>('outdoor');
  const [hasLighting, setHasLighting] = useState(false);
  const [operatingHours, setOperatingHours] = useState(defaultCourtOperatingHours());
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Ingresá un nombre para la cancha.');
      return;
    }
    setLoading(true);
    try {
      await createCourtApi({
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
      setLoading(false);
    }
  };

  return (
    <Screen scroll header={<Header title="Nueva cancha" showBack />}>
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
      <Button title="Guardar cancha" onPress={save} loading={loading} />
    </Screen>
  );
}
