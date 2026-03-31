import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import VendorDetailScreen from '../vendor/[id]';

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
    ChevronLeft: (props: Record<string, unknown>) => <View {...props} />,
    Globe: (props: Record<string, unknown>) => <View {...props} />,
    AtSign: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const mockPush = jest.fn();
const mockBack = jest.fn();
jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'vendor-1' })),
  useRouter: jest.fn(() => ({ push: mockPush, back: mockBack })),
}));

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
  VendorDocument: { kind: 'Document', definitions: [{ name: { value: 'Vendor' } }] },
  MyCustomerProfileDocument: {
    kind: 'Document',
    definitions: [{ name: { value: 'MyCustomerProfile' } }],
  },
}));

jest.mock('@/hooks/useFollow', () => ({
  useFollow: () => ({ toggleFollow: jest.fn(), loading: false }),
}));

/** Helper to set up mockUseQuery for the two queries the screen makes. */
function setupQueries(options: {
  vendor?: Record<string, unknown> | null;
  vendorLoading?: boolean;
  profile?: Record<string, unknown> | null;
}) {
  const callCount = { current: 0 };
  mockUseQuery.mockImplementation(() => {
    callCount.current += 1;
    if (callCount.current === 1) {
      return {
        data: options.vendor !== undefined ? { vendor: options.vendor } : null,
        loading: options.vendorLoading ?? false,
      };
    }
    return {
      data: {
        myCustomerProfile: options.profile ?? {
          followedVendors: [],
          followedMarkets: [],
        },
      },
      loading: false,
    };
  });
}

describe('VendorDetailScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when vendor is loading', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
    });

    render(<VendorDetailScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders vendor not found when data is null', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
    });

    render(<VendorDetailScreen />);
    expect(screen.getByText('Vendor not found.')).toBeTruthy();
  });

  it('renders vendor details when data is available', () => {
    setupQueries({
      vendor: {
        id: 'vendor-1',
        businessName: 'Farm Fresh',
        description: 'Organic produce',
        instagramHandle: 'farmfresh',
        websiteURL: 'https://farmfresh.com',
        checkIns: [],
        products: [
          {
            id: 'p1',
            name: 'Tomatoes',
            category: 'Produce',
            description: 'Red tomatoes',
            isAvailable: true,
          },
        ],
      },
    });

    render(<VendorDetailScreen />);
    expect(screen.getByText('Farm Fresh')).toBeTruthy();
    expect(screen.getByText('Organic produce')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
    expect(screen.getByText('Tomatoes')).toBeTruthy();
  });

  it('renders vendor with active check-in', () => {
    setupQueries({
      vendor: {
        id: 'vendor-1',
        businessName: 'Farm Fresh',
        description: null,
        instagramHandle: null,
        websiteURL: null,
        checkIns: [{ status: 'CHECKED_IN', id: 'c1' }],
        products: [],
      },
    });

    render(<VendorDetailScreen />);
    expect(screen.getByText('Currently at market')).toBeTruthy();
  });

  it('navigates back when back button pressed', () => {
    setupQueries({
      vendor: {
        id: 'vendor-1',
        businessName: 'Farm Fresh',
        description: null,
        instagramHandle: null,
        websiteURL: null,
        checkIns: [],
        products: [],
      },
    });

    render(<VendorDetailScreen />);
    fireEvent.press(screen.getByLabelText('Go back'));
    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it('shows follow state when vendor is followed', () => {
    setupQueries({
      vendor: {
        id: 'vendor-1',
        businessName: 'Farm Fresh',
        description: null,
        instagramHandle: null,
        websiteURL: null,
        checkIns: [],
        products: [],
      },
      profile: {
        followedVendors: [{ id: 'vendor-1' }],
        followedMarkets: [],
      },
    });

    render(<VendorDetailScreen />);
    expect(screen.getByTestId('follow-button')).toBeTruthy();
    expect(screen.getByText('Following')).toBeTruthy();
  });

  it('renders product availability badge', () => {
    setupQueries({
      vendor: {
        id: 'vendor-1',
        businessName: 'Farm Fresh',
        description: null,
        instagramHandle: null,
        websiteURL: null,
        checkIns: [],
        products: [
          { id: 'p1', name: 'Tomatoes', category: 'Produce', description: null, isAvailable: true },
          { id: 'p2', name: 'Corn', category: 'Produce', description: null, isAvailable: false },
        ],
      },
    });

    render(<VendorDetailScreen />);
    expect(screen.getByText('Available')).toBeTruthy();
    expect(screen.getByText('Unavailable')).toBeTruthy();
  });

  it('renders social links when present', () => {
    setupQueries({
      vendor: {
        id: 'vendor-1',
        businessName: 'Farm Fresh',
        description: null,
        instagramHandle: 'farmfresh',
        websiteURL: 'https://farmfresh.com',
        checkIns: [],
        products: [],
      },
    });

    render(<VendorDetailScreen />);
    expect(screen.getByText('@farmfresh')).toBeTruthy();
    expect(screen.getByText('https://farmfresh.com')).toBeTruthy();
  });

  it('does not render social links when null', () => {
    setupQueries({
      vendor: {
        id: 'vendor-1',
        businessName: 'Farm Fresh',
        description: null,
        instagramHandle: null,
        websiteURL: null,
        checkIns: [],
        products: [],
      },
    });

    render(<VendorDetailScreen />);
    expect(screen.queryByText(/@/)).toBeNull();
    expect(screen.queryByText(/https?:\/\//)).toBeNull();
  });
});
