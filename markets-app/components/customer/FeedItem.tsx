import React from 'react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

type FeedItemProps = {
  feedItem: {
    id: string;
    type: string;
    vendor?: {
      id: string;
      businessName: string;
      imageURL?: string | null;
    } | null;
    market?: {
      id: string;
      name: string;
      address: string;
    } | null;
    timestamp: string;
    message: string;
  };
};

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${String(diffMins)}m ago`;
  if (diffHours < 24) return `${String(diffHours)}h ago`;
  if (diffDays < 7) return `${String(diffDays)}d ago`;
  return date.toLocaleDateString();
}

export default function FeedItem({ feedItem }: FeedItemProps) {
  const entityName = feedItem.vendor?.businessName ?? feedItem.market?.name ?? 'Unknown';

  return (
    <Box
      className="rounded-lg border border-outline-200 bg-background-0 p-4 mb-3"
      accessibilityLabel={`Feed update from ${entityName}`}
    >
      <VStack className="gap-1">
        <Box className="flex-row items-center justify-between">
          <Heading className="flex-1 text-sm text-typography-900">{entityName}</Heading>
          <Text className="text-xs text-typography-400">{formatTimestamp(feedItem.timestamp)}</Text>
        </Box>
        {feedItem.market?.address != null && feedItem.market.address !== '' && (
          <Text className="text-xs text-typography-500">{feedItem.market.address}</Text>
        )}
        <Text className="text-sm text-typography-700 mt-1">{feedItem.message}</Text>
      </VStack>
    </Box>
  );
}
