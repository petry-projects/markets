import React from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { MarketCard } from '@/components/market/MarketCard';
import { MyMarketsDocument } from '@/graphql/generated/graphql';

export default function MyMarketsScreen() {
  const router = useRouter();
  const { data, loading, error, refetch } = useQuery(MyMarketsDocument);

  const handleMarketPress = (id: string) => {
    router.push(`/(manager)/markets/${id}/edit`);
  };

  const handleCreatePress = () => {
    router.push('/(manager)/markets/create');
  };

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner className="text-primary-500" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text className="text-error-500 text-center">Failed to load markets. Pull to retry.</Text>
      </Box>
    );
  }

  const markets = data?.myMarkets ?? [];

  return (
    <Box className="flex-1 bg-background-50">
      <Box className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <Heading className="text-xl text-typography-900">My Markets</Heading>
        <Button
          className="h-10 bg-primary-500 rounded-lg px-4"
          onPress={handleCreatePress}
          accessibilityLabel="Create new market"
        >
          <ButtonText className="text-white font-medium text-sm">+ Create</ButtonText>
        </Button>
      </Box>

      {markets.length === 0 ? (
        <Box className="flex-1 items-center justify-center p-8">
          <Text className="text-typography-500 text-center mb-4">
            You don&apos;t have any markets yet.
          </Text>
          <Button
            className="h-14 bg-primary-500 rounded-lg px-8"
            onPress={handleCreatePress}
            accessibilityLabel="Create your first market"
          >
            <ButtonText className="text-white font-semibold">Create Your First Market</ButtonText>
          </Button>
        </Box>
      ) : (
        <FlatList
          data={markets}
          keyExtractor={(item) => item.id}
          contentContainerClassName="p-4"
          renderItem={({ item }) => (
            <MarketCard
              id={item.id}
              name={item.name}
              address={item.address}
              description={item.description}
              onPress={handleMarketPress}
            />
          )}
          onRefresh={() => {
            void refetch();
          }}
          refreshing={loading}
        />
      )}
    </Box>
  );
}
