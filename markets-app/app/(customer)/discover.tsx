import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { Search, MapPin } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import MarketDiscoverCard from '@/components/customer/MarketDiscoverCard';
import { DiscoverMarketsDocument } from '@/graphql/generated/graphql';
import { useAutoLocation } from '@/hooks/useLocation';

const DISTANCE_OPTIONS = [5, 10, 25, 50] as const;

/** Haversine distance in miles between two lat/lng pairs. */
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function DiscoverScreen() {
  const router = useRouter();
  const {
    location,
    loading: locationLoading,
    error: locationError,
    requestLocation,
  } = useAutoLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [radiusMiles, setRadiusMiles] = useState(25);

  const { data, loading, refetch } = useQuery(DiscoverMarketsDocument, {
    variables: {
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      radiusMiles,
      limit: 50,
      offset: 0,
    },
    skip: location == null,
  });

  const filteredMarkets = useMemo(() => {
    const allMarkets = data?.discoverMarkets ?? [];
    if (searchTerm.trim() === '') return allMarkets;
    const term = searchTerm.toLowerCase();
    return allMarkets.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.address.toLowerCase().includes(term) ||
        (m.description != null && m.description.toLowerCase().includes(term)),
    );
  }, [data?.discoverMarkets, searchTerm]);

  const handleMarketPress = useCallback(
    (id: string) => {
      router.push(`/(customer)/market/${id}`);
    },
    [router],
  );

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  // No location yet
  if (location == null && !locationLoading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-6">
        <VStack className="items-center gap-4">
          <MapPin size={48} color="#9ca3af" />
          <Heading className="text-xl text-typography-900">Enable Location</Heading>
          <Text className="text-center text-typography-500">
            {locationError != null
              ? 'Location permission was denied. Please enable it in settings to discover nearby markets.'
              : 'We need your location to find markets near you.'}
          </Text>
          <Button
            className="h-12 bg-primary-500 rounded-lg px-6"
            onPress={() => {
              void requestLocation();
            }}
            accessibilityLabel="Enable location access"
          >
            <ButtonText className="text-white font-semibold">
              {locationError != null ? 'Try Again' : 'Use My Location'}
            </ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  }

  if (locationLoading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <VStack className="items-center gap-3">
          <Spinner />
          <Text className="text-typography-500">Getting your location...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={filteredMarkets}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <VStack className="gap-4 mb-4">
            {/* Search bar */}
            <Input className="flex-row items-center rounded-lg border border-outline-300 bg-background-50 px-3 h-12">
              <Search size={18} color="#9ca3af" />
              <InputField
                className="flex-1 ml-2 text-typography-900"
                placeholder="Search markets..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                accessibilityLabel="Search markets"
                returnKeyType="search"
              />
            </Input>

            {/* Distance filter */}
            <Box className="flex-row gap-2">
              {DISTANCE_OPTIONS.map((d) => (
                <Pressable
                  key={d}
                  onPress={() => {
                    setRadiusMiles(d);
                  }}
                  accessibilityLabel={`Filter by ${String(d)} miles`}
                  accessibilityRole="button"
                >
                  <Box
                    className={`rounded-full px-4 py-2 ${
                      radiusMiles === d
                        ? 'bg-primary-500'
                        : 'bg-background-100 border border-outline-200'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        radiusMiles === d ? 'text-white' : 'text-typography-600'
                      }`}
                    >
                      {d} mi
                    </Text>
                  </Box>
                </Pressable>
              ))}
            </Box>

            {/* Results heading */}
            <Box className="flex-row items-center justify-between">
              <Heading className="text-lg text-typography-900">Markets Near You</Heading>
              {loading && <Spinner size="small" />}
            </Box>
          </VStack>
        }
        renderItem={({ item }) => (
          <MarketDiscoverCard
            market={item}
            distance={
              location != null
                ? haversineDistance(
                    location.latitude,
                    location.longitude,
                    item.latitude,
                    item.longitude,
                  )
                : null
            }
            onPress={handleMarketPress}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <Box className="items-center py-8">
              <Spinner />
            </Box>
          ) : (
            <Box className="items-center py-8">
              <Text className="text-typography-400">
                {searchTerm !== ''
                  ? 'No markets match your search.'
                  : 'No markets found nearby. Try increasing the distance.'}
              </Text>
            </Box>
          )
        }
        onRefresh={handleRefresh}
        refreshing={loading}
      />
    </Box>
  );
}
