import * as Location from 'expo-location';
import { useCallback, useState } from 'react';

import type { LatLng } from '@/utils/geo';

export function useUserLocation() {
  const [coords, setCoords] = useState<LatLng | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const requestLocation = useCallback(async (): Promise<LatLng | null> => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setPermissionDenied(true);
        setError('Location permission denied');
        return null;
      }
      setPermissionDenied(false);
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const next: LatLng = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      setCoords(next);
      return next;
    } catch {
      setError('Could not get your location');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { coords, loading, error, permissionDenied, requestLocation };
}
