import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Screen } from '@/components/ui/screen';
import { DISCIPLINES, FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { MOCK_CLASSES } from '@/data/mock';
import type { Modality } from '@/types/api';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);

  const results = useMemo(() => {
    return MOCK_CLASSES.filter((c) => {
      if (discipline && c.discipline !== discipline) return false;
      if (modality && c.modality !== modality) return false;
      if (query) {
        const q = query.toLowerCase();
        return (
          c.title.toLowerCase().includes(q) ||
          c.instructor.displayName.toLowerCase().includes(q) ||
          c.discipline.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [query, discipline, modality]);

  return (
    <Screen scroll edges={['top']}>
      <Text style={styles.title}>Search</Text>
      <TextInput
        style={styles.search}
        placeholder="Instructor, gym, or class..."
        placeholderTextColor={FitnexiaColors.gray400}
        value={query}
        onChangeText={setQuery}
      />

      <Text style={styles.filterLabel}>Sport</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chips}>
        <Chip label="All" active={!discipline} onPress={() => setDiscipline(null)} />
        {DISCIPLINES.map((d) => (
          <Chip
            key={d}
            label={d}
            active={discipline === d}
            onPress={() => setDiscipline(discipline === d ? null : d)}
          />
        ))}
      </ScrollView>

      <Text style={styles.filterLabel}>Modality</Text>
      <View style={styles.row}>
        <Chip
          label="In person"
          active={modality === 'in_person'}
          onPress={() => setModality(modality === 'in_person' ? null : 'in_person')}
        />
        <Chip
          label="Online"
          active={modality === 'online'}
          onPress={() => setModality(modality === 'online' ? null : 'online')}
        />
      </View>

      <Text style={styles.count}>{results.length} classes found</Text>
      {results.map((c) => (
        <ClassCard key={c.id} item={c} />
      ))}
    </Screen>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.chip, active && styles.chipActive]}
      onPress={onPress}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: FitnexiaColors.gray900,
    marginBottom: Spacing.md,
  },
  search: {
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FitnexiaColors.gray700,
    marginBottom: Spacing.sm,
  },
  chips: { marginBottom: Spacing.md },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginBottom: Spacing.md },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radius.full,
    backgroundColor: FitnexiaColors.white,
    borderWidth: 1,
    borderColor: FitnexiaColors.gray200,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: FitnexiaColors.primary,
    borderColor: FitnexiaColors.primary,
  },
  chipText: { fontSize: 14, color: FitnexiaColors.gray700, fontWeight: '500' },
  chipTextActive: { color: FitnexiaColors.white },
  count: { fontSize: 13, color: FitnexiaColors.gray500, marginBottom: Spacing.md },
});
