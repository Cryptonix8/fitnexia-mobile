import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, StyleSheet, Text } from 'react-native';

import { Header } from '@/components/ui/header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { getErrorMessage } from '@/contexts/auth-context';
import { useAppTheme } from '@/contexts/theme-context';
import { Spacing } from '@/constants/fitnexia';
import {
  fetchMembershipSettings,
  updateMembershipSettingsApi,
} from '@/services/api/institutions.api';
import type { MembershipSettings } from '@/types/api';

export default function GymMembershipSettingsScreen() {
  const { colors } = useAppTheme();
  const [graceDays, setGraceDays] = useState('7');
  const [dueReminderDays, setDueReminderDays] = useState('3');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const settings: MembershipSettings = await fetchMembershipSettings();
      setGraceDays(String(settings.graceDays));
      setDueReminderDays(String(settings.dueReminderDays));
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
      router.back();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    const grace = parseInt(graceDays, 10);
    const reminder = parseInt(dueReminderDays, 10);
    if (Number.isNaN(grace) || grace < 0 || Number.isNaN(reminder) || reminder < 1) {
      Alert.alert('Datos inválidos', 'Revisá los días de gracia y recordatorio.');
      return;
    }
    setSaving(true);
    try {
      await updateMembershipSettingsApi({ graceDays: grace, dueReminderDays: reminder });
      Alert.alert('Guardado', 'Ajustes de cuotas actualizados.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll loading={loading} loadingMessage="Cargando ajustes…" header={<Header title="Ajustes de cuotas" showBack />}>
      <Text style={[styles.hint, { color: colors.textMuted }]}>
        Configurá recordatorios automáticos y días de gracia antes de marcar mora.
      </Text>
      <Input
        label="Días de gracia"
        value={graceDays}
        onChangeText={setGraceDays}
        keyboardType="number-pad"
        placeholder="7"
      />
      <Input
        label="Recordatorio (días antes del vencimiento)"
        value={dueReminderDays}
        onChangeText={setDueReminderDays}
        keyboardType="number-pad"
        placeholder="3"
      />
      <Button title="Guardar" onPress={save} disabled={saving} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: { fontSize: 14, marginBottom: Spacing.md },
});
