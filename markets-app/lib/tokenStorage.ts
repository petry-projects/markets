/**
 * JWT token storage using expo-secure-store.
 * Provides encrypted, platform-native storage (iOS Keychain / Android Keystore).
 */
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'firebase_jwt';

/**
 * Store a Firebase JWT in secure storage.
 */
export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Retrieve the stored Firebase JWT from secure storage.
 * Returns null if no token is stored.
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Delete the stored Firebase JWT from secure storage.
 * Used during sign-out.
 */
export async function deleteToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}
