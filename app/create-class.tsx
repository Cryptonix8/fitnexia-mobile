import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { InstructorPicker } from '@/components/instructor-picker';
import { DateTimeField } from '@/components/date-time-field';
import { FilterChip } from '@/components/ui/filter-chip';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { useAuth } from '@/contexts/auth-context';
import { useClasses } from '@/contexts/classes-context';
import { useAppTheme } from '@/contexts/theme-context';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { DISCIPLINES, Spacing } from '@/constants/fitnexia';
import { MODALITY_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { fetchLinkedInstructors, type StaffRosterEntry } from '@/services/api/institutions.api';
import { getErrorMessage } from '@/services/api/errors';
import { gymLocationLabel, resolveInstitutionId } from '@/utils/gym-classes';
import { getLinkedInstructorId } from '@/utils/instructor';
import { combineDateAndTime, defaultClassStart } from '@/utils/schedule';
import type { ClassFormat, Modality } from '@/types/api';

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

  useEffect(() => {
    if (!isGym) return;
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
      .catch(() => setLinkedInstructors([]));
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
    setPublishing(true);

    try {
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
                  label: gymLocationLabel(institutionProfile, institutionId),
                }
              : undefined,
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
        });
      }

      await refreshClasses();
      Alert.alert('Publicada', `"${title.trim()}" ya está disponible.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Error al publicar', getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <Screen scroll>
      <Header title={isGym ? 'Nueva clase grupal' : 'Nueva clase'} showBack />

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
        {DISCIPLINES.slice(0, 5).map((d) => (
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

      {!isGym && recurringClasses ? (
        <View style={styles.recurRow}>
          <FilterChip
            label={recurring ? '✓ Se repite semanalmente' : 'Repetir semanalmente'}
            active={recurring}
            onPress={() => setRecurring(!recurring)}
          />
        </View>
      ) : null}

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
        loading={publishing}
        onPress={publish}
        disabled={isGym && linkedInstructors.length === 0}
        style={{ marginTop: Spacing.md }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gymHint: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.md },
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  helper: { fontSize: 13, lineHeight: 20, marginBottom: Spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm },
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
  recurRow: { flexDirection: 'row', marginBottom: Spacing.md },
});
