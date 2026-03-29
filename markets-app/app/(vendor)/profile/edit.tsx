import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { Spinner } from '@/components/ui/spinner';
import VendorProfileForm, {
  VendorProfileFormData,
} from '@/components/vendor/VendorProfileForm';
import {
  MyVendorProfileDocument,
  UpdateVendorProfileDocument,
} from '@/graphql/generated/graphql';

export default function EditVendorProfileScreen() {
  const router = useRouter();
  const { data, loading: queryLoading } = useQuery(MyVendorProfileDocument);
  const [updateProfile, { loading: mutationLoading }] = useMutation(
    UpdateVendorProfileDocument,
    {
      refetchQueries: [{ query: MyVendorProfileDocument }],
    },
  );

  const profile = data?.myVendorProfile;

  const handleSubmit = useCallback(
    async (formData: VendorProfileFormData) => {
      try {
        await updateProfile({
          variables: {
            input: {
              businessName: formData.businessName,
              description: formData.description || undefined,
              contactInfo: formData.contactInfo || undefined,
              instagramHandle: formData.instagramHandle || undefined,
              facebookURL: formData.facebookURL || undefined,
              websiteURL: formData.websiteURL || undefined,
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
    [updateProfile, router],
  );

  if (queryLoading || !profile) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner size="large" />
      </Box>
    );
  }

  return (
    <VendorProfileForm
      mode="edit"
      initialData={{
        businessName: profile.businessName,
        description: profile.description ?? '',
        contactInfo: profile.contactInfo ?? '',
        instagramHandle: profile.instagramHandle ?? '',
        facebookURL: profile.facebookURL ?? '',
        websiteURL: profile.websiteURL ?? '',
      }}
      onSubmit={handleSubmit}
      loading={mutationLoading}
    />
  );
}
