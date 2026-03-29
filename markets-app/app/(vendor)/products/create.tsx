import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useMutation } from '@apollo/client/react';
import { Alert } from 'react-native';
import ProductForm, { ProductFormData } from '@/components/vendor/ProductForm';
import {
  CreateProductDocument,
  MyVendorProfileDocument,
} from '@/graphql/generated/graphql';

export default function CreateProductScreen() {
  const router = useRouter();
  const [createProduct, { loading }] = useMutation(CreateProductDocument, {
    refetchQueries: [{ query: MyVendorProfileDocument }],
  });

  const handleSubmit = useCallback(
    async (data: ProductFormData) => {
      try {
        await createProduct({
          variables: {
            input: {
              name: data.name,
              description: data.description || undefined,
              category: data.category || undefined,
            },
          },
        });
        router.back();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        Alert.alert('Error', message);
      }
    },
    [createProduct, router],
  );

  return <ProductForm mode="create" onSubmit={handleSubmit} loading={loading} />;
}
