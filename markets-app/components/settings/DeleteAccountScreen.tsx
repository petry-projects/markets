import React, { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation, useApolloClient } from '@apollo/client/react';
import { AlertTriangle } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { DeleteAccountDocument } from '@/graphql/generated/graphql';
import { useAuth } from '@/hooks/useAuth';

const CONFIRMATION_TEXT = 'DELETE';

export default function DeleteAccountScreen() {
  const router = useRouter();
  const client = useApolloClient();
  const { signOut } = useAuth();
  const [confirmText, setConfirmText] = useState('');
  const [deleteAccount, { loading }] = useMutation(DeleteAccountDocument);

  const isConfirmed = confirmText === CONFIRMATION_TEXT;

  const handleDelete = useCallback(async () => {
    try {
      await deleteAccount();
      await client.clearStore();
      await signOut();
      router.replace('/(auth)');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete account';
      Alert.alert('Error', message);
    }
  }, [deleteAccount, client, signOut, router]);

  const onPressDelete = useCallback(() => {
    Alert.alert(
      'Confirm Account Deletion',
      'This action is permanent and cannot be undone. All your data will be removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Forever',
          style: 'destructive',
          onPress: () => {
            void handleDelete();
          },
        },
      ],
    );
  }, [handleDelete]);

  return (
    <Box className="flex-1 bg-background-0 p-4">
      <VStack className="items-center gap-4 py-6">
        <Box className="w-16 h-16 rounded-full bg-red-100 items-center justify-center">
          <AlertTriangle size={28} color="#ef4444" />
        </Box>
        <Heading className="text-xl text-typography-900">Delete Account</Heading>
        <Text className="text-sm text-typography-500 text-center px-4">
          This action is permanent and cannot be undone. All your data, including your profile,
          preferences, and activity history will be permanently deleted.
        </Text>
      </VStack>

      <VStack className="gap-4 mt-4">
        <Box className="rounded-lg border border-red-200 bg-red-50 p-4">
          <Text className="text-sm text-red-800 font-semibold mb-2">Warning</Text>
          <Text className="text-sm text-red-700">
            Once you delete your account, there is no way to recover it. Please be certain before
            proceeding.
          </Text>
        </Box>

        <VStack className="gap-2">
          <Text className="text-sm text-typography-700">
            Type <Text className="font-bold text-typography-900">{CONFIRMATION_TEXT}</Text> to
            confirm:
          </Text>
          <Input className="border border-outline-300 rounded-lg h-12">
            <InputField
              placeholder={CONFIRMATION_TEXT}
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
              accessibilityLabel="Type DELETE to confirm account deletion"
              testID="confirm-input"
            />
          </Input>
        </VStack>

        <Button
          className={`h-12 rounded-lg ${isConfirmed ? 'bg-red-600' : 'bg-red-300'}`}
          onPress={onPressDelete}
          disabled={!isConfirmed || loading}
          accessibilityLabel="Delete my account"
          testID="delete-account-button"
        >
          {loading ? (
            <Spinner size="small" />
          ) : (
            <ButtonText className="text-white font-semibold">Delete My Account</ButtonText>
          )}
        </Button>

        <Button
          className="h-12 rounded-lg bg-transparent border border-outline-300"
          onPress={() => {
            router.back();
          }}
          accessibilityLabel="Cancel and go back"
          testID="cancel-button"
        >
          <ButtonText className="text-typography-700 font-semibold">Cancel</ButtonText>
        </Button>
      </VStack>
    </Box>
  );
}
