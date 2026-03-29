import React from 'react';
import { Pressable } from 'react-native';
import { MapPin, ChevronRight } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

type MarketDiscoverCardProps = {
  market: {
    id: string;
    name: string;
    description?: string | null;
    address: string;
    latitude: number;
    longitude: number;
    imageURL?: string | null;
    status: string;
  };
  distance?: number | null;
  onPress: (id: string) => void;
};

export default function MarketDiscoverCard({ market, distance, onPress }: MarketDiscoverCardProps) {
  return (
    <Pressable
      onPress={() => {
        onPress(market.id);
      }}
      accessibilityLabel={`Market: ${market.name}`}
      accessibilityRole="button"
    >
      <Box className="rounded-lg border border-outline-200 bg-background-0 p-4 mb-3">
        <Box className="flex-row items-start justify-between">
          <VStack className="flex-1 gap-1">
            <Heading className="text-base text-typography-900">{market.name}</Heading>
            <Box className="flex-row items-center gap-1">
              <MapPin size={14} color="#9ca3af" />
              <Text className="text-sm text-typography-500">{market.address}</Text>
            </Box>
            {market.description != null && market.description !== '' && (
              <Text className="text-sm text-typography-600" numberOfLines={2}>
                {market.description}
              </Text>
            )}
            {distance != null && (
              <Text className="text-xs text-primary-600">{distance.toFixed(1)} mi away</Text>
            )}
          </VStack>
          <Box className="ml-2 mt-1">
            <ChevronRight size={20} color="#9ca3af" />
          </Box>
        </Box>
      </Box>
    </Pressable>
  );
}
