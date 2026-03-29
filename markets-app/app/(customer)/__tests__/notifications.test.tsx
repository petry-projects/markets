import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import CustomerNotificationsScreen from '../notifications';

type MockProps = Record<string, unknown> & { children?: ReactNode };

jest.mock('@/components/ui/box', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Box: ({ children, ...props }: MockProps) => <View {...props}>{children}</View>,
  };
});
jest.mock('@/components/ui/vstack', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    VStack: ({ children, ...props }: MockProps) => <View {...props}>{children}</View>,
  };
});
jest.mock('@/components/ui/text', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    Text: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text>,
  };
});
jest.mock('@/components/ui/heading', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    Heading: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text>,
  };
});
jest.mock('@/components/ui/spinner', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Spinner: (props: Record<string, unknown>) => <View testID="spinner" {...props} />,
  };
});

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Bell: (props: Record<string, unknown>) => <View testID="bell-icon" {...props} />,
  };
});

const mockUseQuery = jest.fn();
const mockMutate = jest.fn();
const mockUseMutation = jest.fn(() => [mockMutate]);
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
  useMutation: () => mockUseMutation() as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  MyNotificationPrefsDocument: { kind: 'Document' },
  UpdateNotificationPrefsDocument: { kind: 'Document' },
}));

describe('CustomerNotificationsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when loading with no data', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
    });

    render(<CustomerNotificationsScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders notification preferences heading', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myNotificationPreferences: {
          id: 'np1',
          pushEnabled: true,
          vendorCheckInAlerts: true,
          marketUpdateAlerts: false,
          exceptionAlerts: true,
        },
      },
      loading: false,
    });

    render(<CustomerNotificationsScreen />);
    expect(screen.getByText('Notifications')).toBeTruthy();
  });

  it('renders all preference toggle labels', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myNotificationPreferences: {
          id: 'np1',
          pushEnabled: true,
          vendorCheckInAlerts: false,
          marketUpdateAlerts: false,
          exceptionAlerts: false,
        },
      },
      loading: false,
    });

    render(<CustomerNotificationsScreen />);
    expect(screen.getByText('Push Notifications')).toBeTruthy();
    expect(screen.getByText('Check-in Alerts')).toBeTruthy();
    expect(screen.getByText('Market Updates')).toBeTruthy();
    expect(screen.getByText('Exception Alerts')).toBeTruthy();
  });

  it('calls mutation when toggling a preference', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myNotificationPreferences: {
          id: 'np1',
          pushEnabled: true,
          vendorCheckInAlerts: false,
          marketUpdateAlerts: false,
          exceptionAlerts: false,
        },
      },
      loading: false,
    });

    render(<CustomerNotificationsScreen />);
    fireEvent.press(screen.getByLabelText('Check-in Alerts'));
    expect(mockMutate).toHaveBeenCalled();
  });

  it('renders with null preferences (defaults to false)', () => {
    mockUseQuery.mockReturnValue({
      data: { myNotificationPreferences: null },
      loading: false,
    });

    render(<CustomerNotificationsScreen />);
    expect(screen.getByText('Notifications')).toBeTruthy();
  });
});
