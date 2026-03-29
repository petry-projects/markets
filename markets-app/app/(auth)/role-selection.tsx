import React, { useState, useCallback } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { useRouter } from 'expo-router';
import { gql } from '@apollo/client';
import { useMutation } from '@apollo/client/react';
import auth from '@react-native-firebase/auth';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { storeToken } from '@/lib/tokenStorage';
import { setAuthToken } from '@/lib/apollo';

const CREATE_USER_MUTATION = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      user {
        id
        role
      }
    }
  }
`;

type RoleOption = {
  role: 'CUSTOMER' | 'VENDOR' | 'MANAGER';
  label: string;
  description: string;
};

interface CreateUserData {
  createUser: {
    user: {
      id: string;
      role: string;
    };
  };
}

interface CreateUserVariables {
  input: {
    role: string;
    name: string;
  };
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    role: 'CUSTOMER',
    label: 'Customer',
    description:
      'Discover local farmers markets, follow your favorite vendors, and get real-time updates.',
  },
  {
    role: 'VENDOR',
    label: 'Vendor',
    description:
      'Manage your market schedule, update product availability, and connect with customers.',
  },
  {
    role: 'MANAGER',
    label: 'Market Manager',
    description:
      'Organize and oversee your farmers market, manage vendors, and keep everything running smoothly.',
  },
];

export default function RoleSelectionScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const [createUser, { loading }] = useMutation<CreateUserData, CreateUserVariables>(
    CREATE_USER_MUTATION,
  );

  const handleRoleSelect = useCallback(
    async (role: RoleOption) => {
      setError(null);
      setSelectedRole(role.role);

      try {
        const currentUser = auth().currentUser;
        const displayName = currentUser?.displayName ?? currentUser?.email ?? 'User';

        await createUser({
          variables: {
            input: {
              role: role.role,
              name: displayName,
            },
          },
        });

        // Force token refresh to get the new role custom claim
        if (currentUser) {
          const newToken = await currentUser.getIdToken(true);
          await storeToken(newToken);
          setAuthToken(newToken);
        }

        // Navigate to role-appropriate tab layout
        if (role.role === 'CUSTOMER') {
          router.replace('/(customer)/discover');
        } else if (role.role === 'VENDOR') {
          router.replace('/(vendor)/markets');
        } else {
          router.replace('/(manager)/dashboard');
        }
      } catch {
        setError('Role selection failed. Tap to retry.');
        setSelectedRole(null);
      }
    },
    [createUser, router],
  );

  return (
    <Box className="flex-1 items-center justify-center bg-background-0 px-6">
      <VStack className="w-full max-w-sm items-center gap-6">
        <Heading className="text-2xl text-typography-900" accessibilityRole="header">
          Choose Your Role
        </Heading>
        <Text className="text-center text-typography-500">Select how you want to use Markets</Text>

        {error != null && (
          <Box
            className="w-full rounded-lg bg-error-50 px-4 py-3"
            accessibilityRole="alert"
            accessibilityLabel={error}
          >
            <Text className="text-center text-sm text-error-700">{error}</Text>
            <Button
              className="mt-2 self-center bg-transparent"
              onPress={() => {
                setError(null);
              }}
              accessibilityLabel="Dismiss error"
              disabled={loading}
            >
              <ButtonText className="text-sm text-error-700">Dismiss</ButtonText>
            </Button>
          </Box>
        )}

        <VStack className="w-full gap-4">
          {ROLE_OPTIONS.map((option) => (
            <Button
              key={option.role}
              className="w-full rounded-lg bg-primary-500 px-4 py-4"
              onPress={() => void handleRoleSelect(option)}
              accessibilityLabel={`Select ${option.label} role`}
              accessibilityHint={option.description}
              disabled={loading}
            >
              <VStack className="w-full items-center gap-1">
                {loading && selectedRole === option.role ? (
                  <Spinner color="white" accessibilityLabel="Setting up your account" />
                ) : (
                  <>
                    <ButtonText className="text-center text-lg font-semibold text-white">
                      {option.label}
                    </ButtonText>
                    <Text className="text-center text-xs text-primary-100">
                      {option.description}
                    </Text>
                  </>
                )}
              </VStack>
            </Button>
          ))}
        </VStack>
      </VStack>
    </Box>
  );
}
