import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ClassesMap } from '@/components/search/classes-map';
import { FilterChip } from '@/components/ui/filter-chip';
import { FilterSelect } from '@/components/ui/filter-select';
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
import { GEO_LABELS, LOADING_LABELS, MODALITY_LABELS, VERIFICATION_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import { useClasses } from '@/contexts/classes-context';
import { useFeature } from '@/hooks/use-feature';
import { useUserLocation } from '@/hooks/use-user-location';
import { filterClasses, sortClassesByDate } from '@/utils/class-filters';
import { classDistanceKm, DEFAULT_RADIUS_KM, formatDistanceKm, sortClassesByDistance } from '@/utils/geo';
import type { Modality } from '@/types/api';

type ViewMode = 'list' | 'map';

const NEAR_ME_VALUE = '__near_me__';

export default function SearchScreen() {
  const { colors } = useAppTheme();
  const { classes, isLoading } = useClasses();
  const geoEnabled = useFeature('geolocationMap');
  const { coords, loading: locationLoading, permissionDenied, requestLocation } = useUserLocation();

  const [query, setQuery] = useState('');
  const [discipline, setDiscipline] = useState<string | null>(null);
  const [modality, setModality] = useState<Modality | null>(null);
  const [locationKey, setLocationKey] = useState<string | null>(null);
  const [locationText, setLocationText] = useState('');
  const [schedule, setSchedule] = useState<ScheduleFilter>('any');
  const [priceRangeId, setPriceRangeId] = useState<string>('any');
  const [nearMe, setNearMe] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const location = nearMe
    ? ''
    : locationKey && locationKey !== NEAR_ME_VALUE
      ? locationKey
      : locationText;

  const priceRange = PRICE_RANGES.find((p) => p.id === priceRangeId) ?? PRICE_RANGES[0];

  const locationOptions = useMemo(() => {
    const base = [{ value: '', label: 'Cualquier ubicación' }];
    if (geoEnabled) {
      base.push({
        value: NEAR_ME_VALUE,
        label: locationLoading ? '…' : GEO_LABELS.nearMe,
      });
    }
    return [
      ...base,
      ...MOCK_LOCATION_AREAS.map((area) => ({ value: area, label: area })),
    ];
  }, [geoEnabled, locationLoading]);

  const scheduleOptions = SCHEDULE_FILTERS.map((s) => ({
    value: s.id,
    label: s.label,
  }));

  const priceOptions = PRICE_RANGES.map((p) => ({
    value: p.id,
    label: p.label,
  }));

  const disciplineOptions = [
    { value: '', label: 'Todos los deportes' },
    ...DISCIPLINES.map((d) => ({ value: d, label: d })),
  ];

  const modalityOptions = [
    { value: '', label: 'Cualquier modalidad' },
    { value: 'in_person', label: MODALITY_LABELS.inPerson },
    { value: 'online', label: MODALITY_LABELS.online },
  ];

  const handleLocationChange = async (value: string | null) => {
    if (value === NEAR_ME_VALUE) {
      const next = await requestLocation();
      if (next) {
        setNearMe(true);
        setLocationKey(NEAR_ME_VALUE);
        setLocationText('');
      }
      return;
    }
    setNearMe(false);
    if (!value || value === '') {
      setLocationKey(null);
      setLocationText('');
      return;
    }
    if (MOCK_LOCATION_AREAS.includes(value as (typeof MOCK_LOCATION_AREAS)[number])) {
      setLocationKey(value);
      setLocationText('');
      return;
    }
    setLocationKey(null);
    setLocationText(value);
  };

  const locationSelectValue = nearMe ? NEAR_ME_VALUE : (locationKey ?? '');

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
      verifiedOnly,
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
    verifiedOnly,
  ]);

  const activeFilterCount = [
    discipline,
    modality,
    nearMe || location.trim(),
    schedule !== 'any' ? schedule : null,
    priceRangeId !== 'any' ? priceRangeId : null,
    verifiedOnly ? 'verified' : null,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setDiscipline(null);
    setModality(null);
    setLocationKey(null);
    setLocationText('');
    setSchedule('any');
    setPriceRangeId('any');
    setVerifiedOnly(false);
    setNearMe(false);
  };

  const distanceFor = (classId: string) => {
    const item = results.find((c) => c.id === classId);
    if (!item || !coords || !nearMe) return undefined;
    const km = classDistanceKm(item, coords);
    return km != null ? formatDistanceKm(km) : undefined;
  };

  return (
    <Screen
      scroll
      edges={['top']}
      loading={isLoading && classes.length === 0}
      loadingMessage={LOADING_LABELS.classes}>
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

      <View style={[styles.filtersPanel, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.filtersHeader}>
          <Text style={[styles.filtersTitle, { color: colors.text }]}>Filtros</Text>
          {activeFilterCount > 0 ? (
            <Pressable onPress={clearFilters} hitSlop={8}>
              <Text style={[styles.clearLink, { color: colors.primary }]}>Limpiar</Text>
            </Pressable>
          ) : null}
        </View>

        <View style={styles.filterRow}>
          <FilterSelect
            label="Horario"
            value={schedule === 'any' ? null : schedule}
            options={scheduleOptions}
            onChange={(v) => setSchedule((v as ScheduleFilter) ?? 'any')}
            placeholder="Cualquier horario"
            clearable={false}
          />
          <FilterSelect
            label="Precio"
            value={priceRangeId === 'any' ? null : priceRangeId}
            options={priceOptions}
            onChange={(v) => setPriceRangeId(v ?? 'any')}
            placeholder="Cualquier precio"
            clearable={false}
          />
        </View>

        <View style={styles.filterRow}>
          <FilterSelect
            label="Deporte"
            value={discipline}
            options={disciplineOptions}
            onChange={setDiscipline}
            placeholder="Todos"
          />
          <FilterSelect
            label="Modalidad"
            value={modality}
            options={modalityOptions}
            onChange={(v) => setModality((v as Modality) || null)}
            placeholder="Cualquiera"
          />
        </View>

        <FilterSelect
          label="Ubicación"
          value={locationSelectValue || null}
          options={locationOptions}
          onChange={handleLocationChange}
          placeholder="Cualquier ubicación"
          clearable={false}
          style={styles.fullWidth}
        />

        <View style={styles.chipsRow}>
          <FilterChip
            label={VERIFICATION_LABELS.verifiedOnly}
            active={verifiedOnly}
            onPress={() => setVerifiedOnly((v) => !v)}
          />
        </View>

        <TextInput
          style={[
            styles.locationInput,
            { backgroundColor: colors.input, borderColor: colors.border, color: colors.text },
          ]}
          placeholder={GEO_LABELS.locationHint}
          placeholderTextColor={colors.textMuted}
          value={locationText}
          onChangeText={(text) => {
            setLocationText(text);
            setLocationKey(null);
            setNearMe(false);
          }}
        />

        {geoEnabled && permissionDenied ? (
          <Text style={[styles.geoHint, { color: colors.textMuted }]}>{GEO_LABELS.locationDenied}</Text>
        ) : null}
        {geoEnabled && nearMe && coords ? (
          <Text style={[styles.geoHint, { color: colors.primary }]}>
            {GEO_LABELS.withinRadius(DEFAULT_RADIUS_KM)}
          </Text>
        ) : null}
      </View>

      <Text style={[styles.count, { color: colors.textMuted }]}>
        {results.length} {results.length === 1 ? 'clase encontrada' : 'clases encontradas'}
        {geoEnabled && nearMe && coords ? ' · ordenadas por distancia' : ''}
      </Text>

      {geoEnabled && viewMode === 'map' ? (
        <ClassesMap classes={results} userLocation={coords} />
      ) : null}

      {results.length === 0 ? (
        <EmptyState
          icon="search-outline"
          title="Ninguna clase coincide"
          description={
            geoEnabled && nearMe && !coords
              ? GEO_LABELS.enableNearMeHint
              : 'Probá ajustar ubicación, horario o precio.'
          }
        />
      ) : viewMode === 'list' ? (
        results.map((c) => (
          <ClassCard key={c.id} item={c} distanceLabel={distanceFor(c.id)} />
        ))
      ) : null}
    </Screen>
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
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.sm },
  filtersPanel: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  filtersTitle: { fontSize: 16, fontWeight: '700' },
  clearLink: { fontSize: 14, fontWeight: '600' },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  fullWidth: { flex: undefined, width: '100%', marginBottom: Spacing.sm },
  locationInput: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    borderWidth: 1,
  },
  geoHint: { fontSize: 12, marginTop: Spacing.sm },
  count: { fontSize: 13, marginBottom: Spacing.md },
});
