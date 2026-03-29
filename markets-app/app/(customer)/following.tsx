import React, { useCallback } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { Heart } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import FeedItem from '@/components/customer/FeedItem';
import { FollowingFeedDocument } from '@/graphql/generated/graphql';

export default function FollowingScreen() {
  const router = useRouter();
  const { data, loading, refetch, fetchMore } = useQuery(FollowingFeedDocument, {
    variables: { limit: 20, offset: 0 },
  });

  const feedItems = data?.followingFeed ?? [];

  const handleRefresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (feedItems.length === 0) return;
    void fetchMore({
      variables: { offset: feedItems.length },
    });
  }, [feedItems.length, fetchMore]);

  if (loading && feedItems.length === 0) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <VStack className="items-center gap-3">
          <Spinner />
          <Text className="text-typography-500">Loading your feed...</Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={feedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <Heading className="text-lg text-typography-900 mb-4">Your Feed</Heading>
        }
        renderItem={({ item }) => <FeedItem feedItem={item} />}
        ListEmptyComponent={
          <Box className="items-center py-12">
            <VStack className="items-center gap-4">
              <Heart size={48} color="#d1d5db" />
              <Heading className="text-lg text-typography-700">No updates yet</Heading>
              <Text className="text-center text-typography-500 px-8">
                Follow vendors and markets to see their updates here.
              </Text>
              <Button
                className="h-12 bg-primary-500 rounded-lg px-6 mt-2"
                onPress={() => {
                  router.push('/(customer)/discover');
                }}
                accessibilityLabel="Go to discover"
              >
                <ButtonText className="text-white font-semibold">Discover Markets</ButtonText>
              </Button>
            </VStack>
          </Box>
        }
        onRefresh={handleRefresh}
        refreshing={loading}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />
    </Box>
  );
}
