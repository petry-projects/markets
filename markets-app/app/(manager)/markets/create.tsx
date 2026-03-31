import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useMutation } from '@apollo/client/react';
import { Alert } from 'react-native';
import { MarketForm, MarketFormData } from '@/components/market/MarketForm';
import { CreateMarketDocument, MyMarketsDocument } from '@/graphql/generated/graphql';

export default function CreateMarketScreen() {
  const router = useRouter();
  const [createMarket, { loading }] = useMutation(CreateMarketDocument, {
    refetchQueries: [{ query: MyMarketsDocument }],
  });

  const handleSubmit = useCallback(
    async (data: MarketFormData) => {
      try {
        await createMarket({
          variables: {
            input: {
              name: data.name,
              description: data.description || undefined,
              address: data.address,
              latitude: parseFloat(data.latitude),
              longitude: parseFloat(data.longitude),
              contactEmail: data.contactEmail,
              contactPhone: data.contactPhone || undefined,
              recoveryContact: data.recoveryContact,
              socialLinks: {
                instagram: data.instagram || undefined,
                facebook: data.facebook || undefined,
                website: data.website || undefined,
                twitter: data.twitter || undefined,
              },
            },
          },
        });
        router.back();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred';
        Alert.alert('Error', message);
      }
    },
    [createMarket, router],
  );

  return (
    <MarketForm
      mode="create"
      onSubmit={(data) => {
        void handleSubmit(data);
      }}
      loading={loading}
    />
  );
}
