import React from 'react';
import { FlatList } from 'react-native';
import { useQuery } from '@apollo/client/react';
import { Clock, FileText } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Spinner } from '@/components/ui/spinner';
import { MyActivityLogDocument } from '@/graphql/generated/graphql';

const PAGE_SIZE = 20;

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatActionType(actionType: string): string {
  return actionType
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function ActivityLogScreen() {
  const { data, loading, refetch } = useQuery(MyActivityLogDocument, {
    variables: { limit: PAGE_SIZE, offset: 0 },
  });

  const items = data?.myActivityLog ?? [];

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
          <VStack className="items-center gap-2 py-4 mb-4">
            <Box className="w-16 h-16 rounded-full bg-primary-100 items-center justify-center">
              <FileText size={28} color="#6366f1" />
            </Box>
            <Heading className="text-xl text-typography-900">Activity Log</Heading>
            <Text className="text-sm text-typography-500 text-center">
              Your recent account activity
            </Text>
          </VStack>
        }
        renderItem={({ item }) => (
          <Box className="rounded-lg border border-outline-200 bg-background-0 p-4 mb-2">
            <Box className="flex-row items-start gap-3">
              <Box className="mt-1">
                <Clock size={16} color="#6b7280" />
              </Box>
              <VStack className="flex-1 gap-1">
                <Text className="text-base font-semibold text-typography-900">
                  {formatActionType(item.actionType)}
                </Text>
                <Text className="text-sm text-typography-600">
                  {item.targetType} {item.targetID}
                </Text>
                <Text className="text-xs text-typography-400">
                  {formatTimestamp(item.timestamp)}
                </Text>
              </VStack>
            </Box>
          </Box>
        )}
        ListEmptyComponent={
          <Box className="items-center py-8">
            <Text className="text-typography-500">No activity recorded yet</Text>
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
