import { useState, useEffect, useCallback } from 'react';
import * as Location from 'expo-location';

type LocationState = {
  latitude: number;
  longitude: number;
} | null;

type UseLocationResult = {
  location: LocationState;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<void>;
};

/**
 * Hook to request and track the user's current location via expo-location.
 */
export function useLocation(): UseLocationResult {
  const [location, setLocation] = useState<LocationState>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        setError('Location permission denied');
        setLoading(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to get location';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { location, loading, error, requestLocation };
}

/**
 * Hook that automatically requests location on mount.
 */
export function useAutoLocation(): UseLocationResult {
  const result = useLocation();

  useEffect(() => {
    void result.requestLocation();
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return result;
}
