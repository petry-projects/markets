/**
 * JWT token storage.
 * Uses expo-secure-store (iOS Keychain / Android Keystore) on native,
 * falls back to localStorage on web.
 */
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'firebase_jwt';

/**
 * Store a Firebase JWT.
 */
export async function storeToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

/**
 * Retrieve the stored Firebase JWT.
 * Returns null if no token is stored.
 */
export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Delete the stored Firebase JWT.
 * Used during sign-out.
 */
export async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}
