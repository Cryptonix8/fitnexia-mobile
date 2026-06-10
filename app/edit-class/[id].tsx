import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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
import { BUTTON_LABELS, MODALITY_LABELS, SCREEN_TITLES } from '@/constants/labels';
import { getInstitutionById } from '@/data/mock';
import {
  canManageGymClass,
  computeClassBooked,
  getLinkedInstructors,
  gymLocationLabel,
  resolveInstitutionId,
} from '@/utils/gym-classes';
import { getLinkedInstructorId } from '@/utils/instructor';
import { combineDateAndTime } from '@/utils/schedule';
import type { ClassFormat, Modality } from '@/types/api';

export default function EditClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { getClassById, updateClass, cancelClass } = useClasses();
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
  const [startDate, setStartDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [duration, setDuration] = useState('60');
  const [location, setLocation] = useState('');
  const [price, setPrice] = useState('25');
  const [capacity, setCapacity] = useState('12');
  const [selectedInstructorId, setSelectedInstructorId] = useState<string | null>(null);

  useEffect(() => {
    if (!cls) return;
    const start = new Date(cls.startAt);
    setTitle(cls.title);
    setDiscipline(cls.discipline);
    setClassFormat(isGym ? 'group' : (cls.classFormat ?? (cls.capacity === 1 ? 'individual' : 'group')));
    setModality(cls.modality);
    setStartDate(start);
    setStartTime(start);
    setDuration(String(cls.durationMinutes));
    setLocation(cls.location?.label ?? '');
    setPrice(String(cls.price.amount / 100));
    setCapacity(String(cls.capacity ?? 12));
    setSelectedInstructorId(cls.instructor.id);
  }, [cls, isGym]);

  useEffect(() => {
    if (!isGym && classFormat === 'individual') {
      setCapacity('1');
    }
  }, [classFormat, isGym]);

  if (!cls) {
    return (
      <Screen>
        <Header title="Editar clase" showBack />
        <Text style={{ color: colors.text }}>{SCREEN_TITLES.classNotFound}</Text>
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
    if (Number.isNaN(cap) || cap < 2) {
      Alert.alert('Cupos inválidos', 'Las clases grupales necesitan al menos 2 cupos.');
      return;
    }

    if (isGym && !selectedInstructorId) {
      Alert.alert('Seleccioná instructor', 'Elegí un instructor vinculado.');
      return;
    }

    const booked = computeClassBooked(cls);
    const spotsLeft = Math.max(0, cap - booked);
    const startAt = combineDateAndTime(startDate, startTime);

    const instructor = isGym
      ? linkedInstructors.find((i) => i.id === selectedInstructorId)
      : null;

    const profile = user?.institutionProfile;
    const mockGym = getInstitutionById(institutionId);

    updateClass(cls.id, {
      title: title.trim(),
      discipline,
      modality,
      classFormat: isGym ? 'group' : classFormat,
      startAt: startAt.toISOString(),
      durationMinutes,
      price: { amount: priceAmount, currency: DEFAULT_CURRENCY },
      capacity: cap,
      spotsLeft,
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
    });

    Alert.alert('Guardado', 'Clase actualizada.', [{ text: 'OK', onPress: () => router.back() }]);
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
    <Screen scroll>
      <Header title={isGym ? 'Editar clase grupal' : 'Editar clase'} showBack />

      {isGym ? (
        <View style={[styles.occupancy, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.occupancyText, { color: colors.textSecondary }]}>
            {booked} / {cls.capacity ?? capacity} reservados
          </Text>
        </View>
      ) : null}

      <Input label="Nombre de la clase" value={title} onChangeText={setTitle} />

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

      <Button title={BUTTON_LABELS.saveChanges} onPress={save} style={{ marginTop: Spacing.md }} />
      <Button title="Cancelar clase" variant="outline" onPress={remove} style={{ marginTop: Spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm },
  occupancy: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  occupancyText: { fontSize: 14, fontWeight: '600' },
});
