import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import ManagerActivityScreen from '../activity';
import { MarketActivityFeedDocument, MyMarketsDocument } from '@/graphql/generated/graphql';

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

const mockUseLocalSearchParams = jest
  .fn<Record<string, string>, []>()
  .mockReturnValue({ marketID: 'm1' });
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => mockUseLocalSearchParams(),
}));

jest.mock('@/graphql/generated/graphql', () => ({
  MarketActivityFeedDocument: { kind: 'Document' },
  MyMarketsDocument: { kind: 'Document' },
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

  it('uses marketID from route params when provided', () => {
    mockUseLocalSearchParams.mockReturnValue({ marketID: 'market-99' });
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      refetch: jest.fn(),
    });

    render(<ManagerActivityScreen />);

    // First call is MyMarketsDocument (should be skipped), second is MarketActivityFeedDocument
    // When marketID param is provided, MyMarketsDocument query should be skipped
    const myMarketCall = (mockUseQuery.mock.calls as unknown[][]).find(
      (call) => call[0] === MyMarketsDocument,
    );
    expect(myMarketCall?.[1]).toEqual(expect.objectContaining({ skip: true }));

    // MarketActivityFeedDocument should use the param marketID
    const activityCall = (mockUseQuery.mock.calls as unknown[][]).find(
      (call) => call[0] === MarketActivityFeedDocument,
    );
    expect((activityCall?.[1] as Record<string, unknown> | undefined)?.variables).toEqual(
      expect.objectContaining({ marketID: 'market-99' }),
    );
  });

  it('falls back to first market from MyMarketsDocument when no param', () => {
    mockUseLocalSearchParams.mockReturnValue({});
    // First call: MyMarketsDocument returns markets data
    // Second call: MarketActivityFeedDocument
    mockUseQuery
      .mockReturnValueOnce({
        data: {
          myMarkets: [
            { id: 'first-market-id', name: 'First Market' },
            { id: 'second-market-id', name: 'Second Market' },
          ],
        },
        loading: false,
        refetch: jest.fn(),
      })
      .mockReturnValueOnce({
        data: undefined,
        loading: false,
        refetch: jest.fn(),
      });

    render(<ManagerActivityScreen />);

    // MyMarketsDocument should NOT be skipped
    const myMarketCall = (mockUseQuery.mock.calls as unknown[][]).find(
      (call) => call[0] === MyMarketsDocument,
    );
    expect(myMarketCall?.[1]).toEqual(expect.objectContaining({ skip: false }));

    // MarketActivityFeedDocument should use the first market's ID
    const activityCall = (mockUseQuery.mock.calls as unknown[][]).find(
      (call) => call[0] === MarketActivityFeedDocument,
    );
    expect((activityCall?.[1] as Record<string, unknown> | undefined)?.variables).toEqual(
      expect.objectContaining({ marketID: 'first-market-id' }),
    );
  });

  it('renders activity heading and subtitle', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      refetch: jest.fn(),
    });

    render(<ManagerActivityScreen />);
    expect(screen.getByText('Market Activity')).toBeTruthy();
    expect(screen.getByText('Recent activity across your market')).toBeTruthy();
  });
});
