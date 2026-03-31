import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import FollowingScreen from '../following';

type MockProps = Record<string, unknown> & { children?: ReactNode };
type MockPressableProps = MockProps & { onPress?: () => void };

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
    Button: ({ children, onPress, ...props }: MockPressableProps) => (
      <Pressable {...props} onPress={onPress}>
        {children}
      </Pressable>
    ),
    ButtonText: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text>,
  };
});
jest.mock('@/components/ui/spinner', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { Spinner: (props: Record<string, unknown>) => <View testID="spinner" {...props} /> };
});

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Heart: (props: Record<string, unknown>) => <View testID="heart-icon" {...props} />,
  };
});

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, back: jest.fn() })),
}));

jest.mock('@/components/customer/FeedItem', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({ feedItem }: { feedItem: { id: string; message: string } }) => (
      <Text testID={`feed-item-${feedItem.id}`}>{feedItem.message}</Text>
    ),
  };
});

const mockRefetch = jest.fn();
const mockFetchMore = jest.fn();
const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  FollowingFeedDocument: { kind: 'Document' },
}));

describe('FollowingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      refetch: mockRefetch,
      fetchMore: mockFetchMore,
    });

    render(<FollowingScreen />);
    expect(screen.getByText('Loading your feed...')).toBeTruthy();
  });

  it('renders empty state when no feed items', () => {
    mockUseQuery.mockReturnValue({
      data: { followingFeed: [] },
      loading: false,
      refetch: mockRefetch,
      fetchMore: mockFetchMore,
    });

    render(<FollowingScreen />);
    expect(screen.getByText('No updates yet')).toBeTruthy();
    expect(screen.getByText('Follow vendors and markets to see their updates here.')).toBeTruthy();
    expect(screen.getByText('Discover Markets')).toBeTruthy();
  });

  it('renders feed items when data is available', () => {
    mockUseQuery.mockReturnValue({
      data: {
        followingFeed: [
          {
            id: 'f1',
            type: 'VENDOR_UPDATE',
            vendor: { id: 'v1', businessName: 'Farm' },
            market: null,
            timestamp: new Date().toISOString(),
            message: 'New products!',
          },
        ],
      },
      loading: false,
      refetch: mockRefetch,
      fetchMore: mockFetchMore,
    });

    render(<FollowingScreen />);
    expect(screen.getByText('Your Feed')).toBeTruthy();
    expect(screen.getByText('New products!')).toBeTruthy();
  });

  it('renders "Discover Markets" button in empty state that navigates', () => {
    mockUseQuery.mockReturnValue({
      data: { followingFeed: [] },
      loading: false,
      refetch: mockRefetch,
      fetchMore: mockFetchMore,
    });

    render(<FollowingScreen />);
    expect(screen.getByLabelText('Go to discover')).toBeTruthy();
  });

  it('navigates to discover when Discover Markets button pressed', () => {
    mockUseQuery.mockReturnValue({
      data: { followingFeed: [] },
      loading: false,
      refetch: mockRefetch,
      fetchMore: mockFetchMore,
    });

    render(<FollowingScreen />);
    fireEvent.press(screen.getByLabelText('Go to discover'));
    expect(mockPush).toHaveBeenCalledWith('/(customer)/discover');
  });

  it('calls fetchMore when end reached', () => {
    const feedItems = [
      {
        id: 'f1',
        type: 'VENDOR_UPDATE',
        vendor: { id: 'v1', businessName: 'Farm' },
        market: null,
        timestamp: new Date().toISOString(),
        message: 'New products!',
      },
    ];

    mockUseQuery.mockReturnValue({
      data: { followingFeed: feedItems },
      loading: false,
      refetch: mockRefetch,
      fetchMore: mockFetchMore,
    });

    render(<FollowingScreen />);

    // The FlatList wires onEndReached to handleLoadMore which calls fetchMore.
    // Trigger onEndReached via the rendered FlatList's scroll event.
    const { FlatList } = require('react-native') as typeof import('react-native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const flatList = screen.UNSAFE_queryAllByType(FlatList)[0];
    expect(flatList).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    flatList.props.onEndReached();
    expect(mockFetchMore).toHaveBeenCalledWith({
      variables: { offset: feedItems.length },
    });
  });

  it('calls refetch on pull-to-refresh', () => {
    mockUseQuery.mockReturnValue({
      data: {
        followingFeed: [
          {
            id: 'f1',
            type: 'VENDOR_UPDATE',
            vendor: { id: 'v1', businessName: 'Farm' },
            market: null,
            timestamp: new Date().toISOString(),
            message: 'Update!',
          },
        ],
      },
      loading: false,
      refetch: mockRefetch,
      fetchMore: mockFetchMore,
    });

    render(<FollowingScreen />);

    // The FlatList has onRefresh={handleRefresh} which calls refetch().
    const { FlatList: FlatListComponent } =
      require('react-native') as typeof import('react-native');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const flatList = screen.UNSAFE_queryAllByType(FlatListComponent)[0];
    expect(flatList).toBeTruthy();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    flatList.props.onRefresh();
    expect(mockRefetch).toHaveBeenCalled();
  });
});
