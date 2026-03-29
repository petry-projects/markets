import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ApolloProvider } from '@apollo/client/react';
import 'react-native-reanimated';

import { GluestackUIProvider } from '@/components/gluestack-ui-provider';
import { apolloClient } from '@/lib/apollo';
import '../global.css';

export { ErrorBoundary } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

/**
 * Placeholder role type - will be replaced with real auth in Story 1.2.
 */
type UserRole = 'customer' | 'vendor' | 'manager' | null;

/**
 * Placeholder auth hook - will be replaced with real auth in Story 1.2.
 */
function useAuth(): { isAuthenticated: boolean; role: UserRole } {
  // Default to customer for scaffolding verification.
  // Story 1.2 will implement real Firebase Auth here.
  return { isAuthenticated: true, role: 'customer' };
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- require() for font assets returns an untyped asset ID
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error != null) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      void SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { isAuthenticated, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)');
    } else if (isAuthenticated && inAuthGroup) {
      if (role === 'vendor') {
        router.replace('/(vendor)/markets');
      } else if (role === 'manager') {
        router.replace('/(manager)/dashboard');
      } else {
        router.replace('/(customer)/discover');
      }
    }
  }, [isAuthenticated, role, segments, router]);

  return (
    <ApolloProvider client={apolloClient}>
      <GluestackUIProvider
        mode={colorScheme === 'dark' || colorScheme === 'light' ? colorScheme : undefined}
      >
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Slot />
        </ThemeProvider>
      </GluestackUIProvider>
    </ApolloProvider>
  );
}
