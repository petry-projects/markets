import React, { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useMutation } from '@apollo/client/react';
import { Alert } from 'react-native';
import VendorProfileForm, { VendorProfileFormData } from '@/components/vendor/VendorProfileForm';
import { CreateVendorProfileDocument, MyVendorProfileDocument } from '@/graphql/generated/graphql';

export default function CreateVendorProfileScreen() {
  const router = useRouter();
  const [createProfile, { loading }] = useMutation(CreateVendorProfileDocument, {
    refetchQueries: [{ query: MyVendorProfileDocument }],
  });

  const handleSubmit = useCallback(
    (data: VendorProfileFormData) => {
      void createProfile({
        variables: {
          input: {
            businessName: data.businessName,
            description: data.description || undefined,
            contactInfo: data.contactInfo || undefined,
            instagramHandle: data.instagramHandle || undefined,
            facebookURL: data.facebookURL || undefined,
            websiteURL: data.websiteURL || undefined,
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
    [createProfile, router],
  );

  return <VendorProfileForm mode="create" onSubmit={handleSubmit} loading={loading} />;
}
