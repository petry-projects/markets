import React from 'react';
import { Platform } from 'react-native';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
  const { isLoading, error, signInWithGoogle, signInWithApple, clearError } = useAuth();

  return (
    <Box className="flex-1 items-center justify-center bg-background-0 px-6">
      <VStack className="w-full max-w-sm items-center gap-6">
        <Heading className="text-3xl text-typography-900">Markets</Heading>
        <Text className="text-center text-typography-500">
          Sign in to discover local farmers markets
        </Text>

        {error != null && (
          <Box
            className="w-full rounded-lg bg-error-50 px-4 py-3"
            accessibilityRole="alert"
            accessibilityLabel={error}
          >
            <Text className="text-center text-sm text-error-700">{error}</Text>
            <Button
              className="mt-2 self-center bg-transparent"
              onPress={clearError}
              accessibilityLabel="Dismiss error"
              disabled={isLoading}
            >
              <ButtonText className="text-sm text-error-700">Dismiss</ButtonText>
            </Button>
          </Box>
        )}

        <VStack className="w-full gap-3">
          <Button
            className="w-full rounded-lg bg-primary-500 px-4 py-3"
            onPress={() => void signInWithGoogle()}
            accessibilityLabel="Sign in with Google"
            disabled={isLoading}
          >
            <ButtonText className="text-center text-base font-semibold text-white">
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </ButtonText>
          </Button>

          {Platform.OS === 'ios' && (
            <Button
              className="w-full rounded-lg bg-typography-900 px-4 py-3"
              onPress={() => void signInWithApple()}
              accessibilityLabel="Sign in with Apple"
              disabled={isLoading}
            >
              <ButtonText className="text-center text-base font-semibold text-white">
                {isLoading ? 'Signing in...' : 'Sign in with Apple'}
              </ButtonText>
            </Button>
          )}
        </VStack>

        {isLoading && (
          <Box className="mt-2" accessibilityLabel="Signing in" accessibilityRole="progressbar">
            <Text className="text-sm text-typography-400">Authenticating...</Text>
          </Box>
        )}
      </VStack>
    </Box>
  );
}
