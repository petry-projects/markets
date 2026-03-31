/**
 * Authentication hook encapsulating Firebase sign-in/sign-out logic.
 * Handles Google, Apple, and Facebook OAuth flows, JWT storage, and auth state.
 */
import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import auth, { type FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { storeToken, deleteToken } from '@/lib/tokenStorage';
import { setAuthToken } from '@/lib/apollo';

WebBrowser.maybeCompleteAuthSession();

// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- CI types process.env as any
const FACEBOOK_APP_ID = (process.env.EXPO_PUBLIC_FACEBOOK_APP_ID as string | undefined) ?? '';
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion -- CI types process.env as any
const GOOGLE_WEB_CLIENT_ID =
  (process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID as string | undefined) ?? '';
const UAT_BYPASS_AUTH = process.env.EXPO_PUBLIC_UAT_BYPASS_AUTH === 'true';

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
  signInWithFacebook: () => Promise<void>;
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
 * UAT bypass: skip OAuth and go straight to signInWithCredential
 * (the web shim returns a mock user when EXPO_PUBLIC_UAT_BYPASS_AUTH=true).
 * Returns true if bypass was performed.
 */
async function tryUatBypass(): Promise<FirebaseAuthTypes.UserCredential | null> {
  if (!UAT_BYPASS_AUTH || Platform.OS !== 'web') return null;
  const credential = auth.GoogleAuthProvider.credential('uat-bypass');
  return auth().signInWithCredential(credential);
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
      const uatResult = await tryUatBypass();
      if (uatResult) {
        await persistToken(uatResult.user);
        return;
      }

      let credential;

      if (Platform.OS === 'web') {
        // Web: use expo-auth-session OAuth flow (native Google Sign-In SDK not available)
        const redirectUri = AuthSession.makeRedirectUri();
        const request: AuthSession.AuthRequest = new AuthSession.AuthRequest({
          clientId: GOOGLE_WEB_CLIENT_ID,
          redirectUri,
          responseType: AuthSession.ResponseType.Token,
          scopes: ['openid', 'profile', 'email'],
        });
        const discovery: AuthSession.DiscoveryDocument = {
          authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
        };
        const result = await request.promptAsync(discovery);

        if (result.type !== 'success') {
          throw new Error('Google sign-in was cancelled');
        }

        const accessToken = result.params['access_token'];
        if (accessToken == null || accessToken === '') {
          throw new Error('No access token returned from Google');
        }

        credential = auth.GoogleAuthProvider.credential(null, accessToken);
      } else {
        // Native: use @react-native-google-signin SDK
        await GoogleSignin.hasPlayServices();
        const signInResult = await GoogleSignin.signIn();
        const idToken = signInResult.data?.idToken;
        if (idToken == null || idToken === '') {
          throw new Error('No ID token returned from Google Sign-In');
        }
        credential = auth.GoogleAuthProvider.credential(idToken);
      }

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
      const uatResult = await tryUatBypass();
      if (uatResult) {
        await persistToken(uatResult.user);
        return;
      }

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

  const signInWithFacebook = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const uatResult = await tryUatBypass();
      if (uatResult) {
        await persistToken(uatResult.user);
        return;
      }

      const redirectUri = AuthSession.makeRedirectUri();
      const request: AuthSession.AuthRequest = new AuthSession.AuthRequest({
        clientId: FACEBOOK_APP_ID,
        redirectUri,
        responseType: AuthSession.ResponseType.Token,
        scopes: ['public_profile', 'email'],
      });
      const discovery: AuthSession.DiscoveryDocument = {
        authorizationEndpoint: 'https://www.facebook.com/v19.0/dialog/oauth',
      };
      const result = await request.promptAsync(discovery);

      if (result.type !== 'success') {
        throw new Error('Facebook sign-in was cancelled');
      }

      const accessToken = result.params['access_token'];
      if (accessToken == null || accessToken === '') {
        throw new Error('No access token returned from Facebook');
      }

      const credential = auth.FacebookAuthProvider.credential(accessToken);
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
    signInWithFacebook,
    signOut,
    clearError,
  };
}
