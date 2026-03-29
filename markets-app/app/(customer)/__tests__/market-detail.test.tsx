import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import MarketDetailScreen from '../market/[id]';

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
    MapPin: (props: Record<string, unknown>) => <View {...props} />,
    Clock: (props: Record<string, unknown>) => <View {...props} />,
    ChevronLeft: (props: Record<string, unknown>) => <View {...props} />,
  };
});

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'market-1' })),
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
}));

jest.mock('@/components/customer/VendorDiscoverCard', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({ vendor }: { vendor: { businessName: string } }) => (
      <Text testID="vendor-card">{vendor.businessName}</Text>
    ),
  };
});

jest.mock('@/components/customer/FollowButton', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({ isFollowing }: { isFollowing: boolean }) => (
      <Text testID="follow-button">{isFollowing ? 'Following' : 'Follow'}</Text>
    ),
  };
});

const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  GetMarketDocument: { kind: 'Document', definitions: [{ name: { value: 'GetMarket' } }] },
  DiscoverVendorsDocument: {
    kind: 'Document',
    definitions: [{ name: { value: 'DiscoverVendors' } }],
  },
  MyCustomerProfileDocument: {
    kind: 'Document',
    definitions: [{ name: { value: 'MyCustomerProfile' } }],
  },
}));

jest.mock('@/hooks/useFollow', () => ({
  useFollow: () => ({ toggleFollow: jest.fn(), loading: false }),
}));

describe('MarketDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when market is loading', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
    });

    render(<MarketDetailScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders market not found when data is null and not loading', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
    });

    render(<MarketDetailScreen />);
    expect(screen.getByText('Market not found.')).toBeTruthy();
  });

  it('renders market details when data is available', () => {
    const callCount = { current: 0 };
    mockUseQuery.mockImplementation(() => {
      callCount.current += 1;
      if (callCount.current === 1) {
        return {
          data: {
            market: {
              id: 'market-1',
              name: 'Downtown Market',
              address: '123 Main St',
              description: 'A great market',
              schedule: [],
            },
          },
          loading: false,
        };
      }
      if (callCount.current === 2) {
        return {
          data: { discoverVendors: [] },
          loading: false,
        };
      }
      return {
        data: {
          myCustomerProfile: {
            followedMarkets: [],
            followedVendors: [],
          },
        },
        loading: false,
      };
    });

    render(<MarketDetailScreen />);
    expect(screen.getByText('Downtown Market')).toBeTruthy();
    expect(screen.getByText('123 Main St')).toBeTruthy();
    expect(screen.getByText('A great market')).toBeTruthy();
  });
});
