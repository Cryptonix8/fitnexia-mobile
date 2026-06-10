import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { ClassesMap } from '@/components/search/classes-map';
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
import { GEO_LABELS, MODALITY_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { useClasses } from '@/contexts/classes-context';
import { useFeature } from '@/hooks/use-feature';
import { useUserLocation } from '@/hooks/use-user-location';
import { filterClasses, sortClassesByDate } from '@/utils/class-filters';
import { classDistanceKm, DEFAULT_RADIUS_KM, formatDistanceKm, sortClassesByDistance } from '@/utils/geo';
import type { Modality } from '@/types/api';

type ViewMode = 'list' | 'map';

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const { classes } = useClasses();
  const geoEnabled = useFeature('geolocationMap');
  const { coords, loading: locationLoading, permissionDenied, requestLocation } = useUserLocation();

  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);
  const [location, setLocation] = useState('');
  const [schedule, setSchedule] = useState<ScheduleFilter>('any');
  const [priceRangeId, setPriceRangeId] = useState<string>('any');
  const [showFilters, setShowFilters] = useState(true);
  const [nearMe, setNearMe] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const priceRange = PRICE_RANGES.find((p) => p.id === priceRangeId) ?? PRICE_RANGES[0];

  const toggleNearMe = async () => {
    if (!nearMe) {
      const next = await requestLocation();
      if (next) setNearMe(true);
      return;
    }
    setNearMe(false);
  };

  const results = useMemo(() => {
    const filtered = filterClasses(classes, {
      query,
      discipline,
      modality,
      location,
      schedule,
      priceMin: priceRange.min === 0 ? null : priceRange.min,
      priceMax: Number.isFinite(priceRange.max) ? priceRange.max : null,
      nearMe: geoEnabled && nearMe,
      userLat: coords?.lat ?? null,
      userLng: coords?.lng ?? null,
      radiusKm: DEFAULT_RADIUS_KM,
    });
    if (geoEnabled && nearMe && coords) {
      return sortClassesByDistance(filtered, coords);
    }
    return sortClassesByDate(filtered);
  }, [
    classes,
    query,
    discipline,
    modality,
    location,
    schedule,
    priceRange,
    geoEnabled,
    nearMe,
    coords,
  ]);

  const activeFilterCount = [
    discipline,
    modality,
    location.trim(),
    schedule !== 'any' ? schedule : null,
    priceRangeId !== 'any' ? priceRangeId : null,
    nearMe ? 'nearMe' : null,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setDiscipline(null);
    setModality(null);
    setLocation('');
    setSchedule('any');
    setPriceRangeId('any');
    setNearMe(false);
  };

  const distanceFor = (classId: string) => {
    const item = results.find((c) => c.id === classId);
    if (!item || !coords || !nearMe) return undefined;
    const km = classDistanceKm(item, coords);
    return km != null ? formatDistanceKm(km) : undefined;
  };

  return (
    <Screen scroll edges={['top']}>
      <Text style={[styles.title, { color: colors.text }]}>Buscar</Text>
      <View style={[styles.searchBox, { backgroundColor: colors.input, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Clase, instructor o gimnasio..."
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      {geoEnabled ? (
        <View style={styles.viewToggleRow}>
          <FilterChip
            label={GEO_LABELS.listView}
            active={viewMode === 'list'}
            onPress={() => setViewMode('list')}
          />
          <FilterChip
            label={GEO_LABELS.mapView}
            active={viewMode === 'map'}
            onPress={() => setViewMode('map')}
          />
        </View>
      ) : null}

      <PressableRow
        label={`Filtros${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
        expanded={showFilters}
        onPress={() => setShowFilters(!showFilters)}
        colors={colors}
      />

      {showFilters ? (
        <>
          <FilterSection label="Ubicación" colors={colors}>
            <TextInput
              style={[
                styles.locationInput,
                { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
              ]}
              placeholder={GEO_LABELS.locationHint}
              placeholderTextColor={colors.textMuted}
              value={location}
              onChangeText={setLocation}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {geoEnabled ? (
                <FilterChip
                  label={locationLoading ? '…' : GEO_LABELS.nearMe}
                  active={nearMe}
                  onPress={toggleNearMe}
                />
              ) : null}
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
            {geoEnabled && permissionDenied ? (
              <Text style={[styles.geoHint, { color: colors.textMuted }]}>{GEO_LABELS.locationDenied}</Text>
            ) : null}
            {geoEnabled && nearMe && coords ? (
              <Text style={[styles.geoHint, { color: colors.primary }]}>
                {GEO_LABELS.withinRadius(DEFAULT_RADIUS_KM)}
              </Text>
            ) : null}
          </FilterSection>

          <FilterSection label="Horario" colors={colors}>
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

          <FilterSection label="Precio" colors={colors}>
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

          <FilterSection label="Deporte" colors={colors}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <FilterChip label="Todos" active={!discipline} onPress={() => setDiscipline(null)} />
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

          <FilterSection label="Modalidad" colors={colors}>
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
            <PressableRow label="Limpiar filtros" onPress={clearFilters} colors={colors} link />
          ) : null}
        </>
      ) : null}

      <Text style={[styles.count, { color: colors.textMuted }]}>
        {results.length} {results.length === 1 ? 'clase encontrada' : 'clases encontradas'}
        {geoEnabled && nearMe && coords ? ' · ordenadas por distancia' : ''}
      </Text>

      {geoEnabled && viewMode === 'map' ? (
        <ClassesMap classes={results} userLocation={coords} />
      ) : null}

      {results.length === 0 ? (
        <View style={[styles.empty, { backgroundColor: colors.surface }]}>
          <Ionicons name="search-outline" size={40} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Ninguna clase coincide</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>
            {geoEnabled && nearMe && !coords
              ? GEO_LABELS.enableNearMeHint
              : 'Probá ajustar ubicación, horario o precio.'}
          </Text>
        </View>
      ) : viewMode === 'list' ? (
        results.map((c) => (
          <ClassCard key={c.id} item={c} distanceLabel={distanceFor(c.id)} />
        ))
      ) : null}
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
  viewToggleRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
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
  geoHint: { fontSize: 12, marginTop: Spacing.sm },
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
