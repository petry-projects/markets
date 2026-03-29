import { useEffect, useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useMutation } from '@apollo/client/react';
import { RegisterDeviceTokenDocument } from '@/graphql/generated/graphql';

type UseNotificationsResult = {
  pushToken: string | null;
  permissionGranted: boolean;
  loading: boolean;
  error: string | null;
  requestPermission: () => Promise<void>;
};

export function useNotifications(): UseNotificationsResult {
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [registerToken] = useMutation(RegisterDeviceTokenDocument);

  const getPlatform = useCallback((): 'IOS' | 'ANDROID' | 'WEB' => {
    if (Platform.OS === 'ios') return 'IOS';
    if (Platform.OS === 'android') return 'ANDROID';
    return 'WEB';
  }, []);

  const requestPermission = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus as string;

      if (finalStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status as string;
      }

      if (finalStatus !== 'granted') {
        setPermissionGranted(false);
        setError('Push notification permission not granted');
        setLoading(false);
        return;
      }

      setPermissionGranted(true);

      const tokenData = await Notifications.getExpoPushTokenAsync();
      const token = tokenData.data;
      setPushToken(token);

      await registerToken({
        variables: {
          input: {
            token,
            platform: getPlatform(),
          },
        },
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to register for notifications';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [registerToken, getPlatform]);

  useEffect(() => {
    void (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if ((status as string) === 'granted') {
        setPermissionGranted(true);
      }
    })();
  }, []);

  return { pushToken, permissionGranted, loading, error, requestPermission };
}
