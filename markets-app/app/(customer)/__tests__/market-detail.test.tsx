import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
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

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'market-1' })),
  useRouter: jest.fn(() => ({ push: mockPush, back: mockBack })),
}));

jest.mock('@/components/customer/VendorDiscoverCard', () => {
  const { Pressable, Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({
      vendor,
      onPress,
    }: {
      vendor: { id: string; businessName: string };
      onPress?: (id: string) => void;
    }) => (
      <Pressable testID="vendor-card" onPress={() => onPress?.(vendor.id)}>
        <Text>{vendor.businessName}</Text>
      </Pressable>
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

/** Helper to set up mockUseQuery for the three queries the screen makes. */
function setupQueries(options: {
  market?: Record<string, unknown> | null;
  marketLoading?: boolean;
  vendors?: Record<string, unknown>[];
  vendorsLoading?: boolean;
  profile?: Record<string, unknown> | null;
}) {
  const callCount = { current: 0 };
  mockUseQuery.mockImplementation(() => {
    callCount.current += 1;
    if (callCount.current === 1) {
      return {
        data: options.market !== undefined ? { market: options.market } : null,
        loading: options.marketLoading ?? false,
      };
    }
    if (callCount.current === 2) {
      return {
        data: { discoverVendors: options.vendors ?? [] },
        loading: options.vendorsLoading ?? false,
      };
    }
    return {
      data: {
        myCustomerProfile: options.profile ?? {
          followedMarkets: [],
          followedVendors: [],
        },
      },
      loading: false,
    };
  });
}

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
    setupQueries({
      market: {
        id: 'market-1',
        name: 'Downtown Market',
        address: '123 Main St',
        description: 'A great market',
        schedule: [],
      },
    });

    render(<MarketDetailScreen />);
    expect(screen.getByText('Downtown Market')).toBeTruthy();
    expect(screen.getByText('123 Main St')).toBeTruthy();
    expect(screen.getByText('A great market')).toBeTruthy();
  });

  it('navigates back when back button pressed', () => {
    setupQueries({
      market: {
        id: 'market-1',
        name: 'Downtown Market',
        address: '123 Main St',
        description: '',
        schedule: [],
      },
    });

    render(<MarketDetailScreen />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('navigates to vendor detail when vendor card pressed', () => {
    setupQueries({
      market: {
        id: 'market-1',
        name: 'Downtown Market',
        address: '123 Main St',
        description: '',
        schedule: [],
      },
      vendors: [{ id: 'vendor-42', businessName: 'Fresh Farms', products: [], checkIns: [] }],
    });

    render(<MarketDetailScreen />);
    fireEvent.press(screen.getByTestId('vendor-card'));
    expect(mockPush).toHaveBeenCalledWith('/(customer)/vendor/vendor-42');
  });

  it('shows follow button with correct state for followed market', () => {
    setupQueries({
      market: {
        id: 'market-1',
        name: 'Downtown Market',
        address: '123 Main St',
        description: '',
        schedule: [],
      },
      profile: {
        followedMarkets: [{ id: 'market-1' }],
        followedVendors: [],
      },
    });

    render(<MarketDetailScreen />);
    expect(screen.getByTestId('follow-button')).toBeTruthy();
    expect(screen.getByText('Following')).toBeTruthy();
  });

  it('renders vendor cards when vendors are available', () => {
    setupQueries({
      market: {
        id: 'market-1',
        name: 'Downtown Market',
        address: '123 Main St',
        description: '',
        schedule: [],
      },
      vendors: [
        { id: 'v1', businessName: 'Farm A', products: [], checkIns: [] },
        { id: 'v2', businessName: 'Farm B', products: [], checkIns: [] },
      ],
    });

    render(<MarketDetailScreen />);
    expect(screen.getAllByTestId('vendor-card')).toHaveLength(2);
    expect(screen.getByText('Farm A')).toBeTruthy();
    expect(screen.getByText('Farm B')).toBeTruthy();
  });
});
