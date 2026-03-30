import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import type { ReactNode } from 'react';

import DeleteAccountScreen from '../DeleteAccountScreen';

type MockProps = Record<string, unknown> & { children?: ReactNode };

jest.mock('@/components/ui/box', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { Box: ({ children, ...props }: MockProps) => <View {...props}>{children}</View> };
});
jest.mock('@/components/ui/vstack', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { VStack: ({ children, ...props }: MockProps) => <View {...props}>{children}</View> };
});
jest.mock('@/components/ui/text', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return { Text: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text> };
});
jest.mock('@/components/ui/heading', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return { Heading: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text> };
});
jest.mock('@/components/ui/button', () => {
  const { Pressable, Text } = require('react-native') as typeof import('react-native');
  return {
    Button: ({ children, ...props }: MockProps) => <Pressable {...props}>{children}</Pressable>,
    ButtonText: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text>,
  };
});
jest.mock('@/components/ui/input', () => {
  const { View, TextInput } = require('react-native') as typeof import('react-native');
  return {
    Input: ({ children, ...props }: MockProps) => <View {...props}>{children}</View>,
    InputField: (props: Record<string, unknown>) => <TextInput {...props} />,
  };
});
jest.mock('@/components/ui/spinner', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { Spinner: (props: Record<string, unknown>) => <View testID="spinner" {...props} /> };
});

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    AlertTriangle: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const mockPush = jest.fn();
const mockBack = jest.fn();
const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, back: mockBack, replace: mockReplace })),
}));

const mockDeleteAccount = jest.fn();
const mockUseMutation = jest.fn();
const mockClearStore = jest.fn().mockResolvedValue(undefined);
jest.mock('@apollo/client/react', () => ({
  useMutation: (...args: unknown[]) => mockUseMutation(...args) as unknown,
  useApolloClient: () => ({ clearStore: mockClearStore }) as unknown,
}));

const mockSignOut = jest.fn();
jest.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ signOut: mockSignOut }),
}));

jest.mock('@/graphql/generated/graphql', () => ({
  DeleteAccountDocument: { kind: 'Document' },
}));

describe('DeleteAccountScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDeleteAccount.mockResolvedValue({ data: { deleteAccount: true } });
    mockSignOut.mockResolvedValue(undefined);
    mockUseMutation.mockReturnValue([mockDeleteAccount, { loading: false }]);
  });

  it('renders the delete account screen', () => {
    render(<DeleteAccountScreen />);
    expect(screen.getByText('Delete Account')).toBeTruthy();
    expect(screen.getByText('Delete My Account')).toBeTruthy();
    expect(screen.getByText('Cancel')).toBeTruthy();
  });

  it('renders warning text', () => {
    render(<DeleteAccountScreen />);
    expect(screen.getByText('Warning')).toBeTruthy();
  });

  it('disables delete button when confirmation text is not entered', () => {
    render(<DeleteAccountScreen />);
    expect(screen.getByTestId('delete-account-button')).toBeTruthy();
    expect(screen.getByLabelText('Delete my account')).toBeTruthy();
  });

  it('enables delete button when DELETE is typed', () => {
    render(<DeleteAccountScreen />);
    fireEvent.changeText(screen.getByTestId('confirm-input'), 'DELETE');
    expect(screen.getByTestId('delete-account-button')).toBeTruthy();
  });

  it('shows confirmation alert when delete button is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<DeleteAccountScreen />);
    fireEvent.changeText(screen.getByTestId('confirm-input'), 'DELETE');
    fireEvent.press(screen.getByTestId('delete-account-button'));
    expect(alertSpy).toHaveBeenCalledWith(
      'Confirm Account Deletion',
      expect.any(String) as unknown,
      expect.any(Array) as unknown,
    );
  });

  it('calls deleteAccount mutation and signs out on confirm', async () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    render(<DeleteAccountScreen />);
    fireEvent.changeText(screen.getByTestId('confirm-input'), 'DELETE');
    fireEvent.press(screen.getByTestId('delete-account-button'));

    // Get the destructive button callback from the alert
    const callArgs = alertSpy.mock.calls[0] as unknown[];
    const alertButtons = callArgs[2] as { text: string; onPress?: () => void }[];
    const confirmButton = alertButtons.find((b) => b.text === 'Delete Forever');
    confirmButton?.onPress?.();

    await waitFor(() => {
      expect(mockDeleteAccount).toHaveBeenCalled();
    });
  });

  it('navigates back on cancel', () => {
    render(<DeleteAccountScreen />);
    fireEvent.press(screen.getByTestId('cancel-button'));
    expect(mockBack).toHaveBeenCalled();
  });
});
