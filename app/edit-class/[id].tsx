import { router, useLocalSearchParams } from 'expo-router';
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
import { combineDateAndTime } from '@/utils/schedule';
import type { ClassFormat, Modality } from '@/types/api';

export default function EditClassScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const { user } = useAuth();
  const { getClassById, updateClass, cancelClass } = useClasses();
  const cls = getClassById(id ?? '');
  const instructorId = getLinkedInstructorId(user);

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

  useEffect(() => {
    if (!cls) return;
    const start = new Date(cls.startAt);
    setTitle(cls.title);
    setDiscipline(cls.discipline);
    setClassFormat(cls.classFormat ?? (cls.capacity === 1 ? 'individual' : 'group'));
    setModality(cls.modality);
    setStartDate(start);
    setStartTime(start);
    setDuration(String(cls.durationMinutes));
    setLocation(cls.location?.label ?? '');
    setPrice(String(cls.price.amount / 100));
    setCapacity(String(cls.capacity ?? 12));
  }, [cls]);

  useEffect(() => {
    if (classFormat === 'individual') {
      setCapacity('1');
    }
  }, [classFormat]);

  if (!cls) {
    return (
      <Screen>
        <Header title="Edit class" showBack />
        <Text style={{ color: colors.text }}>Class not found</Text>
      </Screen>
    );
  }

  if (cls.instructor.id !== instructorId) {
    return (
      <Screen>
        <Header title="Edit class" showBack />
        <Text style={{ color: colors.text }}>You can only edit your own classes.</Text>
      </Screen>
    );
  }

  const save = () => {
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
    const cap = classFormat === 'individual' ? 1 : parseInt(capacity, 10);
    if (classFormat === 'group' && (Number.isNaN(cap) || cap < 2)) {
      Alert.alert('Invalid capacity', 'Group classes need at least 2 spots.');
      return;
    }
    const booked = (cls.capacity ?? cap) - (cls.spotsLeft ?? cap);
    const spotsLeft = Math.max(0, cap - booked);
    const startAt = combineDateAndTime(startDate, startTime);

    updateClass(cls.id, {
      title: title.trim(),
      discipline,
      modality,
      classFormat,
      startAt: startAt.toISOString(),
      durationMinutes,
      price: { amount: priceAmount, currency: 'USD' },
      capacity: cap,
      spotsLeft,
      location:
        modality === 'in_person' && location.trim()
          ? { lat: cls.location?.lat ?? -34.6, lng: cls.location?.lng ?? -58.38, label: location.trim() }
          : undefined,
    });

    Alert.alert('Saved', 'Class updated.', [{ text: 'OK', onPress: () => router.back() }]);
  };

  const remove = () => {
    Alert.alert('Cancel class', 'Remove this class from your schedule? Existing bookings would be refunded in production.', [
      { text: 'Keep class', style: 'cancel' },
      {
        text: 'Cancel class',
        style: 'destructive',
        onPress: () => {
          cancelClass(cls.id);
          router.back();
        },
      },
    ]);
  };

  const minDate = new Date();
  minDate.setHours(0, 0, 0, 0);

  return (
    <Screen scroll>
      <Header title="Edit class" showBack />

      <Input label="Class name" value={title} onChangeText={setTitle} />
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

      {modality === 'in_person' ? (
        <Input label="Location" value={location} onChangeText={setLocation} />
      ) : null}

      <Input label="Price (USD)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />

      {classFormat === 'group' ? (
        <Input
          label="Max capacity"
          value={capacity}
          onChangeText={setCapacity}
          keyboardType="number-pad"
        />
      ) : null}

      <Button title="Save changes" onPress={save} style={{ marginTop: Spacing.md }} />
      <Button title="Cancel class" variant="outline" onPress={remove} style={{ marginTop: Spacing.sm }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.sm },
  row: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: Spacing.sm },
});
