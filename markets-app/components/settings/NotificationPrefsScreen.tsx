import React from 'react';
import { Pressable, Switch } from 'react-native';
import { useQuery, useMutation } from '@apollo/client/react';
import { Bell } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import {
  MyNotificationPrefsDocument,
  UpdateNotificationPrefsDocument,
} from '@/graphql/generated/graphql';

type PrefKey = 'pushEnabled' | 'vendorCheckInAlerts' | 'marketUpdateAlerts' | 'exceptionAlerts';

type PrefRow = {
  key: PrefKey;
  label: string;
  description: string;
};

const PREF_ROWS: PrefRow[] = [
  {
    key: 'pushEnabled',
    label: 'Push Notifications',
    description: 'Enable push notifications on this device',
  },
  {
    key: 'vendorCheckInAlerts',
    label: 'Check-in Alerts',
    description: 'Get notified when vendors check in or out',
  },
  {
    key: 'marketUpdateAlerts',
    label: 'Market Updates',
    description: 'Receive market news and schedule changes',
  },
  {
    key: 'exceptionAlerts',
    label: 'Exception Alerts',
    description: 'Get notified about vendor exceptions',
  },
];

export default function NotificationPrefsScreen() {
  const { data, loading } = useQuery(MyNotificationPrefsDocument);
  const [updatePrefs] = useMutation(UpdateNotificationPrefsDocument, {
    refetchQueries: [{ query: MyNotificationPrefsDocument }],
  });

  const prefs = data?.myNotificationPreferences;

  const handleToggle = (key: PrefKey) => {
    const currentValue = prefs?.[key] ?? false;
    void updatePrefs({
      variables: {
        input: { [key]: !currentValue },
      },
    });
  };

  if (loading && prefs == null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0 p-4">
      <VStack className="items-center gap-2 py-4 mb-4">
        <Box className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
          <Bell size={28} color="#6366f1" />
        </Box>
        <Heading className="text-xl text-typography-900">Notifications</Heading>
        <Text className="text-sm text-typography-500 text-center">
          Choose which notifications you want to receive
        </Text>
      </VStack>

      <VStack className="gap-2">
        {PREF_ROWS.map((row) => {
          const isEnabled = prefs?.[row.key] ?? false;
          return (
            <Pressable
              key={row.key}
              onPress={() => {
                handleToggle(row.key);
              }}
              accessibilityLabel={row.label}
              accessibilityRole="switch"
              accessibilityState={{ checked: isEnabled }}
            >
              <Box className="flex-row items-center rounded-lg border border-outline-200 bg-background-0 p-4">
                <Box className="flex-1">
                  <Text className="text-base text-typography-900">{row.label}</Text>
                  <Text className="text-xs text-typography-500 mt-1">{row.description}</Text>
                </Box>
                <Switch
                  value={isEnabled}
                  onValueChange={() => {
                    handleToggle(row.key);
                  }}
                  accessibilityLabel={`${row.label} toggle`}
                />
              </Box>
            </Pressable>
          );
        })}
      </VStack>
    </Box>
  );
}
