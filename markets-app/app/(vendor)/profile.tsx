import React, { useCallback } from 'react';
import { Alert, FlatList, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { FileText, Trash2, ChevronRight } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import ProductCard from '@/components/vendor/ProductCard';
import { MyVendorProfileDocument, DeleteProductDocument } from '@/graphql/generated/graphql';

export default function VendorProfileScreen() {
  const router = useRouter();
  const { data, loading, refetch } = useQuery(MyVendorProfileDocument);
  const [deleteProduct] = useMutation(DeleteProductDocument, {
    refetchQueries: [{ query: MyVendorProfileDocument }],
  });

  const profile = data?.myVendorProfile;

  const handleDeleteProduct = useCallback(
    (id: string) => {
      Alert.alert('Delete Product', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteProduct({ variables: { id } }).catch((err: unknown) => {
              const message = err instanceof Error ? err.message : 'Failed to delete product';
              Alert.alert('Error', message);
            });
          },
        },
      ]);
    },
    [deleteProduct],
  );

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner />
      </Box>
    );
  }

  if (!profile) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-4">
        <VStack className="items-center gap-4">
          <Heading className="text-xl text-typography-900">Welcome, Vendor!</Heading>
          <Text className="text-center text-typography-500">
            Create your vendor profile to start selling at farmers markets.
          </Text>
          <Button
            className="h-12 bg-primary-500 rounded-lg px-6"
            onPress={() => {
              router.push('/(vendor)/profile/create');
            }}
            accessibilityLabel="Create vendor profile"
          >
            <ButtonText className="text-white font-semibold">Create Profile</ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box className="flex-1 bg-background-0">
      <FlatList
        data={profile.products}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <VStack className="mb-4 gap-3">
            <Box className="flex-row items-center justify-between">
              <Heading className="text-xl text-typography-900">{profile.businessName}</Heading>
              <Button
                className="bg-transparent border border-outline-300 rounded-lg px-4 h-10"
                onPress={() => {
                  router.push('/(vendor)/profile/edit');
                }}
                accessibilityLabel="Edit profile"
              >
                <ButtonText className="text-typography-700 text-sm">Edit</ButtonText>
              </Button>
            </Box>
            {profile.description != null && profile.description !== '' && (
              <Text className="text-typography-600">{profile.description}</Text>
            )}
            {profile.contactInfo != null && profile.contactInfo !== '' && (
              <Text className="text-sm text-typography-500">Contact: {profile.contactInfo}</Text>
            )}
            <Box className="flex-row gap-4 flex-wrap">
              {profile.instagramHandle != null && profile.instagramHandle !== '' && (
                <Text className="text-sm text-primary-600">@{profile.instagramHandle}</Text>
              )}
              {profile.websiteURL != null && profile.websiteURL !== '' && (
                <Text className="text-sm text-primary-600">{profile.websiteURL}</Text>
              )}
            </Box>

            <VStack className="gap-2 mt-4 mb-4">
              <Pressable
                onPress={() => {
                  router.push('/(vendor)/settings/activity-log');
                }}
                accessibilityLabel="Activity Log"
                accessibilityRole="button"
              >
                <Box className="flex-row items-center rounded-lg border border-outline-200 bg-background-0 p-4">
                  <Box className="mr-3">
                    <FileText size={20} color="#6b7280" />
                  </Box>
                  <Text className="flex-1 text-typography-900">Activity Log</Text>
                  <ChevronRight size={18} color="#9ca3af" />
                </Box>
              </Pressable>
              <Pressable
                onPress={() => {
                  router.push('/(vendor)/settings/delete-account' as never);
                }}
                accessibilityLabel="Delete Account"
                accessibilityRole="button"
              >
                <Box className="flex-row items-center rounded-lg border border-outline-200 bg-background-0 p-4">
                  <Box className="mr-3">
                    <Trash2 size={20} color="#ef4444" />
                  </Box>
                  <Text className="flex-1 text-typography-900">Delete Account</Text>
                  <ChevronRight size={18} color="#9ca3af" />
                </Box>
              </Pressable>
            </VStack>

            <Box className="flex-row items-center justify-between mt-4">
              <Heading className="text-lg text-typography-900">Products</Heading>
              <Button
                className="bg-primary-500 rounded-lg px-4 h-10"
                onPress={() => {
                  router.push('/(vendor)/products/create' as never);
                }}
                accessibilityLabel="Add product"
              >
                <ButtonText className="text-white text-sm font-semibold">Add Product</ButtonText>
              </Button>
            </Box>
          </VStack>
        }
        renderItem={({ item }) => (
          <ProductCard
            id={item.id}
            name={item.name}
            category={item.category}
            description={item.description}
            isAvailable={item.isAvailable}
            onEdit={(id) => {
              router.push(`/(vendor)/products/${id}/edit` as never);
            }}
            onDelete={handleDeleteProduct}
          />
        )}
        ListEmptyComponent={
          <Box className="items-center py-8">
            <Text className="text-typography-400">No products yet. Add your first product!</Text>
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
