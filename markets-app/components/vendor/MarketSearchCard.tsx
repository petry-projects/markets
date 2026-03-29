import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

type MarketSearchCardProps = {
  id: string;
  name: string;
  address: string;
  distanceKm?: number | null;
  vendorCount: number;
  vendorStatus?: string | null;
  onPress: (id: string) => void;
};

export default function MarketSearchCard({
  id,
  name,
  address,
  distanceKm,
  vendorCount,
  vendorStatus,
  onPress,
}: MarketSearchCardProps) {
  return (
    <Pressable
      onPress={() => { onPress(id); }}
      accessibilityLabel={`Market: ${name}`}
      accessibilityRole="button"
    >
      <Box className="rounded-lg border border-outline-200 bg-background-0 p-4 mb-3">
        <VStack className="gap-1">
          <Box className="flex-row items-center justify-between">
            <Heading className="flex-1 text-base text-typography-900">
              {name}
            </Heading>
            {vendorStatus != null && vendorStatus !== '' && (
              <Box
                className={`rounded-full px-2 py-0.5 ${
                  vendorStatus === 'APPROVED'
                    ? 'bg-success-100'
                    : vendorStatus === 'PENDING'
                      ? 'bg-warning-100'
                      : 'bg-background-100'
                }`}
              >
                <Text
                  className={`text-xs ${
                    vendorStatus === 'APPROVED'
                      ? 'text-success-700'
                      : vendorStatus === 'PENDING'
                        ? 'text-warning-700'
                        : 'text-typography-500'
                  }`}
                >
                  {vendorStatus}
                </Text>
              </Box>
            )}
          </Box>
          <Text className="text-sm text-typography-500">{address}</Text>
          <Box className="flex-row gap-4">
            {distanceKm != null && (
              <Text className="text-sm text-typography-400">
                {distanceKm.toFixed(1)} km
              </Text>
            )}
            <Text className="text-sm text-typography-400">
              {vendorCount} vendor{vendorCount !== 1 ? 's' : ''}
            </Text>
          </Box>
        </VStack>
      </Box>
    </Pressable>
  );
}
