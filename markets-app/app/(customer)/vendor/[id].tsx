import React, { useCallback, useMemo } from 'react';
import { FlatList, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { ChevronLeft, Globe, AtSign } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import FollowButton from '@/components/customer/FollowButton';
import { VendorDocument, MyCustomerProfileDocument } from '@/graphql/generated/graphql';
import { useFollow } from '@/hooks/useFollow';

export default function VendorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { toggleFollow, loading: followLoading } = useFollow();

  const { data: vendorData, loading: vendorLoading } = useQuery(VendorDocument, {
    variables: { id },
  });

  const { data: profileData } = useQuery(MyCustomerProfileDocument);

  const vendor = vendorData?.vendor;

  const followedVendorIds = useMemo(
    () => new Set(profileData?.myCustomerProfile?.followedVendors.map((v) => v.id) ?? []),
    [profileData?.myCustomerProfile?.followedVendors],
  );

  const isFollowing = followedVendorIds.has(id);

  const handleFollowToggle = useCallback(
    (targetType: 'VENDOR' | 'MARKET', targetID: string) => {
      void toggleFollow(targetType, targetID, followedVendorIds.has(targetID)).catch(
        (err: unknown) => {
          const message = err instanceof Error ? err.message : 'Failed to update follow';
          Alert.alert('Error', message);
        },
      );
    },
    [followedVendorIds, toggleFollow],
  );

  const activeCheckIn = vendor?.checkIns.find((c) => c.status === 'CHECKED_IN');

  if (vendorLoading && vendor == null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner />
      </Box>
    );
  }

  if (vendor == null) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-6">
        <Text className="text-typography-500">Vendor not found.</Text>
      </Box>
    );
  }

  const products = vendor.products;

  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={products}
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

            {/* Vendor header */}
            <Box className="flex-row items-start justify-between">
              <VStack className="flex-1 gap-1">
                <Heading className="text-xl text-typography-900">{vendor.businessName}</Heading>
                {activeCheckIn != null && (
                  <Box className="flex-row items-center gap-1">
                    <Box className="w-2 h-2 rounded-full bg-success-500" />
                    <Text className="text-sm text-success-700">Currently at market</Text>
                  </Box>
                )}
              </VStack>
              <FollowButton
                targetType="VENDOR"
                targetID={vendor.id}
                isFollowing={isFollowing}
                onToggle={handleFollowToggle}
                disabled={followLoading}
              />
            </Box>

            {vendor.description != null && vendor.description !== '' && (
              <Text className="text-typography-600">{vendor.description}</Text>
            )}

            {/* Social links */}
            <Box className="flex-row gap-4 flex-wrap">
              {vendor.instagramHandle != null && vendor.instagramHandle !== '' && (
                <Box className="flex-row items-center gap-1">
                  <AtSign size={16} color="#6366f1" />
                  <Text className="text-sm text-primary-600">@{vendor.instagramHandle}</Text>
                </Box>
              )}
              {vendor.websiteURL != null && vendor.websiteURL !== '' && (
                <Box className="flex-row items-center gap-1">
                  <Globe size={16} color="#6366f1" />
                  <Text className="text-sm text-primary-600">{vendor.websiteURL}</Text>
                </Box>
              )}
            </Box>

            {/* Products heading */}
            <Box className="mt-4">
              <Heading className="text-lg text-typography-900">Products</Heading>
            </Box>
          </VStack>
        }
        renderItem={({ item }) => (
          <Box className="rounded-lg border border-outline-200 bg-background-0 p-4 mb-2">
            <Box className="flex-row items-center justify-between">
              <VStack className="flex-1 gap-0.5">
                <Text className="text-base font-medium text-typography-900">{item.name}</Text>
                {item.category != null && item.category !== '' && (
                  <Text className="text-xs text-typography-500">{item.category}</Text>
                )}
                {item.description != null && item.description !== '' && (
                  <Text className="text-sm text-typography-600 mt-1">{item.description}</Text>
                )}
              </VStack>
              <Box
                className={`rounded-full px-2 py-0.5 ${
                  item.isAvailable ? 'bg-success-100' : 'bg-background-100'
                }`}
              >
                <Text
                  className={`text-xs ${
                    item.isAvailable ? 'text-success-700' : 'text-typography-400'
                  }`}
                >
                  {item.isAvailable ? 'Available' : 'Unavailable'}
                </Text>
              </Box>
            </Box>
          </Box>
        )}
        ListEmptyComponent={
          <Box className="items-center py-8">
            <Text className="text-typography-400">No products listed yet.</Text>
          </Box>
        }
      />
    </Box>
  );
}
