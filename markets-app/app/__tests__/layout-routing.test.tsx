/**
 * Tests for role-based routing in the root layout.
 * Test cases 1.3.9-1.3.12 (navigation aspects).
 */

// Mock implementations
import React from 'react';
import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';

const mockReplace = jest.fn();
const mockUseSegments = jest.fn<string[], []>(() => ['(auth)']);

jest.mock('expo-router', () => ({
  Slot: () => null,
  useRouter: () => ({ replace: mockReplace }),
  useSegments: () => mockUseSegments(),
}));

jest.mock('expo-font', () => ({
  useFonts: () => [true, null],
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('@apollo/client/react', () => ({
  ApolloProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/components/gluestack-ui-provider', () => ({
  GluestackUIProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/lib/apollo', () => ({
  apolloClient: {},
}));

jest.mock('react-native-reanimated', () => ({}));

let mockAuthReturn = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  role: null as string | null,
  uid: null as string | null,
  signInWithGoogle: jest.fn(),
  signInWithApple: jest.fn(),
  signOut: jest.fn(),
  clearError: jest.fn(),
};

jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockAuthReturn,
}));

describe('RootLayout routing', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthReturn = {
      isAuthenticated: false,
      isLoading: false,
      error: null,
      role: null,
      uid: null,
      signInWithGoogle: jest.fn(),
      signInWithApple: jest.fn(),
      signOut: jest.fn(),
      clearError: jest.fn(),
    };
  });

  // Test: Unauthenticated user is redirected to login
  it('redirects unauthenticated user to login', () => {
    mockUseSegments.mockReturnValue(['(customer)']);
    mockAuthReturn.isAuthenticated = false;

    render(<RootLayout />);

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
  });

  // Test case 1.3.12: Returning user with role claim bypasses role selection
  it('routes returning user with customer role directly to customer tabs', () => {
    mockUseSegments.mockReturnValue(['(auth)']);
    mockAuthReturn.isAuthenticated = true;
    mockAuthReturn.role = 'customer';
    mockAuthReturn.uid = 'uid-1';

    render(<RootLayout />);

    expect(mockReplace).toHaveBeenCalledWith('/(customer)/discover');
  });

  it('routes returning user with vendor role directly to vendor tabs', () => {
    mockUseSegments.mockReturnValue(['(auth)']);
    mockAuthReturn.isAuthenticated = true;
    mockAuthReturn.role = 'vendor';
    mockAuthReturn.uid = 'uid-2';

    render(<RootLayout />);

    expect(mockReplace).toHaveBeenCalledWith('/(vendor)/markets');
  });

  it('routes returning user with manager role directly to manager tabs', () => {
    mockUseSegments.mockReturnValue(['(auth)']);
    mockAuthReturn.isAuthenticated = true;
    mockAuthReturn.role = 'manager';
    mockAuthReturn.uid = 'uid-3';

    render(<RootLayout />);

    expect(mockReplace).toHaveBeenCalledWith('/(manager)/dashboard');
  });

  // Test: Authenticated user with no role goes to role selection
  it('routes authenticated user without role to role selection', () => {
    mockUseSegments.mockReturnValue(['(customer)']);
    mockAuthReturn.isAuthenticated = true;
    mockAuthReturn.role = null;
    mockAuthReturn.uid = 'uid-new';

    render(<RootLayout />);

    expect(mockReplace).toHaveBeenCalledWith('/(auth)/role-selection');
  });

  // Test: Does not redirect while loading
  it('does not redirect while loading', () => {
    mockUseSegments.mockReturnValue(['(auth)']);
    mockAuthReturn.isLoading = true;

    render(<RootLayout />);

    expect(mockReplace).not.toHaveBeenCalled();
  });

  // Test: Authenticated user already on role-selection stays there
  it('does not redirect authenticated user already on role-selection', () => {
    mockUseSegments.mockReturnValue(['(auth)', 'role-selection']);
    mockAuthReturn.isAuthenticated = true;
    mockAuthReturn.role = null;
    mockAuthReturn.uid = 'uid-new';

    render(<RootLayout />);

    expect(mockReplace).not.toHaveBeenCalled();
  });
});
