import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import ActivityLogScreen from '../ActivityLogScreen';

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
jest.mock('@/components/ui/spinner', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { Spinner: (props: Record<string, unknown>) => <View testID="spinner" {...props} /> };
});

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Clock: (props: Record<string, unknown>) => <View {...props} />,
    FileText: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  MyActivityLogDocument: { kind: 'Document' },
}));

describe('ActivityLogScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when loading with no data', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn(),
    });

    render(<ActivityLogScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders activity log items', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myActivityLog: [
          {
            id: '1',
            actorID: 'user-1',
            actorRole: 'CUSTOMER',
            actionType: 'PROFILE_UPDATE',
            targetType: 'User',
            targetID: 'user-1',
            marketID: null,
            timestamp: '2026-03-15T10:30:00Z',
            payload: null,
          },
          {
            id: '2',
            actorID: 'user-1',
            actorRole: 'CUSTOMER',
            actionType: 'FOLLOW_VENDOR',
            targetType: 'Vendor',
            targetID: 'vendor-1',
            marketID: null,
            timestamp: '2026-03-14T09:00:00Z',
            payload: null,
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<ActivityLogScreen />);
    expect(screen.getByText('Activity Log')).toBeTruthy();
    expect(screen.getByText('Profile update')).toBeTruthy();
    expect(screen.getByText('Follow vendor')).toBeTruthy();
    expect(screen.getByText('User user-1')).toBeTruthy();
    expect(screen.getByText('Vendor vendor-1')).toBeTruthy();
  });

  it('renders empty state when no items', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myActivityLog: [],
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<ActivityLogScreen />);
    expect(screen.getByText('No activity recorded yet')).toBeTruthy();
  });

  it('renders header text', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myActivityLog: [],
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<ActivityLogScreen />);
    expect(screen.getByText('Your recent account activity')).toBeTruthy();
  });
});
