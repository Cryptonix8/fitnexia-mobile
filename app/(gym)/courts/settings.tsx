import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FilterSelect } from '@/components/ui/filter-select';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import { COURT_SLOT_DURATION_OPTIONS } from '@/constants/courts';
import { LOADING_LABELS } from '@/constants/labels';
import { fetchCourtSettings, updateCourtSettings } from '@/services/api/courts.api';
import { getErrorMessage } from '@/services/api/errors';

export default function GymCourtSettingsScreen() {
  const { colors } = useAppTheme();
  const [cancellationHours, setCancellationHours] = useState('24');
  const [slotMinutes, setSlotMinutes] = useState('60');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchCourtSettings()
        .then((s) => {
          setCancellationHours(String(s.cancellationPolicyHours));
          setSlotMinutes(String(s.defaultSlotMinutes));
        })
        .finally(() => setLoading(false));
    }, []),
  );

  const save = async () => {
    const hours = Number(cancellationHours);
    const slot = Number(slotMinutes);
    if (!hours || hours < 1) {
      Alert.alert('Política inválida', 'Ingresá las horas mínimas antes del turno.');
      return;
    }
    setSaving(true);
    try {
      await updateCourtSettings({
        cancellationPolicyHours: hours,
        defaultSlotMinutes: slot,
      });
      Alert.alert('Guardado', 'La configuración de canchas fue actualizada.');
      router.back();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen
      scroll
      loading={loading}
      loadingMessage={LOADING_LABELS.default}
      header={<Header title="Configuración de canchas" showBack />}>
      <Text style={[styles.intro, { color: colors.textMuted }]}>
        Definí la duración de cada turno y cuántas horas antes se permite cancelar con reembolso.
      </Text>

      <Input
        label="Cancelación (horas antes)"
        value={cancellationHours}
        onChangeText={setCancellationHours}
        keyboardType="number-pad"
        placeholder="24"
      />
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Los socios y usuarios solo pueden cancelar con reembolso si lo hacen al menos esta cantidad
        de horas antes del turno.
      </Text>

      <FilterSelect
        label="Duración del turno"
        value={slotMinutes}
        options={[...COURT_SLOT_DURATION_OPTIONS]}
        onChange={(v) => setSlotMinutes(v || '60')}
        placeholder="Duración"
      />

      <Button title="Guardar configuración" onPress={save} loading={saving} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.lg },
  hint: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.lg },
});
