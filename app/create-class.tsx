import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { InstructorPicker } from '@/components/instructor-picker';
import { DateTimeField } from '@/components/date-time-field';
import { FilterChip } from '@/components/ui/filter-chip';
import { FilterSelect } from '@/components/ui/filter-select';
import { Button } from '@/components/ui/button';
import { LoadingOverlay } from '@/components/ui/loading-overlay';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { DISCIPLINES, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS, MODALITY_LABELS, VERIFICATION_LABELS, CLASS_LEVEL_OPTIONS, CLASS_LANGUAGE_OPTIONS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { fetchLinkedInstructors, type StaffRosterEntry } from '@/services/api/institutions.api';
import { getErrorMessage } from '@/services/api/errors';
import { gymLocationLabel, resolveInstitutionId } from '@/utils/gym-classes';
import { getLinkedInstructorId } from '@/utils/instructor';
import { RecurringClassSection } from '@/components/recurring-class-section';
import { combineDateAndTime, defaultClassStart } from '@/utils/schedule';
import type { ClassFormat, ClassLevel, Modality } from '@/types/api';

export default function CreateClassScreen() {
  const { colors } = useAppTheme();
  const recurringClasses = useFeature('recurringClasses');
  const { user } = useAuth();
  const { addClass, refreshClasses } = useClasses();
  const defaults = defaultClassStart();
  const isGym = user?.role === 'institution';
  const institutionId = resolveInstitutionId(user);
  const institutionProfile = user?.institutionProfile;
  const [linkedInstructors, setLinkedInstructors] = useState<
    Pick<StaffRosterEntry, 'id' | 'displayName' | 'disciplines' | 'photoUrl'>[]
  >([]);
  const [publishing, setPublishing] = useState(false);
  const [instructorsLoading, setInstructorsLoading] = useState(isGym);

  useEffect(() => {
    if (!isGym) return;
    setInstructorsLoading(true);
    fetchLinkedInstructors()
      .then((data) =>
        setLinkedInstructors(
          data.map((i) => ({
            id: i.id,
            displayName: i.displayName,
            disciplines: i.disciplines ?? [],
            photoUrl: i.photoUrl,
          })),
        ),
      )
      .catch(() => setLinkedInstructors([]))
      .finally(() => setInstructorsLoading(false));
  }, [isGym]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discipline, setDiscipline] = useState<string>(DISCIPLINES[0]);
  const [classFormat, setClassFormat] = useState<ClassFormat>('group');
  const [modality, setModality] = useState<Modality>('in_person');
  const [startDate, setStartDate] = useState(defaults.date);
  const [startTime, setStartTime] = useState(defaults.time);
  const [duration, setDuration] = useState('60');
  const [price, setPrice] = useState('25');
  const [capacity, setCapacity] = useState('12');
  const [recurring, setRecurring] = useState(false);
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([]);
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState<ClassLevel | null>(null);
  const [language, setLanguage] = useState<string | null>(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(
    linkedInstructors[0]?.id ?? null,
  );

  useEffect(() => {
    if (isGym && linkedInstructors.length > 0 && !selectedInstructorId) {
      setSelectedInstructorId(linkedInstructors[0].id);
    }
  }, [isGym, linkedInstructors, selectedInstructorId]);

  useEffect(() => {
    if (!isGym && classFormat === 'individual') {
      setCapacity('1');
    }
  }, [classFormat, isGym]);

  useEffect(() => {
    if (isGym) {
      setLocation((prev) => prev || gymLocationLabel(institutionProfile, institutionId));
    }
  }, [isGym, institutionProfile, institutionId]);

  useEffect(() => {
    if (!recurring) return;
    const day = startDate.getDay();
    setSelectedWeekdays((prev) => {
      if (prev.includes(day)) return prev;
      if (prev.length <= 1) return [day];
      return [...prev, day].sort((a, b) => a - b);
    });
  }, [recurring, startDate]);

  const handleRecurringToggle = (enabled: boolean) => {
    setRecurring(enabled);
    if (enabled) {
      setSelectedWeekdays([startDate.getDay()]);
    } else {
      setSelectedWeekdays([]);
    }
  };

  const toggleWeekday = (day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b),
    );
  };

  const publish = async () => {
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

    const startAt = combineDateAndTime(startDate, startTime);
    if (startAt.getTime() <= Date.now()) {
      Alert.alert('Horario inválido', 'La clase debe empezar en el futuro. Elegí una fecha y hora posteriores.');
      return;
    }

    if (recurringClasses && recurring) {
      if (selectedWeekdays.length === 0) {
        Alert.alert('Días requeridos', 'Seleccioná al menos un día de la semana.');
        return;
      }
      if (!selectedWeekdays.includes(startAt.getDay())) {
        Alert.alert(
          'Fecha incompatible',
          'La fecha de inicio debe coincidir con uno de los días seleccionados.',
        );
        return;
      }
    }

    setPublishing(true);

    try {
      const recurrence =
        recurringClasses && recurring
          ? { enabled: true, frequency: 'weekly' as const, weekdays: selectedWeekdays }
          : undefined;

      if (isGym) {
        const cap = parseInt(capacity, 10);
        if (Number.isNaN(cap) || cap < 2) {
          Alert.alert('Cupos inválidos', 'Las clases grupales necesitan al menos 2 cupos.');
          return;
        }
        if (!selectedInstructorId) {
          Alert.alert('Seleccioná instructor', 'Elegí un instructor vinculado para dictar esta clase.');
          return;
        }
        const instructor = linkedInstructors.find((i) => i.id === selectedInstructorId);
        if (!instructor) return;

        await addClass({
          title: title.trim(),
          description: description.trim() || undefined,
          discipline,
          modality,
          classFormat: 'group',
          startAt: startAt.toISOString(),
          durationMinutes,
          price: { amount: priceAmount, currency: DEFAULT_CURRENCY },
          capacity: cap,
          spotsLeft: cap,
          instructor: { id: instructor.id, displayName: instructor.displayName },
          institution: {
            id: institutionId,
            name: institutionProfile?.name ?? 'Gimnasio',
            logoUrl: user?.avatarUri ?? undefined,
          },
          location:
            modality === 'in_person'
              ? {
                  lat: -34.6037,
                  lng: -58.3816,
                  label: location.trim() || gymLocationLabel(institutionProfile, institutionId),
                }
              : undefined,
          recurrence,
          level: level ?? undefined,
          language: language ?? undefined,
        });
      } else {
        if (classFormat === 'group') {
          const cap = parseInt(capacity, 10);
          if (Number.isNaN(cap) || cap < 2) {
            Alert.alert('Cupos inválidos', 'Las clases grupales necesitan al menos 2 cupos.');
            return;
          }
        }

        const instructorCap = classFormat === 'individual' ? 1 : parseInt(capacity, 10);
        await addClass({
          title: title.trim(),
          description: description.trim() || undefined,
          discipline,
          modality,
          classFormat,
          startAt: startAt.toISOString(),
          durationMinutes,
          price: { amount: priceAmount, currency: DEFAULT_CURRENCY },
          capacity: instructorCap,
          spotsLeft: instructorCap,
          instructor: {
            id: getLinkedInstructorId(user),
            displayName: user?.instructorProfile?.displayName ?? 'Instructor',
          },
          location:
            modality === 'in_person' && location.trim()
              ? {
                  lat: -34.6,
                  lng: -58.38,
                  label: location.trim(),
                }
              : undefined,
          recurrence,
          level: level ?? undefined,
          language: language ?? undefined,
        });
      }

      await refreshClasses();
      Alert.alert(
        'Publicada',
        recurrence
          ? `"${title.trim()}" se publicó como serie recurrente. Las próximas fechas ya están visibles en búsqueda.`
          : `"${title.trim()}" ya está disponible.`,
        [{ text: 'OK', onPress: () => router.back() }],
      );
    } catch (err) {
      Alert.alert('Error al publicar', getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <Screen
      scroll
      loading={isGym && instructorsLoading}
      loadingMessage={LOADING_LABELS.roster}
      header={<Header title={isGym ? 'Nueva clase grupal' : 'Nueva clase'} showBack />}>

      {(user?.role === 'instructor' &&
        user.instructorProfile?.verificationStatus !== 'verified' &&
        !user.instructorProfile?.verified) ||
      (user?.role === 'institution' &&
        user.institutionProfile?.verificationStatus !== 'verified' &&
        !user.institutionProfile?.verified) ? (
        <Text style={[styles.unverifiedWarn, { color: colors.warning }]}>
          {VERIFICATION_LABELS.unverifiedPublishHint}
        </Text>
      ) : null}

      {isGym ? (
        <Text style={[styles.gymHint, { color: colors.textMuted }]}>
          Clases grupales en tu gimnasio con cupos limitados. Asigná un instructor vinculado.
        </Text>
      ) : null}

      <Input
        label="Nombre de la clase"
        value={title}
        onChangeText={setTitle}
        placeholder="ej. Yoga matutino"
      />
      <Input
        label="Descripción"
        value={description}
        onChangeText={setDescription}
        placeholder="Qué pueden esperar los atletas..."
        multiline
      />

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

      <Text style={[styles.label, { color: colors.textSecondary }]}>Fecha y hora</Text>
      <DateTimeField
        label="Fecha"
        mode="date"
        value={startDate}
        onChange={setStartDate}
        minimumDate={minDate}
      />
      <DateTimeField label="Hora de inicio" mode="time" value={startTime} onChange={setStartTime} />

      {recurringClasses ? (
        <RecurringClassSection
          enabled={recurring}
          selectedWeekdays={selectedWeekdays}
          startDate={startDate}
          onToggle={handleRecurringToggle}
          onToggleWeekday={toggleWeekday}
        />
      ) : null}

      <Input
        label="Duración (minutos)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        placeholder="ej. 60"
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
          <Text style={[styles.helper, { color: colors.textMuted }]}>
            {classFormat === 'individual'
              ? 'Sesión privada 1 a 1. El cupo es fijo en 1 atleta.'
              : 'Sesión abierta para varios atletas. Definí el cupo máximo abajo.'}
          </Text>
        </>
      ) : (
        <View style={[styles.groupBadge, { backgroundColor: colors.primaryMuted }]}>
          <Text style={[styles.groupBadgeText, { color: colors.primaryText }]}>
            Clase grupal · cupos limitados
          </Text>
        </View>
      )}

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

      {modality === 'in_person' ? (
        <Input
          label="Ubicación"
          value={location}
          onChangeText={setLocation}
          placeholder={isGym ? 'Dirección del gimnasio' : 'Sede, barrio o dirección'}
        />
      ) : (
        <View style={[styles.liveHint, { backgroundColor: colors.primaryMuted }]}>
          <Text style={[styles.liveHintTitle, { color: colors.primary }]}>Clase en vivo en Fitnexia</Text>
          <Text style={[styles.liveHintBody, { color: colors.text }]}>
            Los alumnos entran desde la app con video y audio integrados (LiveKit). No hace falta Zoom
            ni un enlace externo.
          </Text>
        </View>
      )}

      <Input label={`Precio (${DEFAULT_CURRENCY})`} value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

      {!isGym && classFormat === 'individual' ? (
        <View style={[styles.individualCap, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.individualCapText, { color: colors.textSecondary }]}>
            Cupo: 1 atleta
          </Text>
        </View>
      ) : (
        <Input
          label="Cupo máximo"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
          placeholder="ej. 20"
        />
      )}

      {isGym && linkedInstructors.length === 0 ? (
        <Button
          title="Agregá staff primero"
          variant="outline"
          onPress={() => router.push('/(gym)/profile/instructors')}
          style={{ marginBottom: Spacing.sm }}
        />
      ) : null}

      <Button
        title="Publicar clase"
        onPress={publish}
        disabled={publishing || (isGym && linkedInstructors.length === 0)}
        style={{ marginTop: Spacing.md }}
      />

      <LoadingOverlay visible={publishing} message="Publicando clase…" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gymHint: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  unverifiedWarn: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.md, fontWeight: '600' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  helper: { fontSize: 13, lineHeight: 20, marginBottom: Spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm },
  filterRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  groupBadge: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  groupBadgeText: { fontSize: 14, fontWeight: '600' },
  individualCap: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  individualCapText: { fontSize: 15, fontWeight: '500' },
  liveHint: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
    gap: 6,
  },
  liveHintTitle: { fontSize: 14, fontWeight: '700' },
  liveHintBody: { fontSize: 13, lineHeight: 18 },
});
