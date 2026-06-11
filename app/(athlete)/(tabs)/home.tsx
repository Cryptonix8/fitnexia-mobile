import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/ui/screen';
import { useClasses } from '@/contexts/classes-context';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
import { LOADING_LABELS } from '@/constants/labels';
import { useFeature } from '@/hooks/use-feature';
import { useUserLocation } from '@/hooks/use-user-location';
import {
  classDistanceKm,
  DEFAULT_RADIUS_KM,
  filterClassesNearUser,
  formatDistanceKm,
  sortClassesByDistance,
} from '@/utils/geo';

export default function AthleteHomeScreen() {
  const { classes, isLoading, error, refreshClasses } = useClasses();
  const geoEnabled = useFeature('geolocationMap');
  const { coords, requestLocation } = useUserLocation();

  useEffect(() => {
    if (geoEnabled) {
      requestLocation();
    }
  }, [geoEnabled, requestLocation]);

  const nearby = useMemo(() => {
    if (geoEnabled && coords) {
      return sortClassesByDistance(
        filterClassesNearUser(classes, coords, DEFAULT_RADIUS_KM),
        coords,
      ).slice(0, 3);
    }
    return classes.slice(0, 3);
  }, [classes, coords, geoEnabled]);

  const recommended = [...classes].reverse().slice(0, 3);
  const nearbyTitle = geoEnabled && coords ? 'Cerca' : 'Próximas';

  return (
    <Screen
      scroll
      loading={isLoading && classes.length === 0}
      loadingMessage={LOADING_LABELS.classes}>
      <View style={styles.top}>
        <View>
          <Text style={styles.greet}>Buenos días 👋</Text>
          <Text style={styles.headline}>Encontrá tu próxima clase</Text>
        </View>
        <View style={styles.bell}>
          <Ionicons name="notifications-outline" size={24} color={FitnexiaColors.gray900} />
        </View>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={FitnexiaColors.gray400} />
        <TextInput
          placeholder="Buscar clases, coaches, gimnasios..."
          placeholderTextColor={FitnexiaColors.gray400}
          style={styles.searchInput}
          onFocus={() => router.push('/(athlete)/(tabs)/search')}
        />
      </View>

      {error && classes.length === 0 ? (
        <EmptyState
          icon="cloud-offline-outline"
          title="No se pudieron cargar las clases"
          description={error}
          actionLabel="Reintentar"
          onAction={() => void refreshClasses()}
        />
      ) : (
        <>
          <Text style={styles.section}>{nearbyTitle}</Text>
          {nearby.length === 0 ? (
            <EmptyState
              compact
              icon={geoEnabled && coords ? 'location-outline' : 'calendar-outline'}
              title={
                geoEnabled && coords
                  ? 'No hay clases cerca'
                  : 'No hay clases próximas'
              }
              description={
                geoEnabled && coords
                  ? 'Ampliá el radio de búsqueda o explorá todas las clases.'
                  : 'Todavía no hay clases publicadas. Volvé pronto o buscá en Explorar.'
              }
            />
          ) : (
            nearby.map((c) => (
              <ClassCard
                key={c.id}
                item={c}
                distanceLabel={
                  geoEnabled && coords
                    ? (() => {
                        const km = classDistanceKm(c, coords);
                        return km != null ? formatDistanceKm(km) : undefined;
                      })()
                    : undefined
                }
              />
            ))
          )}

          <Text style={styles.section}>Recomendadas para vos</Text>
          {recommended.length === 0 ? (
            <EmptyState
              compact
              icon="sparkles-outline"
              title="Sin recomendaciones por ahora"
              description="Cuando haya más clases en la plataforma, te sugeriremos opciones acá."
            />
          ) : (
            recommended.map((c) => <ClassCard key={`r-${c.id}`} item={c} />)
          )}
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greet: { fontSize: 14, color: FitnexiaColors.gray500 },
  headline: { fontSize: 26, fontWeight: '800', color: FitnexiaColors.gray900, marginTop: 4 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: FitnexiaColors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FitnexiaColors.white,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  searchInput: { flex: 1, fontSize: 16, color: FitnexiaColors.gray900 },
  section: {
    fontSize: 18,
    fontWeight: '700',
    color: FitnexiaColors.gray900,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
});
