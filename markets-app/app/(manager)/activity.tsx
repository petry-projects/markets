import React from 'react';
import { FlatList } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import ActivityFeedItem from '@/components/activity/ActivityFeedItem';
import { MarketActivityFeedDocument } from '@/graphql/generated/graphql';

const PAGE_SIZE = 20;

/** Returns the active market ID. In a real app this would come from context or navigation params. */
function getMarketID(): string {
  return '';
}

export default function ManagerActivityScreen() {
  const marketID = getMarketID();
  const { data, loading, refetch } = useQuery(MarketActivityFeedDocument, {
    variables: { marketID, limit: PAGE_SIZE, offset: 0 },
    skip: marketID.length === 0,
  });

  const items = data?.marketActivityFeed ?? [];

  if (loading && items.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner />
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <VStack className="gap-1 mb-4">
            <Heading className="text-xl text-typography-900">Market Activity</Heading>
            <Text className="text-sm text-typography-500">Recent activity across your market</Text>
          </VStack>
        }
        renderItem={({ item }) => <ActivityFeedItem item={item} />}
        ListEmptyComponent={
          <Box className="items-center py-8">
            <Text className="text-typography-500">No market activity yet</Text>
          </Box>
        }
        onRefresh={() => {
          void refetch();
        }}
        refreshing={loading}
      />
    </Box>
  );
}
