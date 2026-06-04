import type { ClassListItem } from '@/types/api';

export type LatLng = { lat: number; lng: number };

/** Default map center (Buenos Aires — matches mock data). */
export const DEFAULT_MAP_CENTER: LatLng = { lat: -34.6037, lng: -58.3816 };

export const DEFAULT_RADIUS_KM = 10;

const EARTH_RADIUS_KM = 6371;

export function haversineKm(a: LatLng, b: LatLng): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(h));
}

export function formatDistanceKm(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

export function classHasMapPin(item: ClassListItem): boolean {
  return item.modality === 'in_person' && item.location != null;
}

export function classDistanceKm(item: ClassListItem, user: LatLng): number | null {
  if (!classHasMapPin(item) || !item.location) return null;
  return haversineKm(user, { lat: item.location.lat, lng: item.location.lng });
}

export function isWithinRadius(item: ClassListItem, user: LatLng, radiusKm: number): boolean {
  const distance = classDistanceKm(item, user);
  return distance != null && distance <= radiusKm;
}

export function sortClassesByDistance(classes: ClassListItem[], user: LatLng): ClassListItem[] {
  return [...classes].sort((a, b) => {
    const da = classDistanceKm(a, user) ?? Infinity;
    const db = classDistanceKm(b, user) ?? Infinity;
    return da - db;
  });
}

export function filterClassesNearUser(
  classes: ClassListItem[],
  user: LatLng,
  radiusKm: number = DEFAULT_RADIUS_KM,
): ClassListItem[] {
  return classes.filter((item) => isWithinRadius(item, user, radiusKm));
}

export function mapRegionForPoints(
  points: LatLng[],
  fallback: LatLng = DEFAULT_MAP_CENTER,
): {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
} {
  if (points.length === 0) {
    return {
      latitude: fallback.lat,
      longitude: fallback.lng,
      latitudeDelta: 0.08,
      longitudeDelta: 0.08,
    };
  }

  const lats = points.map((p) => p.lat);
  const lngs = points.map((p) => p.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const latDelta = Math.max((maxLat - minLat) * 1.4, 0.04);
  const lngDelta = Math.max((maxLng - minLng) * 1.4, 0.04);

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: latDelta,
    longitudeDelta: lngDelta,
  };
}
