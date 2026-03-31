import React, { useCallback, useMemo } from 'react';
import { FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { MapPin, Clock, ChevronLeft } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import VendorDiscoverCard from '@/components/customer/VendorDiscoverCard';
import FollowButton from '@/components/customer/FollowButton';
import {
  GetMarketDocument,
  DiscoverVendorsDocument,
  MyCustomerProfileDocument,
} from '@/graphql/generated/graphql';
import { useFollow } from '@/hooks/useFollow';

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleFollow, loading: followLoading } = useFollow();

  const { data: marketData, loading: marketLoading } = useQuery(GetMarketDocument, {
    variables: { id },
  });

  const { data: vendorsData, loading: vendorsLoading } = useQuery(DiscoverVendorsDocument, {
    variables: { marketID: id, limit: 50, offset: 0 },
  });

  const { data: profileData } = useQuery(MyCustomerProfileDocument);

  const market = marketData?.market;
  const vendors = vendorsData?.discoverVendors ?? [];

  const followedMarketIds = useMemo(
    () => new Set(profileData?.myCustomerProfile?.followedMarkets.map((m) => m.id) ?? []),
    [profileData?.myCustomerProfile?.followedMarkets],
  );

  const followedVendorIds = useMemo(
    () => new Set(profileData?.myCustomerProfile?.followedVendors.map((v) => v.id) ?? []),
    [profileData?.myCustomerProfile?.followedVendors],
  );

  const isFollowingMarket = followedMarketIds.has(id);

  const handleFollowToggle = useCallback(
    (targetType: 'VENDOR' | 'MARKET', targetID: string) => {
      const isFollowing =
        targetType === 'VENDOR' ? followedVendorIds.has(targetID) : followedMarketIds.has(targetID);
      void toggleFollow(targetType, targetID, isFollowing).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to update follow';
        Alert.alert('Error', message);
      });
    },
    [followedVendorIds, followedMarketIds, toggleFollow],
  );

  const handleVendorPress = useCallback(
    (vendorId: string) => {
      router.push(`/(customer)/vendor/${vendorId}` as never);
    },
    [router],
  );

  if (marketLoading && market == null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner />
      </Box>
    );
  }

  if (market == null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-6">
        <Text className="text-typography-500">Market not found.</Text>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={vendors}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <VStack className="gap-3 mb-4">
            {/* Back button */}
            <Button
              className="flex-row items-center self-start bg-transparent h-10"
              onPress={() => {
                router.back();
              }}
              accessibilityLabel="Go back"
            >
              <ChevronLeft size={20} color="#6366f1" />
              <ButtonText className="text-primary-600 text-sm ml-1">Back</ButtonText>
            </Button>

            {/* Market header */}
            <Box className="flex-row items-start justify-between">
              <VStack className="flex-1 gap-1">
                <Heading className="text-xl text-typography-900">{market.name}</Heading>
                <Box className="flex-row items-center gap-1">
                  <MapPin size={14} color="#9ca3af" />
                  <Text className="text-sm text-typography-500">{market.address}</Text>
                </Box>
              </VStack>
              <FollowButton
                targetType="MARKET"
                targetID={market.id}
                isFollowing={isFollowingMarket}
                onToggle={handleFollowToggle}
                disabled={followLoading}
              />
            </Box>

            {market.description != null && market.description !== '' && (
              <Text className="text-typography-600">{market.description}</Text>
            )}

            {/* Schedule info */}
            {market.schedule.length > 0 && (
              <VStack className="gap-2 mt-2">
                <Box className="flex-row items-center gap-1">
                  <Clock size={16} color="#6b7280" />
                  <Text className="text-sm font-medium text-typography-700">Schedule</Text>
                </Box>
                {market.schedule.map((s) => (
                  <Box key={s.id} className="rounded-lg bg-background-50 p-3">
                    <Text className="text-sm text-typography-700">
                      {s.label ?? s.scheduleType} &middot; {s.startTime} - {s.endTime}
                    </Text>
                  </Box>
                ))}
              </VStack>
            )}

            {/* Vendors heading */}
            <Box className="flex-row items-center justify-between mt-4">
              <Heading className="text-lg text-typography-900">Vendors</Heading>
              {vendorsLoading && <Spinner size="small" />}
            </Box>
          </VStack>
        }
        renderItem={({ item }) => (
          <VendorDiscoverCard
            vendor={item}
            isFollowing={followedVendorIds.has(item.id)}
            onPress={handleVendorPress}
            onFollowToggle={handleFollowToggle}
          />
        )}
        ListEmptyComponent={
          vendorsLoading ? (
            <Box className="items-center py-8">
              <Spinner />
            </Box>
          ) : (
            <Box className="items-center py-8">
              <Text className="text-typography-400">No vendors at this market yet.</Text>
            </Box>
          )
        }
      />
    </Box>
  );
}
