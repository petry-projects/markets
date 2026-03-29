import React, { useState, useCallback } from 'react';
import { FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { useLazyQuery } from '@apollo/client/react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Input, InputField } from '@/components/ui/input';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import MarketSearchCard from '@/components/vendor/MarketSearchCard';
import { SearchMarketsToJoinDocument } from '@/graphql/generated/graphql';

export default function SearchMarketsScreen() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [search, { data, loading }] = useLazyQuery(
    SearchMarketsToJoinDocument,
  );

  const handleSearch = useCallback(() => {
    void search({
      variables: {
        input: {
          searchTerm: searchTerm || undefined,
          limit: 20,
        },
      },
    });
  }, [search, searchTerm]);

  const results = data?.searchMarketsToJoin ?? [];

  return (
    <Box className="flex-1 bg-background-0">
      <VStack className="p-4 pb-0 gap-3">
        <Heading className="text-xl text-typography-900">Find Markets</Heading>
        <Box className="flex-row gap-2">
          <Box className="flex-1">
            <Input className="rounded-lg border border-outline-200 bg-background-50">
              <InputField
                className="px-3 h-12 text-typography-900"
                value={searchTerm}
                onChangeText={setSearchTerm}
                placeholder="Search by name or city"
                accessibilityLabel="Search markets"
                onSubmitEditing={handleSearch}
                returnKeyType="search"
              />
            </Input>
          </Box>
          <Button
            className="h-12 bg-primary-500 rounded-lg px-4"
            onPress={handleSearch}
            disabled={loading}
            accessibilityLabel="Search"
          >
            {loading ? (
              <Spinner className="text-white" />
            ) : (
              <ButtonText className="text-white font-semibold">
                Search
              </ButtonText>
            )}
          </Button>
        </Box>
      </VStack>

      <FlatList
        data={results}
        keyExtractor={(item) => item.market.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <MarketSearchCard
            id={item.market.id}
            name={item.market.name}
            address={item.market.address}
            distanceKm={item.distanceKm}
            vendorCount={item.vendorCount}
            vendorStatus={item.vendorStatus}
            onPress={(id) => { router.push(`/(vendor)/markets/${id}/detail`); }}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <Box className="items-center py-8">
              <Text className="text-typography-400">
                {data ? 'No markets found.' : 'Search for markets to join.'}
              </Text>
            </Box>
          ) : null
        }
      />
    </Box>
  );
}
