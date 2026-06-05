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
import { DISCIPLINES, Spacing } from '@/constants/fitnexia';
import { MODALITY_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { fetchLinkedInstructors } from '@/services/api/institutions.api';
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
    { id: string; displayName: string }[]
  >([]);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (!isGym) return;
    fetchLinkedInstructors()
      .then((data) => setLinkedInstructors(data.map((i) => ({ id: i.id, displayName: i.displayName }))))
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
      Alert.alert('Missing info', 'Class name is required.');
      return;
    }

    const durationMinutes = parseInt(duration, 10);
    if (Number.isNaN(durationMinutes) || durationMinutes < 15) {
      Alert.alert('Invalid duration', 'Duration must be at least 15 minutes.');
      return;
    }
    const priceAmount = Math.round(parseFloat(price) * 100);
    if (Number.isNaN(priceAmount) || priceAmount <= 0) {
      Alert.alert('Invalid price', 'Enter a valid price.');
      return;
    }

    const startAt = combineDateAndTime(startDate, startTime);
    setPublishing(true);

    try {
      if (isGym) {
        const cap = parseInt(capacity, 10);
        if (Number.isNaN(cap) || cap < 2) {
          Alert.alert('Invalid capacity', 'Group classes need at least 2 spots.');
          return;
        }
        if (!selectedInstructorId) {
          Alert.alert('Select instructor', 'Choose a linked instructor to teach this class.');
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
          price: { amount: priceAmount, currency: 'USD' },
          capacity: cap,
          spotsLeft: cap,
          instructor: { id: instructor.id, displayName: instructor.displayName },
          institution: {
            id: institutionId,
            name: institutionProfile?.name ?? 'Gym',
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
            Alert.alert('Invalid capacity', 'Group classes need at least 2 spots.');
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
          price: { amount: priceAmount, currency: 'USD' },
          capacity: instructorCap,
          spotsLeft: instructorCap,
          instructor: {
            id: getLinkedInstructorId(user),
            displayName: user?.instructorProfile?.displayName ?? 'Instructor',
          },
        });
      }

      await refreshClasses();
      Alert.alert('Published', `"${title.trim()}" is now live.`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err) {
      Alert.alert('Publish failed', getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <Screen scroll>
      <Header title={isGym ? 'New group class' : 'New class'} showBack />

      {isGym ? (
        <Text style={[styles.gymHint, { color: colors.textMuted }]}>
          Group classes at your gym with limited capacity. Assign a linked instructor.
        </Text>
      ) : null}

      <Input
        label="Class name"
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Morning Yoga"
      />
      <Input
        label="Description"
        value={description}
        onChangeText={setDescription}
        placeholder="What athletes should expect..."
        multiline
      />

      {isGym ? (
        <InstructorPicker
          instructors={linkedInstructors}
          selectedId={selectedInstructorId}
          onSelect={setSelectedInstructorId}
          label="Assign instructor"
        />
      ) : null}

      <Text style={[styles.label, { color: colors.textSecondary }]}>Date & time</Text>
      <DateTimeField
        label="Date"
        mode="date"
        value={startDate}
        onChange={setStartDate}
        minimumDate={minDate}
      />
      <DateTimeField label="Start time" mode="time" value={startTime} onChange={setStartTime} />
      <Input
        label="Duration (minutes)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="number-pad"
        placeholder="e.g. 60"
      />

      {!isGym ? (
        <>
          <Text style={[styles.label, { color: colors.textSecondary }]}>Class type</Text>
          <View style={styles.row}>
            <FilterChip
              label="Individual"
              active={classFormat === 'individual'}
              onPress={() => setClassFormat('individual')}
            />
            <FilterChip
              label="Group"
              active={classFormat === 'group'}
              onPress={() => {
                setClassFormat('group');
                if (capacity === '1') setCapacity('12');
              }}
            />
          </View>
          <Text style={[styles.helper, { color: colors.textMuted }]}>
            {classFormat === 'individual'
              ? 'Private 1-on-1 session. Capacity is fixed at 1 athlete.'
              : 'Open session for multiple athletes. Set max capacity below.'}
          </Text>
        </>
      ) : (
        <View style={[styles.groupBadge, { backgroundColor: colors.primaryMuted }]}>
          <Text style={[styles.groupBadgeText, { color: colors.primaryText }]}>
            Group class · limited spots
          </Text>
        </View>
      )}

      <Text style={[styles.label, { color: colors.textSecondary }]}>Discipline</Text>
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

      <Text style={[styles.label, { color: colors.textSecondary }]}>Modality</Text>
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

      <Input label="Price (USD)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

      {!isGym && classFormat === 'individual' ? (
        <View style={[styles.individualCap, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.individualCapText, { color: colors.textSecondary }]}>
            Capacity: 1 athlete
          </Text>
        </View>
      ) : (
        <Input
          label="Max capacity"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
          placeholder="e.g. 20"
        />
      )}

      {!isGym && recurringClasses ? (
        <View style={styles.recurRow}>
          <FilterChip
            label={recurring ? '✓ Repeats weekly' : 'Repeat weekly'}
            active={recurring}
            onPress={() => setRecurring(!recurring)}
          />
        </View>
      ) : null}

      {isGym && linkedInstructors.length === 0 ? (
        <Button
          title="Add staff first"
          variant="outline"
          onPress={() => router.push('/(gym)/profile/instructors')}
          style={{ marginBottom: Spacing.sm }}
        />
      ) : null}

      <Button
        title="Publish class"
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
