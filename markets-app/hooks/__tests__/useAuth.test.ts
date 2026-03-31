import { renderHook, act } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { useAuth } from '../useAuth';

let authStateCallback: ((user: unknown) => void) | null = null;
const mockUnsubscribe = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);

jest.mock('@react-native-firebase/auth', () => {
  const authFn = () => ({
    onAuthStateChanged: (cb: (user: unknown) => void) => {
      authStateCallback = cb;
      return mockUnsubscribe;
    },
    signInWithCredential: jest.fn().mockResolvedValue({
      user: {
        uid: 'test-uid',
        getIdToken: jest.fn().mockResolvedValue('mock-token'),
        getIdTokenResult: jest.fn().mockResolvedValue({
          claims: { role: 'customer' },
        }),
      },
    }),
    signOut: mockSignOut,
  });
  authFn.GoogleAuthProvider = { credential: jest.fn().mockReturnValue('google-cred') };
  authFn.AppleAuthProvider = { credential: jest.fn().mockReturnValue('apple-cred') };
  authFn.FacebookAuthProvider = { credential: jest.fn().mockReturnValue('facebook-cred') };
  return { __esModule: true, default: authFn };
});

jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    hasPlayServices: jest.fn().mockResolvedValue(true),
    signIn: jest.fn().mockResolvedValue({ data: { idToken: 'google-id-token' } }),
  },
}));

jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn().mockResolvedValue({
    identityToken: 'apple-identity-token',
    authorizationCode: 'apple-auth-code',
  }),
  AppleAuthenticationScope: { FULL_NAME: 0, EMAIL: 1 },
}));

const mockPromptAsync = jest.fn().mockResolvedValue({
  type: 'success',
  params: { access_token: 'fb-access-token' },
});

jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn().mockReturnValue('https://redirect.test'),
  AuthRequest: jest.fn().mockImplementation(() => ({
    promptAsync: mockPromptAsync,
  })),
  ResponseType: { Token: 'token' },
  DiscoveryDocument: {},
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
}));

const mockStoreToken = jest.fn().mockResolvedValue(undefined);
const mockDeleteToken = jest.fn().mockResolvedValue(undefined);
jest.mock('@/lib/tokenStorage', () => ({
  storeToken: (...args: unknown[]) => mockStoreToken(...args) as unknown,
  deleteToken: (...args: unknown[]) => mockDeleteToken(...args) as unknown,
}));

const mockSetAuthToken = jest.fn();
jest.mock('@/lib/apollo', () => ({
  setAuthToken: (...args: unknown[]) => mockSetAuthToken(...args) as unknown,
}));

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    authStateCallback = null;
  });

  it('returns initial loading state', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
    expect(result.current.uid).toBeNull();
  });

  it('sets authenticated state when user is signed in', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      if (authStateCallback) {
        authStateCallback({
          uid: 'test-uid',
          getIdToken: jest.fn().mockResolvedValue('jwt-token'),
          getIdTokenResult: jest.fn().mockResolvedValue({
            claims: { role: 'customer' },
          }),
        });
      }
      // Allow async state updates
      await new Promise((r) => {
        setTimeout(r, 10);
      });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.role).toBe('customer');
    expect(result.current.uid).toBe('test-uid');
    expect(result.current.isLoading).toBe(false);
  });

  it('sets unauthenticated state when user signs out', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      if (authStateCallback) {
        authStateCallback(null);
      }
      await new Promise((r) => {
        setTimeout(r, 10);
      });
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
    expect(result.current.uid).toBeNull();
    expect(mockDeleteToken).toHaveBeenCalled();
    expect(mockSetAuthToken).toHaveBeenCalledWith(null);
  });

  it('clearError clears error state', () => {
    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });

  it('signOut calls firebase signOut and clears state', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(mockSignOut).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.role).toBeNull();
  });

  it('handles role null for unknown role claims', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      if (authStateCallback) {
        authStateCallback({
          uid: 'test-uid-2',
          getIdToken: jest.fn().mockResolvedValue('jwt-token'),
          getIdTokenResult: jest.fn().mockResolvedValue({
            claims: { role: 'unknown-role' },
          }),
        });
      }
      await new Promise((r) => {
        setTimeout(r, 10);
      });
    });

    expect(result.current.role).toBeNull();
    expect(result.current.isAuthenticated).toBe(true);
  });

  if (Platform.OS === 'web') {
    it('signInWithGoogle uses auth session on web', async () => {
      // Provide a Google-specific response for promptAsync
      mockPromptAsync.mockResolvedValueOnce({
        type: 'success',
        params: { access_token: 'google-web-access-token' },
      });

      const { result } = renderHook(() => useAuth());
      const authMock = require('@react-native-firebase/auth') as {
        default: { GoogleAuthProvider: { credential: jest.Mock } };
      };

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(mockPromptAsync).toHaveBeenCalled();
      expect(authMock.default.GoogleAuthProvider.credential).toHaveBeenCalledWith(
        null,
        'google-web-access-token',
      );
    });
  } else {
    it('signInWithGoogle calls native google signin flow', async () => {
      const { result } = renderHook(() => useAuth());
      const { GoogleSignin } = require('@react-native-google-signin/google-signin') as {
        GoogleSignin: { hasPlayServices: jest.Mock; signIn: jest.Mock };
      };

      await act(async () => {
        await result.current.signInWithGoogle();
      });

      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
    });
  }

  it('signInWithApple calls apple authentication flow', async () => {
    const { result } = renderHook(() => useAuth());
    const AppleAuth = require('expo-apple-authentication') as { signInAsync: jest.Mock };

    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(AppleAuth.signInAsync).toHaveBeenCalled();
  });

  // Test case 1.2.15: Facebook sign-in calls OAuth flow and exchanges credential
  it('signInWithFacebook calls auth session and exchanges credential', async () => {
    const { result } = renderHook(() => useAuth());
    const AuthSessionMock = require('expo-auth-session') as {
      startAsync: jest.Mock;
      makeRedirectUri: jest.Mock;
    };
    const authMock = require('@react-native-firebase/auth') as {
      default: { FacebookAuthProvider: { credential: jest.Mock } };
    };

    await act(async () => {
      await result.current.signInWithFacebook();
    });

    expect(AuthSessionMock.startAsync).toHaveBeenCalled();
    expect(authMock.default.FacebookAuthProvider.credential).toHaveBeenCalledWith(
      'fb-access-token',
    );
  });

  // Test case 1.2.16: Facebook sign-in handles errors gracefully
  it('signInWithFacebook handles cancelled flow', async () => {
    const AuthSessionMock = require('expo-auth-session') as { startAsync: jest.Mock };
    AuthSessionMock.startAsync.mockResolvedValueOnce({ type: 'dismiss' });

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithFacebook();
    });

    expect(result.current.error).toBe('Sign-in was cancelled. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });

  it('signInWithFacebook handles network error', async () => {
    const AuthSessionMock = require('expo-auth-session') as { startAsync: jest.Mock };
    AuthSessionMock.startAsync.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithFacebook();
    });

    expect(result.current.error).toBe('Network error. Please check your connection and try again.');
  });

  it('signInWithGoogle handles errors gracefully', async () => {
    if (Platform.OS === 'web') {
      const AuthSessionMock = require('expo-auth-session') as { startAsync: jest.Mock };
      AuthSessionMock.startAsync.mockResolvedValueOnce({ type: 'dismiss' });
    } else {
      const { GoogleSignin } = require('@react-native-google-signin/google-signin') as {
        GoogleSignin: { signIn: jest.Mock };
      };
      GoogleSignin.signIn.mockRejectedValueOnce(new Error('cancelled by user'));
    }

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithGoogle();
    });

    expect(result.current.error).toBe('Sign-in was cancelled. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });

  it('signInWithApple handles network error', async () => {
    const AppleAuth = require('expo-apple-authentication') as { signInAsync: jest.Mock };
    AppleAuth.signInAsync.mockRejectedValueOnce(new Error('network error'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signInWithApple();
    });

    expect(result.current.error).toBe('Network error. Please check your connection and try again.');
  });

  it('signOut handles error gracefully', async () => {
    mockSignOut.mockRejectedValueOnce(new Error('sign out failed'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.signOut();
    });

    expect(result.current.error).toBe('Sign-in failed. Please try again.');
    expect(result.current.isLoading).toBe(false);
  });
});
