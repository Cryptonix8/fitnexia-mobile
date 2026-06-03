import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/header';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { DISCIPLINES, FitnexiaColors, Spacing } from '@/constants/fitnexia';
import type { Modality } from '@/types/api';

export default function CreateClassScreen() {
  const [title, setTitle] = useState('');
  const [discipline, setDiscipline] = useState(DISCIPLINES[0]);
  const [modality, setModality] = useState<Modality>('in_person');
  const [price, setPrice] = useState('25');
  const [capacity, setCapacity] = useState('12');
  const [recurring, setRecurring] = useState(false);

  const publish = () => {
    Alert.alert('Published', 'Class is now visible in search (mock).', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen scroll>
      <Header title="New class" showBack />
      <Input label="Class name" value={title} onChangeText={setTitle} placeholder="e.g. Morning Yoga" />
      <Input label="Description" placeholder="What athletes should expect..." multiline />

      <Text style={styles.label}>Discipline</Text>
      <View style={styles.chips}>
        {DISCIPLINES.slice(0, 5).map((d) => (
          <Pressable
            key={d}
            style={[styles.chip, discipline === d && styles.chipOn]}
            onPress={() => setDiscipline(d)}>
            <Text style={[styles.chipText, discipline === d && styles.chipTextOn]}>{d}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>Modality</Text>
      <View style={styles.row}>
        <Pressable
          style={[styles.chip, modality === 'in_person' && styles.chipOn]}
          onPress={() => setModality('in_person')}>
          <Text style={[styles.chipText, modality === 'in_person' && styles.chipTextOn]}>
            In person
          </Text>
        </Pressable>
        <Pressable
          style={[styles.chip, modality === 'online' && styles.chipOn]}
          onPress={() => setModality('online')}>
          <Text style={[styles.chipText, modality === 'online' && styles.chipTextOn]}>Online</Text>
        </Pressable>
      </View>

      <Input label="Price (USD)" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
      <Input label="Max capacity" value={capacity} onChangeText={setCapacity} keyboardType="number-pad" />

      <Pressable style={styles.recur} onPress={() => setRecurring(!recurring)}>
        <View style={[styles.check, recurring && styles.checkOn]}>
          {recurring ? <Text style={styles.checkMark}>✓</Text> : null}
        </View>
        <Text style={styles.recurText}>Repeat weekly</Text>
      </Pressable>

      <Button title="Publish class" onPress={publish} style={{ marginTop: Spacing.md }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', color: FitnexiaColors.gray700, marginBottom: Spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  row: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: FitnexiaColors.white,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
  },
  chipOn: { backgroundColor: FitnexiaColors.primary, borderColor: FitnexiaColors.primary },
  chipText: { fontSize: 14, color: FitnexiaColors.gray700 },
  chipTextOn: { color: FitnexiaColors.white, fontWeight: '600' },
  recur: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.md },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: FitnexiaColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkOn: { backgroundColor: FitnexiaColors.primary },
  checkMark: { color: FitnexiaColors.white, fontWeight: '700', fontSize: 14 },
  recurText: { fontSize: 16, fontWeight: '500' },
});
