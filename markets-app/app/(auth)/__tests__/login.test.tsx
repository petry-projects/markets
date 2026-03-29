/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform } from 'react-native';
import LoginScreen from '../login';

// Mock useAuth hook
const mockSignInWithGoogle = jest.fn();
const mockSignInWithApple = jest.fn();
const mockClearError = jest.fn();

const defaultAuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null as string | null,
  role: null,
  uid: null,
  signInWithGoogle: mockSignInWithGoogle,
  signInWithApple: mockSignInWithApple,
  signOut: jest.fn(),
  clearError: mockClearError,
};

let mockAuthReturn = { ...defaultAuthState };

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthReturn,
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
  useRouter: () => ({ replace: jest.fn() }),
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthReturn = { ...defaultAuthState };
  });

  // Test case 1.2.8: Google sign-in button renders with accessibility label
  it('renders Google sign-in button with correct accessibility label', () => {
    const { getByLabelText } = render(<LoginScreen />);
    const googleButton = getByLabelText('Sign in with Google');
    expect(googleButton).toBeTruthy();
  });

  // Test case 1.2.9: Apple sign-in button renders with accessibility label
  it('renders Apple sign-in button with correct accessibility label on iOS', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { get: () => 'ios' });

    const { getByLabelText } = render(<LoginScreen />);
    const appleButton = getByLabelText('Sign in with Apple');
    expect(appleButton).toBeTruthy();

    Object.defineProperty(Platform, 'OS', { get: () => originalPlatform });
  });

  it('does not render Apple sign-in button on Android', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { get: () => 'android' });

    const { queryByLabelText } = render(<LoginScreen />);
    const appleButton = queryByLabelText('Sign in with Apple');
    expect(appleButton).toBeNull();

    Object.defineProperty(Platform, 'OS', { get: () => originalPlatform });
  });

  // Test case 1.2.12: Auth error shows user-friendly message (not raw error)
  it('displays user-friendly error message on auth failure', () => {
    mockAuthReturn = {
      ...defaultAuthState,
      error: 'Sign-in failed. Please try again.',
    };

    const { getByText } = render(<LoginScreen />);
    expect(getByText('Sign-in failed. Please try again.')).toBeTruthy();
  });

  it('does not display raw error messages', () => {
    mockAuthReturn = {
      ...defaultAuthState,
      error: 'Sign-in failed. Please try again.',
    };

    const { queryByText } = render(<LoginScreen />);
    // Should not contain raw Firebase errors
    expect(queryByText(/Firebase/i)).toBeNull();
    expect(queryByText(/auth\/network-request-failed/i)).toBeNull();
  });

  it('allows dismissing error message', () => {
    mockAuthReturn = {
      ...defaultAuthState,
      error: 'Sign-in failed. Please try again.',
    };

    const { getByLabelText } = render(<LoginScreen />);
    const dismissButton = getByLabelText('Dismiss error');
    fireEvent.press(dismissButton);
    expect(mockClearError).toHaveBeenCalled();
  });

  // Test case 1.2.13: Loading state during sign-in (indicator shown, button disabled)
  it('shows loading indicator and disables buttons during sign-in', () => {
    mockAuthReturn = {
      ...defaultAuthState,
      isLoading: true,
    };

    const { getByLabelText, getByText } = render(<LoginScreen />);

    // Loading text shown
    expect(getByText('Authenticating...')).toBeTruthy();

    // Google button should be disabled
    const googleButton = getByLabelText('Sign in with Google');
    expect(
      googleButton.props.accessibilityState?.disabled ?? googleButton.props.disabled,
    ).toBeTruthy();
  });

  it('shows "Signing in..." text on buttons during loading', () => {
    mockAuthReturn = {
      ...defaultAuthState,
      isLoading: true,
    };

    const { getAllByText } = render(<LoginScreen />);
    // At least one button should show "Signing in..."
    const signingInTexts = getAllByText('Signing in...');
    expect(signingInTexts.length).toBeGreaterThan(0);
  });

  it('calls signInWithGoogle when Google button is pressed', () => {
    const { getByLabelText } = render(<LoginScreen />);
    const googleButton = getByLabelText('Sign in with Google');
    fireEvent.press(googleButton);
    expect(mockSignInWithGoogle).toHaveBeenCalled();
  });

  it('renders the Markets heading', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Markets')).toBeTruthy();
  });

  it('renders sign-in description text', () => {
    const { getByText } = render(<LoginScreen />);
    expect(getByText('Sign in to discover local farmers markets')).toBeTruthy();
  });
});
