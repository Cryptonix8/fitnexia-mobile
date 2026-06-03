import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

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
import { getLinkedInstructorId } from '@/utils/instructor';
import { combineDateAndTime, defaultClassStart } from '@/utils/schedule';
import type { ClassFormat, Modality } from '@/types/api';

export default function CreateClassScreen() {
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { addClass } = useClasses();
  const defaults = defaultClassStart();

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

  useEffect(() => {
    if (classFormat === 'individual') {
      setCapacity('1');
    }
  }, [classFormat]);

  const publish = () => {
    if (!title.trim()) {
      Alert.alert('Missing info', 'Class name is required.');
      return;
    }
    if (classFormat === 'group') {
      const cap = parseInt(capacity, 10);
      if (Number.isNaN(cap) || cap < 2) {
        Alert.alert('Invalid capacity', 'Group classes need at least 2 spots.');
        return;
      }
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

    const cap = classFormat === 'individual' ? 1 : parseInt(capacity, 10);
    const startAt = combineDateAndTime(startDate, startTime);
    const instructorId = getLinkedInstructorId(user);

    addClass({
      title: title.trim(),
      discipline,
      modality,
      classFormat,
      startAt: startAt.toISOString(),
      durationMinutes,
      price: { amount: priceAmount, currency: 'USD' },
      capacity: cap,
      spotsLeft: cap,
      instructor: {
        id: instructorId,
        displayName: user?.instructorProfile?.displayName ?? 'Instructor',
      },
    });

    const formatLabel =
      classFormat === 'individual' ? 'Individual (1-on-1)' : `Group (${cap} spots)`;
    const recurNote = recurring ? ' Repeats weekly.' : '';
    Alert.alert(
      'Published',
      `"${title.trim()}" is scheduled for ${startAt.toLocaleString()} as a ${formatLabel} class.${recurNote}`,
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <Screen scroll>
      <Header title="New class" showBack />
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
          label="In person"
          active={modality === 'in_person'}
          onPress={() => setModality('in_person')}
        />
        <FilterChip
          label="Online"
          active={modality === 'online'}
          onPress={() => setModality('online')}
        />
      </View>

      <Input label="Price (USD)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

      {classFormat === 'group' ? (
        <Input
          label="Max capacity"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
          placeholder="e.g. 12"
        />
      ) : (
        <View style={[styles.individualCap, { backgroundColor: colors.surfaceMuted }]}>
          <Text style={[styles.individualCapText, { color: colors.textSecondary }]}>
            Capacity: 1 athlete
          </Text>
        </View>
      )}

      <View style={styles.recurRow}>
        <FilterChip
          label={recurring ? '✓ Repeats weekly' : 'Repeat weekly'}
          active={recurring}
          onPress={() => setRecurring(!recurring)}
        />
      </View>

      <Button title="Publish class" onPress={publish} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  helper: { fontSize: 13, lineHeight: 20, marginBottom: Spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm },
  individualCap: {
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.md,
  },
  individualCapText: { fontSize: 15, fontWeight: '500' },
  recurRow: { flexDirection: 'row', marginBottom: Spacing.md },
});
