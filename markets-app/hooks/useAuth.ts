/**
 * Authentication hook encapsulating Firebase sign-in/sign-out logic.
 * Handles Google and Apple OAuth flows, JWT storage, and auth state.
 */
import { useState, useEffect, useCallback } from 'react';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { storeToken, deleteToken } from '@/lib/tokenStorage';
import { setAuthToken } from '@/lib/apollo';

export type UserRole = 'customer' | 'vendor' | 'manager' | null;

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  role: UserRole;
  uid: string | null;
}

export interface AuthActions {
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

/**
 * Extracts the Firebase JWT from the current user and stores it.
 */
async function persistToken(user: FirebaseAuthTypes.User): Promise<string> {
  const idToken = await user.getIdToken();
  await storeToken(idToken);
  setAuthToken(idToken);
  return idToken;
}

/**
 * Maps a raw error into a user-friendly message.
 * Never exposes raw error strings to users.
 */
function toUserFriendlyError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('cancelled') || error.message.includes('canceled')) {
      return 'Sign-in was cancelled. Please try again.';
    }
    if (error.message.includes('network')) {
      return 'Network error. Please check your connection and try again.';
    }
  }
  return 'Sign-in failed. Please try again.';
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    role: null,
    uid: null,
  });

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      void (async () => {
        if (user) {
          try {
            const idTokenResult = await user.getIdTokenResult();
            const rawRole = idTokenResult.claims['role'] as string | undefined;
            const role: UserRole =
              rawRole === 'customer' || rawRole === 'vendor' || rawRole === 'manager'
                ? rawRole
                : null;
            const idToken = await user.getIdToken();
            await storeToken(idToken);
            setAuthToken(idToken);
            setState({
              isAuthenticated: true,
              isLoading: false,
              error: null,
              role,
              uid: user.uid,
            });
          } catch {
            setState((prev) => ({ ...prev, isLoading: false }));
          }
        } else {
          await deleteToken();
          setAuthToken(null);
          setState({
            isAuthenticated: false,
            isLoading: false,
            error: null,
            role: null,
            uid: null,
          });
        }
      })();
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (idToken == null || idToken === '') {
        throw new Error('No ID token returned from Google Sign-In');
      }
      const credential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(credential);
      await persistToken(userCredential.user);
    } catch (error: unknown) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: toUserFriendlyError(error),
      }));
    }
  }, []);

  const signInWithApple = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const appleCredential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      const { identityToken } = appleCredential;
      if (identityToken == null || identityToken === '') {
        throw new Error('No identity token returned from Apple Sign-In');
      }

      const credential = auth.AppleAuthProvider.credential(
        identityToken,
        appleCredential.authorizationCode ?? undefined,
      );
      const userCredential = await auth().signInWithCredential(credential);
      await persistToken(userCredential.user);
    } catch (error: unknown) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: toUserFriendlyError(error),
      }));
    }
  }, []);

  const signOut = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      await auth().signOut();
      await deleteToken();
      setAuthToken(null);
      setState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        role: null,
        uid: null,
      });
    } catch (error: unknown) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: toUserFriendlyError(error),
      }));
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    signInWithGoogle,
    signInWithApple,
    signOut,
    clearError,
  };
}
