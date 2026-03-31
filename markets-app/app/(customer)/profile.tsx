import React from 'react';
import { FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { User, Heart, MapPin, Settings, ChevronRight } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { MyCustomerProfileDocument } from '@/graphql/generated/graphql';

type MenuItem = {
  id: string;
  label: string;
  value?: string;
  icon: React.ReactNode;
  onPress?: () => void;
};

export default function CustomerProfileScreen() {
  const router = useRouter();
  const { data, loading, refetch } = useQuery(MyCustomerProfileDocument);

  const profile = data?.myCustomerProfile;

  if (loading && profile == null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner />
      </Box>
    );
  }

  const vendorCount = profile?.followedVendors.length ?? 0;
  const marketCount = profile?.followedMarkets.length ?? 0;

  const menuItems: MenuItem[] = [
    {
      id: 'followed-vendors',
      label: 'Followed Vendors',
      value: String(vendorCount),
      icon: <Heart size={20} color="#6366f1" />,
      onPress: () => {
        router.push('/(customer)/following');
      },
    },
    {
      id: 'followed-markets',
      label: 'Followed Markets',
      value: String(marketCount),
      icon: <MapPin size={20} color="#6366f1" />,
      onPress: () => {
        router.push('/(customer)/following');
      },
    },
    {
      id: 'settings',
      label: 'Settings & Preferences',
      icon: <Settings size={20} color="#6b7280" />,
    },
  ];

  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={menuItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <VStack className="items-center gap-3 py-6 mb-4">
            <Box className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center">
              <User size={36} color="#6366f1" />
            </Box>
            <Heading className="text-xl text-typography-900">
              {profile?.displayName ?? 'Customer'}
            </Heading>
            <Box className="flex-row gap-6">
              <VStack className="items-center">
                <Text className="text-lg font-bold text-typography-900">{String(vendorCount)}</Text>
                <Text className="text-xs text-typography-500">Vendors</Text>
              </VStack>
              <VStack className="items-center">
                <Text className="text-lg font-bold text-typography-900">{String(marketCount)}</Text>
                <Text className="text-xs text-typography-500">Markets</Text>
              </VStack>
            </Box>
          </VStack>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={item.onPress}
            disabled={item.onPress == null}
            accessibilityLabel={item.label}
            accessibilityRole="button"
          >
            <Box className="flex-row items-center rounded-lg border border-outline-200 bg-background-0 p-4 mb-2">
              <Box className="mr-3">{item.icon}</Box>
              <Text className="flex-1 text-typography-900">{item.label}</Text>
              {item.value != null && <Text className="text-typography-500 mr-2">{item.value}</Text>}
              {item.onPress != null && <ChevronRight size={18} color="#9ca3af" />}
            </Box>
          </Pressable>
        )}
        onRefresh={() => {
          void refetch();
        }}
        refreshing={loading}
      />
    </Box>
  );
}
