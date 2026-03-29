/**
 * Firebase Auth + Realtime Database configuration.
 * Placeholder - will be implemented in Story 1.2 (Authentication).
 */

// Firebase Auth configuration will be added here
// Google and Apple Sign-In providers
// JWT token management

export const firebaseConfig = {
  // Configuration values will come from environment variables
  apiKey: (process.env['EXPO_PUBLIC_FIREBASE_API_KEY'] as string | undefined) ?? '',
  authDomain: (process.env['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'] as string | undefined) ?? '',
  projectId: (process.env['EXPO_PUBLIC_FIREBASE_PROJECT_ID'] as string | undefined) ?? '',
  databaseURL: (process.env['EXPO_PUBLIC_FIREBASE_DATABASE_URL'] as string | undefined) ?? '',
};
