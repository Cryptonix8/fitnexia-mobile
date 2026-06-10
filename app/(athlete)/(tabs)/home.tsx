import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ClassCard } from '@/components/class-card';
import { Screen } from '@/components/ui/screen';
import { useClasses } from '@/contexts/classes-context';
import { FitnexiaColors, Radius, Spacing } from '@/constants/fitnexia';
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
  const { classes } = useClasses();
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

  return (
    <Screen scroll>
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

      <Text style={styles.section}>{geoEnabled && coords ? 'Cerca' : 'Próximas'}</Text>
      {nearby.map((c) => (
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
      ))}

      <Text style={styles.section}>Recomendadas para vos</Text>
      {recommended.map((c) => (
        <ClassCard key={`r-${c.id}`} item={c} />
      ))}
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
