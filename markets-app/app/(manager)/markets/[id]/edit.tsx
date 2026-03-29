import React, { useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Spinner } from '@/components/ui/spinner';
import { MarketForm, MarketFormData } from '@/components/market/MarketForm';
import {
  GetMarketDocument,
  UpdateMarketDocument,
  MyMarketsDocument,
} from '@/graphql/generated/graphql';

export default function EditMarketScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const {
    data,
    loading: queryLoading,
    error,
  } = useQuery(GetMarketDocument, {
    variables: { id: id },
    skip: !id,
  });

  const [updateMarket, { loading: mutationLoading }] = useMutation(UpdateMarketDocument, {
    refetchQueries: [{ query: MyMarketsDocument }],
  });

  const handleSubmit = useCallback(
    (formData: MarketFormData) => {
      void updateMarket({
        variables: {
          id: id,
          input: {
            name: formData.name,
            description: formData.description || undefined,
            address: formData.address,
            latitude: parseFloat(formData.latitude),
            longitude: parseFloat(formData.longitude),
            contactEmail: formData.contactEmail,
            contactPhone: formData.contactPhone || undefined,
            socialLinks: {
              instagram: formData.instagram || undefined,
              facebook: formData.facebook || undefined,
              website: formData.website || undefined,
              twitter: formData.twitter || undefined,
            },
          },
        },
      })
        .then(() => {
          router.back();
        })
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : 'An unexpected error occurred';
          Alert.alert('Error', message);
        });
    },
    [updateMarket, id, router],
  );

  if (queryLoading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner className="text-primary-500" />
      </Box>
    );
  }

  if (error || !data?.market) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <Text className="text-error-500 text-center">
          {error ? 'Failed to load market.' : 'Market not found.'}
        </Text>
      </Box>
    );
  }

  const market = data.market;
  const initialData: Partial<MarketFormData> = {
    name: market.name,
    description: market.description ?? '',
    address: market.address,
    latitude: String(market.latitude),
    longitude: String(market.longitude),
    contactEmail: market.contactEmail,
    contactPhone: market.contactPhone ?? '',
    instagram: market.socialLinks?.instagram ?? '',
    facebook: market.socialLinks?.facebook ?? '',
    website: market.socialLinks?.website ?? '',
    twitter: market.socialLinks?.twitter ?? '',
  };

  return (
    <MarketForm
      mode="edit"
      initialData={initialData}
      onSubmit={(data) => {
        handleSubmit(data);
      }}
      loading={mutationLoading}
    />
  );
}
