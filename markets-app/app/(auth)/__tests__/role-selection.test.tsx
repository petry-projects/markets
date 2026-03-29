import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RoleSelectionScreen from '../role-selection';

// --- Mocks ---

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

const mockGetIdToken = jest.fn().mockResolvedValue('new-token');
jest.mock('@react-native-firebase/auth', () => {
  const authInstance = () => ({
    currentUser: {
      displayName: 'Test User',
      email: 'test@example.com',
      getIdToken: mockGetIdToken,
    },
  });
  authInstance.GoogleAuthProvider = { credential: jest.fn() };
  authInstance.AppleAuthProvider = { credential: jest.fn() };
  return {
    __esModule: true,
    default: authInstance,
  };
});

jest.mock('@/lib/tokenStorage', () => ({
  storeToken: jest.fn().mockResolvedValue(undefined),
  getToken: jest.fn().mockResolvedValue(null),
  deleteToken: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/apollo', () => ({
  setAuthToken: jest.fn(),
  apolloClient: {},
}));

// Mock Apollo useMutation and gql directly
const mockCreateUser = jest.fn();
let mockLoading = false;

jest.mock('@apollo/client', () => ({
  gql: (strings: TemplateStringsArray) => strings[0],
}));

jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockCreateUser, { loading: mockLoading }],
}));

// --- Tests ---

describe('RoleSelectionScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoading = false;
    mockCreateUser.mockResolvedValue({
      data: {
        createUser: {
          user: { id: 'user-123', role: 'CUSTOMER' },
        },
      },
    });
  });

  // Test case 1.3.8: Role selection screen renders three options with descriptions
  it('renders three role options with descriptions', () => {
    const { getByText } = render(<RoleSelectionScreen />);

    // Heading
    expect(getByText('Choose Your Role')).toBeTruthy();

    // Three role options
    expect(getByText('Customer')).toBeTruthy();
    expect(getByText('Vendor')).toBeTruthy();
    expect(getByText('Market Manager')).toBeTruthy();

    // Descriptions
    expect(
      getByText(
        'Discover local farmers markets, follow your favorite vendors, and get real-time updates.',
      ),
    ).toBeTruthy();
    expect(
      getByText(
        'Manage your market schedule, update product availability, and connect with customers.',
      ),
    ).toBeTruthy();
    expect(
      getByText(
        'Organize and oversee your farmers market, manage vendors, and keep everything running smoothly.',
      ),
    ).toBeTruthy();
  });

  // Test: All role buttons have accessibility labels
  it('has accessibility labels on all role buttons', () => {
    const { getByLabelText } = render(<RoleSelectionScreen />);

    expect(getByLabelText('Select Customer role')).toBeTruthy();
    expect(getByLabelText('Select Vendor role')).toBeTruthy();
    expect(getByLabelText('Select Market Manager role')).toBeTruthy();
  });

  // Test case 1.3.9: Selecting customer role navigates to (customer)/ tabs
  it('navigates to customer tabs after selecting customer role', async () => {
    const { getByLabelText } = render(<RoleSelectionScreen />);

    fireEvent.press(getByLabelText('Select Customer role'));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        variables: {
          input: {
            role: 'CUSTOMER',
            name: 'Test User',
          },
        },
      });
      expect(mockReplace).toHaveBeenCalledWith('/(customer)/discover');
    });
  });

  // Test case 1.3.10: Selecting vendor role navigates to (vendor)/ tabs
  it('navigates to vendor tabs after selecting vendor role', async () => {
    const { getByLabelText } = render(<RoleSelectionScreen />);

    fireEvent.press(getByLabelText('Select Vendor role'));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        variables: {
          input: {
            role: 'VENDOR',
            name: 'Test User',
          },
        },
      });
      expect(mockReplace).toHaveBeenCalledWith('/(vendor)/markets');
    });
  });

  // Test case 1.3.11: Selecting manager role navigates to (manager)/ tabs
  it('navigates to manager tabs after selecting manager role', async () => {
    const { getByLabelText } = render(<RoleSelectionScreen />);

    fireEvent.press(getByLabelText('Select Market Manager role'));

    await waitFor(() => {
      expect(mockCreateUser).toHaveBeenCalledWith({
        variables: {
          input: {
            role: 'MANAGER',
            name: 'Test User',
          },
        },
      });
      expect(mockReplace).toHaveBeenCalledWith('/(manager)/dashboard');
    });
  });

  // Test case 1.3.13: Role selection error shows retry option
  it('shows error message with retry on mutation failure', async () => {
    mockCreateUser.mockRejectedValueOnce(new Error('Network error'));

    const { getByLabelText, getByText } = render(<RoleSelectionScreen />);

    fireEvent.press(getByLabelText('Select Customer role'));

    await waitFor(() => {
      expect(getByText('Role selection failed. Tap to retry.')).toBeTruthy();
    });

    // Dismiss button should be present
    expect(getByLabelText('Dismiss error')).toBeTruthy();
  });
});
