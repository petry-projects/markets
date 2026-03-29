/**
 * Firebase Auth configuration.
 * Initializes Firebase app and exports the auth instance for Google and Apple Sign-In.
 */
import { firebase } from '@react-native-firebase/auth';

export const firebaseConfig = {
  apiKey:
    typeof process.env.EXPO_PUBLIC_FIREBASE_API_KEY === 'string'
      ? process.env.EXPO_PUBLIC_FIREBASE_API_KEY
      : '',
  authDomain:
    typeof process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN === 'string'
      ? process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
      : '',
  projectId:
    typeof process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID === 'string'
      ? process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID
      : '',
  databaseURL:
    typeof process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL === 'string'
      ? process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL
      : '',
};

/**
 * Returns the Firebase Auth instance.
 * Uses the default Firebase app initialized by @react-native-firebase/auth.
 */
export function getFirebaseAuth() {
  return firebase.auth();
}
