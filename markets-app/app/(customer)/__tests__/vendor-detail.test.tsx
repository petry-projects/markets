import React from 'react';
import { render, screen } from '@testing-library/react-native';
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

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(() => ({ id: 'vendor-1' })),
  useRouter: jest.fn(() => ({ push: jest.fn(), back: jest.fn() })),
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
    const callCount = { current: 0 };
    mockUseQuery.mockImplementation(() => {
      callCount.current += 1;
      if (callCount.current === 1) {
        return {
          data: {
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
          },
          loading: false,
        };
      }
      return {
        data: {
          myCustomerProfile: {
            followedVendors: [],
            followedMarkets: [],
          },
        },
        loading: false,
      };
    });

    render(<VendorDetailScreen />);
    expect(screen.getByText('Farm Fresh')).toBeTruthy();
    expect(screen.getByText('Organic produce')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
    expect(screen.getByText('Tomatoes')).toBeTruthy();
  });

  it('renders vendor with active check-in', () => {
    const callCount = { current: 0 };
    mockUseQuery.mockImplementation(() => {
      callCount.current += 1;
      if (callCount.current === 1) {
        return {
          data: {
            vendor: {
              id: 'vendor-1',
              businessName: 'Farm Fresh',
              description: null,
              instagramHandle: null,
              websiteURL: null,
              checkIns: [{ status: 'CHECKED_IN', id: 'c1' }],
              products: [],
            },
          },
          loading: false,
        };
      }
      return {
        data: {
          myCustomerProfile: {
            followedVendors: [],
            followedMarkets: [],
          },
        },
        loading: false,
      };
    });

    render(<VendorDetailScreen />);
    expect(screen.getByText('Currently at market')).toBeTruthy();
  });
});
