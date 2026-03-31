import React from 'react';
import { render, screen } from '@testing-library/react-native';
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
      refetch: jest.fn(),
      fetchMore: jest.fn(),
    });

    render(<FollowingScreen />);
    expect(screen.getByText('Loading your feed...')).toBeTruthy();
  });

  it('renders empty state when no feed items', () => {
    mockUseQuery.mockReturnValue({
      data: { followingFeed: [] },
      loading: false,
      refetch: jest.fn(),
      fetchMore: jest.fn(),
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
      refetch: jest.fn(),
      fetchMore: jest.fn(),
    });

    render(<FollowingScreen />);
    expect(screen.getByText('Your Feed')).toBeTruthy();
    expect(screen.getByText('New products!')).toBeTruthy();
  });

  it('renders "Discover Markets" button in empty state that navigates', () => {
    mockUseQuery.mockReturnValue({
      data: { followingFeed: [] },
      loading: false,
      refetch: jest.fn(),
      fetchMore: jest.fn(),
    });

    render(<FollowingScreen />);
    expect(screen.getByLabelText('Go to discover')).toBeTruthy();
  });
});
