import { router } from 'expo-router';
import { useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

import { Radius, Spacing } from '@/constants/fitnexia';
import { GEO_LABELS } from '@/constants/labels';
import { useAppTheme } from '@/contexts/theme-context';
import type { ClassListItem } from '@/types/api';
import { classHasMapPin, DEFAULT_MAP_CENTER, mapRegionForPoints, type LatLng } from '@/utils/geo';

type ClassesMapProps = {
  classes: ClassListItem[];
  userLocation?: LatLng | null;
};

export function ClassesMap({ classes, userLocation }: ClassesMapProps) {
  const { colors } = useAppTheme();

  const mappable = useMemo(() => classes.filter(classHasMapPin), [classes]);

  const region = useMemo(() => {
    const points: LatLng[] = mappable.map((c) => ({
      lat: c.location!.lat,
      lng: c.location!.lng,
    }));
    if (userLocation) points.push(userLocation);
    return mapRegionForPoints(points, userLocation ?? DEFAULT_MAP_CENTER);
  }, [mappable, userLocation]);

  if (Platform.OS === 'web') {
    return (
      <View style={[styles.webFallback, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.webFallbackText, { color: colors.textMuted }]}>{GEO_LABELS.mapWebFallback}</Text>
      </View>
    );
  }

  if (mappable.length === 0) {
    return (
      <View style={[styles.webFallback, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.webFallbackText, { color: colors.textMuted }]}>{GEO_LABELS.noMapPins}</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <MapView style={styles.map} initialRegion={region} showsUserLocation={Boolean(userLocation)}>
        {mappable.map((item) => (
          <Marker
            key={item.id}
            coordinate={{
              latitude: item.location!.lat,
              longitude: item.location!.lng,
            }}
            title={item.title}
            description={item.location?.label}
            onPress={() => router.push(`/class/${item.id}`)}
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 280,
    borderRadius: Radius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  map: { flex: 1 },
  webFallback: {
    height: 120,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  webFallbackText: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
