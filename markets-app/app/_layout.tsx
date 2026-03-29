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
import { useAuth, type UserRole } from '@/hooks/useAuth';
import '../global.css';

export { ErrorBoundary } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
void SplashScreen.preventAutoHideAsync();

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
  const { isAuthenticated, isLoading, role } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated -> go to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && role == null && !inAuthGroup) {
      // Authenticated but no role -> go to role selection (first-time user)
      router.replace('/(auth)/role-selection');
    } else if (isAuthenticated && role != null && inAuthGroup) {
      // Authenticated with role but still in auth group -> go to role-specific tabs
      redirectToRoleScreen(router, role);
    }
  }, [isAuthenticated, isLoading, role, segments, router]);

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

function redirectToRoleScreen(routerInstance: ReturnType<typeof useRouter>, role: UserRole): void {
  if (role === 'vendor') {
    routerInstance.replace('/(vendor)/markets');
  } else if (role === 'manager') {
    routerInstance.replace('/(manager)/dashboard');
  } else {
    routerInstance.replace('/(customer)/discover');
  }
}
