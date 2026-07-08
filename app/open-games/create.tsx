import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Header } from '@/components/ui/header';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Screen } from '@/components/ui/screen';
import { useAppTheme } from '@/contexts/theme-context';
import { COURT_SPORT_OPTIONS } from '@/constants/courts';
import { Radius, Spacing } from '@/constants/fitnexia';
import { getErrorMessage } from '@/services/api/errors';
import { createOpenGameApi } from '@/services/api/open-games.api';
import type { CourtSportType } from '@/services/api/courts.api';

const OPEN_SPORTS: CourtSportType[] = ['padel', 'football_5', 'football_7'];

const LEVEL_OPTIONS = ['Principiante', 'Intermedio', 'Avanzado'];

export default function CreateOpenGameScreen() {
  const { colors } = useAppTheme();
  const [sportType, setSportType] = useState<CourtSportType>('padel');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('19:00');
  const [capacity, setCapacity] = useState('4');
  const [level, setLevel] = useState('');
  const [loading, setLoading] = useState(false);

  const sportOptions = COURT_SPORT_OPTIONS.filter((o) => OPEN_SPORTS.includes(o.value));

  const submit = async () => {
    if (!title.trim() || !date || !time) {
      Alert.alert('Datos incompletos', 'Completá título, fecha y hora.');
      return;
    }
    const cap = Number(capacity);
    if (!Number.isFinite(cap) || cap < 2) {
      Alert.alert('Cupos inválidos', 'La capacidad debe ser al menos 2.');
      return;
    }

    const startAt = new Date(`${date}T${time}:00`).toISOString();
    setLoading(true);
    try {
      const game = await createOpenGameApi({
        sportType,
        title: title.trim(),
        description: description.trim(),
        startAt,
        locationLabel: locationLabel.trim(),
        capacity: cap,
        level: level || undefined,
        durationMinutes: sportType === 'padel' ? 90 : 60,
      });
      Alert.alert('Partido creado', 'Tu sesión ya está visible para otros jugadores.', [
        { text: 'Ver partido', onPress: () => router.replace(`/open-games/${game.id}`) },
      ]);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll header={<Header title="Crear partido" showBack />}>
      <Text style={[styles.label, { color: colors.text }]}>Deporte</Text>
      <View style={styles.chips}>
        {sportOptions.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            active={sportType === opt.value}
            onPress={() => setSportType(opt.value)}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Título</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Ej. Pádel mixto miércoles"
        placeholderTextColor={colors.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      <Text style={[styles.label, { color: colors.text }]}>Descripción (opcional)</Text>
      <TextInput
        style={[styles.input, styles.multiline, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Nivel, reglas, costo de cancha..."
        placeholderTextColor={colors.textMuted}
        value={description}
        onChangeText={setDescription}
        multiline
      />

      <Text style={[styles.label, { color: colors.text }]}>Lugar</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        placeholder="Club, barrio o dirección"
        placeholderTextColor={colors.textMuted}
        value={locationLabel}
        onChangeText={setLocationLabel}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.text }]}>Fecha (AAAA-MM-DD)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="2026-06-20"
            placeholderTextColor={colors.textMuted}
            value={date}
            onChangeText={setDate}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.text }]}>Hora (HH:MM)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
            placeholder="19:00"
            placeholderTextColor={colors.textMuted}
            value={time}
            onChangeText={setTime}
            autoCapitalize="none"
          />
        </View>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Cupos totales (incluyéndote)</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
        keyboardType="number-pad"
        value={capacity}
        onChangeText={setCapacity}
      />

      <Text style={[styles.label, { color: colors.text }]}>Nivel (opcional)</Text>
      <View style={styles.chips}>
        {LEVEL_OPTIONS.map((lvl) => (
          <FilterChip key={lvl} label={lvl} active={level === lvl} onPress={() => setLevel(level === lvl ? '' : lvl)} />
        ))}
      </View>

      <Button title="Publicar partido" onPress={submit} style={{ marginTop: Spacing.lg }} />
      <LoadingOverlay visible={loading} message="Creando partido…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm, marginTop: Spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  row: { flexDirection: 'row', gap: Spacing.md },
  half: { flex: 1 },
});
