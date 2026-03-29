import React, { useCallback } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import ProductForm, { ProductFormData } from '@/components/vendor/ProductForm';
import {
  UpdateProductDocument,
  MyVendorProfileDocument,
} from '@/graphql/generated/graphql';

export default function EditProductScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: profileData, loading: profileLoading } = useQuery(
    MyVendorProfileDocument,
  );
  const [updateProduct, { loading: mutationLoading }] = useMutation(
    UpdateProductDocument,
    {
      refetchQueries: [{ query: MyVendorProfileDocument }],
    },
  );

  const product = profileData?.myVendorProfile?.products.find(
    (p) => p.id === id,
  );

  const handleSubmit = useCallback(
    async (formData: ProductFormData) => {
      try {
        await updateProduct({
          variables: {
            id: id!,
            input: {
              name: formData.name,
              description: formData.description || undefined,
              category: formData.category || undefined,
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
    [updateProduct, router, id],
  );

  if (profileLoading || !product) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <ProductForm
      mode="edit"
      initialData={{
        name: product.name,
        description: product.description ?? '',
        category: product.category ?? '',
      }}
      onSubmit={handleSubmit}
      loading={mutationLoading}
    />
  );
}
