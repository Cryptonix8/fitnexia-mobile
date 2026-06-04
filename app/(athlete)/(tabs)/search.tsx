import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { FilterChip } from '@/components/ui/filter-chip';
import { Screen } from '@/components/ui/screen';
import {
  DISCIPLINES,
  MOCK_LOCATION_AREAS,
  PRICE_RANGES,
  Radius,
  SCHEDULE_FILTERS,
  Spacing,
  type ScheduleFilter,
} from '@/constants/fitnexia';
import { MODALITY_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { useClasses } from '@/contexts/classes-context';
import { filterClasses, sortClassesByDate } from '@/utils/class-filters';
import type { Modality } from '@/types/api';

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const { classes } = useClasses();
  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);
  const [location, setLocation] = useState('');
  const [schedule, setSchedule] = useState<ScheduleFilter>('any');
  const [priceRangeId, setPriceRangeId] = useState<string>('any');
  const [showFilters, setShowFilters] = useState(true);

  const priceRange = PRICE_RANGES.find((p) => p.id === priceRangeId) ?? PRICE_RANGES[0];

  const results = useMemo(() => {
    const filtered = filterClasses(classes, {
      query,
      discipline,
      modality,
      location,
      schedule,
      priceMin: priceRange.min === 0 ? null : priceRange.min,
      priceMax: Number.isFinite(priceRange.max) ? priceRange.max : null,
    });
    return sortClassesByDate(filtered);
  }, [classes, query, discipline, modality, location, schedule, priceRange]);

  const activeFilterCount = [
    discipline,
    modality,
    location.trim(),
    schedule !== 'any' ? schedule : null,
    priceRangeId !== 'any' ? priceRangeId : null,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setDiscipline(null);
    setModality(null);
    setLocation('');
    setSchedule('any');
    setPriceRangeId('any');
  };

  return (
    <Screen scroll edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Search</Text>
      <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Class, instructor, or gym..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <PressableRow
        label={`Filters${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
        expanded={showFilters}
        onPress={() => setShowFilters(!showFilters)}
        colors={colors}
      />

      {showFilters ? (
        <>
          <FilterSection label="Location" colors={colors}>
            <TextInput
              style={[
                styles.locationInput,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="City, neighborhood, or venue..."
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MOCK_LOCATION_AREAS.map((area) => (
                <FilterChip
                  key={area}
                  label={area}
                  active={location.toLowerCase() === area.toLowerCase()}
                  onPress={() =>
                    setLocation(location.toLowerCase() === area.toLowerCase() ? '' : area)
                  }
                />
              ))}
            </ScrollView>
          </FilterSection>

          <FilterSection label="Schedule" colors={colors}>
            <View style={styles.chipWrap}>
              {SCHEDULE_FILTERS.map((s) => (
                <FilterChip
                  key={s.id}
                  label={s.label}
                  active={schedule === s.id}
                  onPress={() => setSchedule(schedule === s.id ? 'any' : s.id)}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection label="Price" colors={colors}>
            <View style={styles.chipWrap}>
              {PRICE_RANGES.map((p) => (
                <FilterChip
                  key={p.id}
                  label={p.label}
                  active={priceRangeId === p.id}
                  onPress={() => setPriceRangeId(priceRangeId === p.id ? 'any' : p.id)}
                />
              ))}
            </View>
          </FilterSection>

          <FilterSection label="Sport" colors={colors}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterChip label="All" active={!discipline} onPress={() => setDiscipline(null)} />
              {DISCIPLINES.map((d) => (
                <FilterChip
                  key={d}
                  label={d}
                  active={discipline === d}
                  onPress={() => setDiscipline(discipline === d ? null : d)}
                />
              ))}
            </ScrollView>
          </FilterSection>

          <FilterSection label="Modality" colors={colors}>
            <View style={styles.chipWrap}>
              <FilterChip
                label={MODALITY_LABELS.inPerson}
                active={modality === 'in_person'}
                onPress={() => setModality(modality === 'in_person' ? null : 'in_person')}
              />
              <FilterChip
                label={MODALITY_LABELS.online}
                active={modality === 'online'}
                onPress={() => setModality(modality === 'online' ? null : 'online')}
              />
            </View>
          </FilterSection>

          {activeFilterCount > 0 ? (
            <PressableRow label="Clear all filters" onPress={clearFilters} colors={colors} link />
          ) : null}
        </>
      ) : null}

      <Text style={[styles.count, { color: colors.textMuted }]}>
        {results.length} class{results.length === 1 ? '' : 'es'} found
      </Text>

      {results.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={40} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No classes match</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            Try adjusting location, schedule, or price filters.
          </Text>
        </View>
      ) : (
        results.map((c) => <ClassCard key={c.id} item={c} />)
      )}
    </Screen>
  );
}

function FilterSection({
  label,
  children,
  colors,
}: {
  label: string;
  children: React.ReactNode;
  colors: { textSecondary: string };
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>{label}</Text>
      {children}
    </View>
  );
}

function PressableRow({
  label,
  onPress,
  expanded,
  colors,
  link,
}: {
  label: string;
  onPress: () => void;
  expanded?: boolean;
  colors: { primary: string; textMuted: string };
  link?: boolean;
}) {
  return (
    <Pressable onPress={onPress}>
      <Text
        style={[
          styles.toggleFilters,
          { color: link ? colors.primary : colors.textMuted },
        ]}>
        {label}
        {expanded != null ? ` ${expanded ? '▲' : '▼'}` : ''}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: Spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  searchInput: { flex: 1, fontSize: 16 },
  toggleFilters: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  section: { marginBottom: Spacing.md },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },
  locationInput: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  count: { fontSize: 13, marginBottom: Spacing.md },
  empty: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.lg,
    marginTop: Spacing.sm,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', marginTop: Spacing.md },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: Spacing.sm },
});
