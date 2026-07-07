import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { InstructorPicker } from '@/components/instructor-picker';
import { DateTimeField } from '@/components/date-time-field';
import { FilterChip } from '@/components/ui/filter-chip';
import { FilterSelect } from '@/components/ui/filter-select';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { DISCIPLINES, Spacing } from '@/constants/fitnexia';
import { BUTTON_LABELS, LOADING_LABELS, MODALITY_LABELS, SCREEN_TITLES, CLASS_LEVEL_OPTIONS, CLASS_LANGUAGE_OPTIONS } from '@/constants/labels';
import { getInstitutionById } from '@/data/mock';
import {
  deleteClassSeriesApi,
  pauseClassSeriesApi,
  resumeClassSeriesApi,
} from '@/services/api/classes.api';
import { getErrorMessage } from '@/services/api/errors';
import {
  canManageGymClass,
  computeClassBooked,
  getLinkedInstructors,
  gymLocationLabel,
  resolveInstitutionId,
} from '@/utils/gym-classes';
import { getLinkedInstructorId } from '@/utils/instructor';
import { combineDateAndTime, startAtToPickerValues } from '@/utils/schedule';
import type { ClassFormat, ClassLevel, Modality } from '@/types/api';

export default function EditClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { getClassById, isLoading, updateClass, cancelClass, refreshClasses } = useClasses();
  const cls = getClassById(id ?? '');
  const isGym = user?.role === 'institution';
  const institutionId = resolveInstitutionId(user);
  const instructorId = getLinkedInstructorId(user);
  const linkedInstructors = useMemo(
    () => getLinkedInstructors(user?.institutionProfile?.instructorIds ?? []),
    [user?.institutionProfile?.instructorIds],
  );

  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState<string>(DISCIPLINES[0]);
  const [classFormat, setClassFormat] = useState<ClassFormat>('group');
  const [modality, setModality] = useState<Modality>('in_person');
  const [level, setLevel] = useState<ClassLevel | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('25');
  const [capacity, setCapacity] = useState('12');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [seriesBusy, setSeriesBusy] = useState(false);

  useEffect(() => {
    if (!cls) return;
    const { date, time } = startAtToPickerValues(cls.startAt);
    setTitle(cls.title);
    setDiscipline(cls.discipline);
    setClassFormat(isGym ? 'group' : (cls.classFormat ?? (cls.capacity === 1 ? 'individual' : 'group')));
    setModality(cls.modality);
    setStartDate(date);
    setStartTime(time);
    setDuration(String(cls.durationMinutes));
    setLocation(cls.location?.label ?? '');
    setPrice(String(cls.price.amount / 100));
    setCapacity(String(cls.capacity ?? 12));
    setLevel(cls.level ?? null);
    setLanguage(cls.language ?? null);
    setSelectedInstructorId(cls.instructor.id);
  }, [cls, isGym]);

  useEffect(() => {
    if (!isGym && classFormat === 'individual') {
      setCapacity('1');
    }
  }, [classFormat, isGym]);

  if (!cls) {
    return (
      <Screen loading={isLoading} loadingMessage={LOADING_LABELS.classes}>
        <Header title="Editar clase" showBack />
        {!isLoading ? (
          <Text style={{ color: colors.text }}>{SCREEN_TITLES.classNotFound}</Text>
        ) : null}
      </Screen>
    );
  }

  const canEdit = isGym
    ? canManageGymClass(cls, institutionId)
    : cls.instructor.id === instructorId;

  if (!canEdit) {
    return (
      <Screen>
        <Header title="Editar clase" showBack />
        <Text style={{ color: colors.text }}>Solo podés editar tus propias clases.</Text>
      </Screen>
    );
  }

  const buildUpdates = () => {
    const durationMinutes = parseInt(duration, 10);
    const priceAmount = Math.round(parseFloat(price) * 100);
    const cap = isGym ? parseInt(capacity, 10) : classFormat === 'individual' ? 1 : parseInt(capacity, 10);
    const booked = computeClassBooked(cls);
    const spotsLeft = Math.max(0, cap - booked);
    const startAt = combineDateAndTime(startDate, startTime);
    const instructor = isGym ? linkedInstructors.find((i) => i.id === selectedInstructorId) : null;
    const profile = user?.institutionProfile;
    const mockGym = getInstitutionById(institutionId);

    return {
      title: title.trim(),
      discipline,
      modality,
      classFormat: isGym ? 'group' : classFormat,
      startAt: startAt.toISOString(),
      durationMinutes,
      price: { amount: priceAmount, currency: DEFAULT_CURRENCY },
      capacity: cap,
      spotsLeft,
      level: level ?? undefined,
      language: language ?? undefined,
      instructor: instructor
        ? { id: instructor.id, displayName: instructor.displayName }
        : cls.instructor,
      institution: isGym
        ? {
            id: institutionId,
            name: profile?.name ?? mockGym?.name ?? 'Gimnasio',
          }
        : cls.institution,
      location:
        modality === 'in_person'
          ? isGym
            ? {
                lat: mockGym?.location?.lat ?? -34.6037,
                lng: mockGym?.location?.lng ?? -58.3816,
                label: gymLocationLabel(profile, institutionId),
              }
            : location.trim()
              ? {
                  lat: cls.location?.lat ?? -34.6,
                  lng: cls.location?.lng ?? -58.38,
                  label: location.trim(),
                }
              : undefined
          : undefined,
    };
  };

  const persist = async (editScope?: 'this' | 'following') => {
    setSaving(true);
    try {
      await updateClass(cls.id, buildUpdates(), editScope ? { editScope } : undefined);
      Alert.alert('Guardado', 'Clase actualizada.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const save = () => {
    if (!title.trim()) {
      Alert.alert('Faltan datos', 'El nombre de la clase es obligatorio.');
      return;
    }
    const durationMinutes = parseInt(duration, 10);
    if (Number.isNaN(durationMinutes) || durationMinutes < 15) {
      Alert.alert('Duración inválida', 'La duración debe ser de al menos 15 minutos.');
      return;
    }
    const priceAmount = Math.round(parseFloat(price) * 100);
    if (Number.isNaN(priceAmount) || priceAmount <= 0) {
      Alert.alert('Precio inválido', 'Ingresá un precio válido.');
      return;
    }
    const cap = isGym ? parseInt(capacity, 10) : classFormat === 'individual' ? 1 : parseInt(capacity, 10);
    const isIndividual = !isGym && classFormat === 'individual';
    if (!isIndividual && (Number.isNaN(cap) || cap < 2)) {
      Alert.alert('Cupos inválidos', 'Las clases grupales necesitan al menos 2 cupos.');
      return;
    }

    if (isGym && !selectedInstructorId) {
      Alert.alert('Seleccioná instructor', 'Elegí un instructor vinculado.');
      return;
    }

    if (cls.seriesId) {
      Alert.alert('¿Qué querés cambiar?', 'Esta clase pertenece a una serie recurrente.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Solo esta clase', onPress: () => persist('this') },
        { text: 'Esta y las siguientes', onPress: () => persist('following') },
      ]);
      return;
    }

    void persist();
  };

  const pauseSeries = () => {
    if (!cls.seriesId) return;
    Alert.alert(
      'Pausar serie',
      'Dejará de generarse clases futuras. Las reservas confirmadas se mantienen.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Pausar',
          onPress: async () => {
            setSeriesBusy(true);
            try {
              await pauseClassSeriesApi(cls.seriesId!);
              await refreshClasses();
              Alert.alert('Serie pausada', 'No se crearán nuevas fechas hasta que reanudes la serie.');
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            } finally {
              setSeriesBusy(false);
            }
          },
        },
      ],
    );
  };

  const resumeSeries = () => {
    if (!cls.seriesId) return;
    Alert.alert('Reanudar serie', 'Se volverán a generar clases futuras según los días configurados.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Reanudar',
        onPress: async () => {
          setSeriesBusy(true);
          try {
            await resumeClassSeriesApi(cls.seriesId!);
            await refreshClasses();
            Alert.alert('Serie reanudada', 'Las próximas fechas ya están disponibles.');
          } catch (err) {
            Alert.alert('Error', getErrorMessage(err));
          } finally {
            setSeriesBusy(false);
          }
        },
      },
    ]);
  };

  const deleteSeries = () => {
    if (!cls.seriesId) return;
    Alert.alert(
      'Eliminar serie',
      'Se cancelarán las clases futuras sin reservas. Las que ya tienen reservas deberás cancelarlas manualmente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar serie',
          style: 'destructive',
          onPress: async () => {
            setSeriesBusy(true);
            try {
              await deleteClassSeriesApi(cls.seriesId!);
              await refreshClasses();
              Alert.alert('Serie eliminada', 'Las clases futuras sin reservas fueron canceladas.', [
                { text: 'OK', onPress: () => router.back() },
              ]);
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err));
            } finally {
              setSeriesBusy(false);
            }
          },
        },
      ],
    );
  };

  const remove = () => {
    Alert.alert(
      'Cancelar clase',
      '¿Eliminar esta clase de tu agenda? En producción se reembolsarían las reservas existentes.',
      [
        { text: 'Mantener clase', style: 'cancel' },
        {
          text: 'Cancelar clase',
          style: 'destructive',
          onPress: () => {
            cancelClass(cls.id);
            router.back();
          },
        },
      ],
    );
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);
  const booked = computeClassBooked(cls);

  return (
    <Screen scroll header={<Header title={isGym ? 'Editar clase grupal' : 'Editar clase'} showBack />}>

      {isGym ? (
        <View style={[styles.occupancy, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.occupancyText, { color: colors.textSecondary }]}>
            {booked} / {cls.capacity ?? capacity} reservados
          </Text>
        </View>
      ) : null}

      <Input label="Nombre de la clase" value={title} onChangeText={setTitle} />

      <View style={styles.filterRow}>
        <FilterSelect
          label="Nivel"
          value={level}
          options={[...CLASS_LEVEL_OPTIONS]}
          onChange={(v) => setLevel((v as ClassLevel) || null)}
          placeholder="Nivel"
        />
        <FilterSelect
          label="Idioma"
          value={language}
          options={[...CLASS_LANGUAGE_OPTIONS]}
          onChange={setLanguage}
          placeholder="Idioma"
        />
      </View>

      {isGym ? (
        <InstructorPicker
          instructors={linkedInstructors}
          selectedId={selectedInstructorId}
          onSelect={setSelectedInstructorId}
          label="Asignar instructor"
        />
      ) : null}

      <DateTimeField
        label="Fecha"
        mode="date"
        value={startDate}
        onChange={setStartDate}
        minimumDate={minDate}
      />
      <DateTimeField label="Hora de inicio" mode="time" value={startTime} onChange={setStartTime} />
      <Input
        label="Duración (minutos)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
      />

      {!isGym ? (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Tipo de clase</Text>
          <View style={styles.row}>
            <FilterChip
              label="Individual"
              active={classFormat === 'individual'}
              onPress={() => setClassFormat('individual')}
            />
            <FilterChip
              label="Grupal"
              active={classFormat === 'group'}
              onPress={() => {
                setClassFormat('group');
                if (capacity === '1') setCapacity('12');
              }}
            />
          </View>
        </>
      ) : null}

      <Text style={[styles.label, { color: colors.textSecondary }]}>Disciplina</Text>
      <View style={styles.row}>
        {DISCIPLINES.map((d) => (
          <FilterChip
            key={d}
            label={d}
            active={discipline === d}
            onPress={() => setDiscipline(d)}
          />
        ))}
      </View>

      <Text style={[styles.label, { color: colors.textSecondary }]}>Modalidad</Text>
      <View style={styles.row}>
        <FilterChip
          label={MODALITY_LABELS.inPerson}
          active={modality === 'in_person'}
          onPress={() => setModality('in_person')}
        />
        <FilterChip
          label={MODALITY_LABELS.online}
          active={modality === 'online'}
          onPress={() => setModality('online')}
        />
      </View>

      {!isGym && modality === 'in_person' ? (
        <Input label="Ubicación" value={location} onChangeText={setLocation} />
      ) : null}

      <Input label={`Precio (${DEFAULT_CURRENCY})`} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

      {(isGym || classFormat === 'group') ? (
        <Input
          label="Cupo máximo"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />
      ) : null}

      {cls.seriesId ? (
        <View style={[styles.seriesBox, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.seriesTitle, { color: colors.text }]}>Serie recurrente</Text>
          <Text style={[styles.seriesHint, { color: colors.textMuted }]}>
            Podés pausar la generación de nuevas fechas o eliminar la serie completa.
          </Text>
          <Button
            title="Pausar serie"
            variant="outline"
            onPress={pauseSeries}
            disabled={seriesBusy || saving}
            style={{ marginTop: Spacing.sm }}
          />
          <Button
            title="Reanudar serie"
            variant="outline"
            onPress={resumeSeries}
            disabled={seriesBusy || saving}
            style={{ marginTop: Spacing.sm }}
          />
          <Button
            title="Eliminar serie"
            variant="outline"
            onPress={deleteSeries}
            disabled={seriesBusy || saving}
            style={{ marginTop: Spacing.sm }}
          />
        </View>
      ) : null}

      <Button
        title={saving ? 'Guardando…' : BUTTON_LABELS.saveChanges}
        onPress={save}
        disabled={saving || seriesBusy}
        style={{ marginTop: Spacing.md }}
      />
      <Button title="Cancelar clase" variant="outline" onPress={remove} style={{ marginTop: Spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm },
  occupancy: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  occupancyText: { fontSize: 14, fontWeight: '600' },
  seriesBox: {
    padding: Spacing.md,
    borderRadius: 12,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  seriesTitle: { fontSize: 15, fontWeight: '700', marginBottom: Spacing.xs },
  seriesHint: { fontSize: 13, lineHeight: 20 },
});
