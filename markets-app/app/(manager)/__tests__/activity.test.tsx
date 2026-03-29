import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import ManagerActivityScreen from '../activity';

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

jest.mock('@/components/activity/ActivityFeedItem', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({ item }: { item: { message: string } }) => (
      <Text testID="feed-item">{item.message}</Text>
    ),
  };
});

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    LogIn: (props: Record<string, unknown>) => <View {...props} />,
    LogOut: (props: Record<string, unknown>) => <View {...props} />,
    AlertTriangle: (props: Record<string, unknown>) => <View {...props} />,
    Megaphone: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  MarketActivityFeedDocument: { kind: 'Document' },
}));

describe('ManagerActivityScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when query is skipped (no market ID)', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      refetch: jest.fn(),
    });

    render(<ManagerActivityScreen />);
    expect(screen.getByText('No market activity yet')).toBeTruthy();
  });

  it('renders heading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      refetch: jest.fn(),
    });

    render(<ManagerActivityScreen />);
    expect(screen.getByText('Market Activity')).toBeTruthy();
  });

  it('renders loading spinner when loading', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn(),
    });

    render(<ManagerActivityScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders activity items', () => {
    mockUseQuery.mockReturnValue({
      data: {
        marketActivityFeed: [
          {
            id: 'a1',
            actorID: 'u1',
            actionType: 'check_in',
            targetType: 'vendor',
            targetID: 'v1',
            marketID: 'm1',
            message: 'Vendor arrived at market',
            createdAt: new Date().toISOString(),
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<ManagerActivityScreen />);
    expect(screen.getByText('Vendor arrived at market')).toBeTruthy();
  });
});
