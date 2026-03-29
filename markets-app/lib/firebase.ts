/**
 * Firebase Auth configuration.
 * Initializes Firebase app and exports the auth instance for Google and Apple Sign-In.
 */
import { firebase } from '@react-native-firebase/auth';

export const firebaseConfig = {
  apiKey: process.env['EXPO_PUBLIC_FIREBASE_API_KEY'] ?? '',
  authDomain: process.env['EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'] ?? '',
  projectId: process.env['EXPO_PUBLIC_FIREBASE_PROJECT_ID'] ?? '',
  databaseURL: process.env['EXPO_PUBLIC_FIREBASE_DATABASE_URL'] ?? '',
};

/**
 * Returns the Firebase Auth instance.
 * Uses the default Firebase app initialized by @react-native-firebase/auth.
 */
export function getFirebaseAuth() {
  return firebase.auth();
}
