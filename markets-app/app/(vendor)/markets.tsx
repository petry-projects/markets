import React from 'react';
import { FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { VendorMarketsDocument } from '@/graphql/generated/graphql';

export default function VendorMarketsScreen() {
  const router = useRouter();
  const { data, loading, refetch } = useQuery(VendorMarketsDocument);

  const markets = data?.vendorMarkets ?? [];

  if (loading && !data) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={markets}
        keyExtractor={(item) => item.market.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Box className="flex-row items-center justify-between mb-4">
            <Heading className="text-xl text-typography-900">My Markets</Heading>
            <Button
              className="bg-primary-500 rounded-lg px-4 h-10"
              onPress={() => { router.push('/(vendor)/markets/search'); }}
              accessibilityLabel="Find markets"
            >
              <ButtonText className="text-white text-sm font-semibold">
                Find Markets
              </ButtonText>
            </Button>
          </Box>
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              { router.push(`/(vendor)/markets/${item.market.id}/detail`); }
            }
            accessibilityLabel={`Market: ${item.market.name}`}
          >
            <Box className="rounded-lg border border-outline-200 bg-background-0 p-4 mb-3">
              <VStack className="gap-1">
                <Box className="flex-row items-center justify-between">
                  <Heading className="flex-1 text-base text-typography-900">
                    {item.market.name}
                  </Heading>
                  <Box
                    className={`rounded-full px-2 py-0.5 ${
                      item.status === 'APPROVED'
                        ? 'bg-success-100'
                        : item.status === 'PENDING'
                          ? 'bg-warning-100'
                          : item.status === 'REJECTED'
                            ? 'bg-error-100'
                            : 'bg-background-100'
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        item.status === 'APPROVED'
                          ? 'text-success-700'
                          : item.status === 'PENDING'
                            ? 'text-warning-700'
                            : item.status === 'REJECTED'
                              ? 'text-error-700'
                              : 'text-typography-500'
                      }`}
                    >
                      {item.status}
                    </Text>
                  </Box>
                </Box>
                <Text className="text-sm text-typography-500">
                  {item.market.address}
                </Text>
                {item.nextUpcomingDate != null && item.nextUpcomingDate !== '' && (
                  <Text className="text-sm text-primary-600">
                    Next: {item.nextUpcomingDate}
                  </Text>
                )}
                <Text className="text-sm text-typography-400">
                  {item.dates.length} date{item.dates.length !== 1 ? 's' : ''}{' '}
                  committed
                </Text>
              </VStack>
            </Box>
          </Pressable>
        )}
        ListEmptyComponent={
          <Box className="items-center py-8">
            <VStack className="items-center gap-4">
              <Text className="text-typography-400">
                You haven&apos;t joined any markets yet.
              </Text>
              <Button
                className="h-12 bg-primary-500 rounded-lg px-6"
                onPress={() => { router.push('/(vendor)/markets/search'); }}
                accessibilityLabel="Find markets to join"
              >
                <ButtonText className="text-white font-semibold">
                  Find Markets
                </ButtonText>
              </Button>
            </VStack>
          </Box>
        }
        onRefresh={() => { void refetch(); }}
        refreshing={loading}
      />
    </Box>
  );
}
