import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import FollowButton from '@/components/customer/FollowButton';

type VendorDiscoverCardProduct = {
  id: string;
  name: string;
  category?: string | null;
  isAvailable: boolean;
};

type VendorDiscoverCardProps = {
  vendor: {
    id: string;
    businessName: string;
    description?: string | null;
    imageURL?: string | null;
    products: VendorDiscoverCardProduct[];
  };
  isFollowing?: boolean;
  onPress: (id: string) => void;
  onFollowToggle?: (targetType: 'VENDOR' | 'MARKET', targetID: string) => void;
};

export default function VendorDiscoverCard({
  vendor,
  isFollowing = false,
  onPress,
  onFollowToggle,
}: VendorDiscoverCardProps) {
  const categories = [
    ...new Set(
      vendor.products.map((p) => p.category).filter((c): c is string => c != null && c !== ''),
    ),
  ];

  return (
    <Pressable
      onPress={() => {
        onPress(vendor.id);
      }}
      accessibilityLabel={`Vendor: ${vendor.businessName}`}
      accessibilityRole="button"
    >
      <Box className="rounded-lg border border-outline-200 bg-background-0 p-4 mb-3">
        <VStack className="gap-2">
          <Box className="flex-row items-center justify-between">
            <Heading className="flex-1 text-base text-typography-900">
              {vendor.businessName}
            </Heading>
            {onFollowToggle != null && (
              <FollowButton
                targetType="VENDOR"
                targetID={vendor.id}
                isFollowing={isFollowing}
                onToggle={onFollowToggle}
              />
            )}
          </Box>
          {vendor.description != null && vendor.description !== '' && (
            <Text className="text-sm text-typography-600" numberOfLines={2}>
              {vendor.description}
            </Text>
          )}
          {categories.length > 0 && (
            <Box className="flex-row flex-wrap gap-2">
              {categories.map((cat) => (
                <Box key={cat} className="rounded-full bg-background-100 px-3 py-1">
                  <Text className="text-xs text-typography-600">{cat}</Text>
                </Box>
              ))}
            </Box>
          )}
          <Text className="text-xs text-typography-400">
            {vendor.products.length} product{vendor.products.length !== 1 ? 's' : ''}
          </Text>
        </VStack>
      </Box>
    </Pressable>
  );
}
