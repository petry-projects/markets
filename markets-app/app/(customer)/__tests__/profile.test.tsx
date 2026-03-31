import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import CustomerProfileScreen from '../profile';

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
    User: (props: Record<string, unknown>) => <View testID="user-icon" {...props} />,
    Heart: (props: Record<string, unknown>) => <View {...props} />,
    MapPin: (props: Record<string, unknown>) => <View {...props} />,
    Settings: (props: Record<string, unknown>) => <View {...props} />,
    ChevronRight: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, back: jest.fn() })),
}));

const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  MyCustomerProfileDocument: { kind: 'Document' },
}));

describe('CustomerProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner when loading with no data', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: true,
      refetch: jest.fn(),
    });

    render(<CustomerProfileScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders profile with display name', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCustomerProfile: {
          displayName: 'Jane Doe',
          followedVendors: [{ id: 'v1' }, { id: 'v2' }],
          followedMarkets: [{ id: 'm1' }],
        },
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<CustomerProfileScreen />);
    expect(screen.getByText('Jane Doe')).toBeTruthy();
  });

  it('renders vendor and market counts', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCustomerProfile: {
          displayName: 'Jane',
          followedVendors: [{ id: 'v1' }, { id: 'v2' }, { id: 'v3' }],
          followedMarkets: [{ id: 'm1' }],
        },
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<CustomerProfileScreen />);
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Vendors')).toBeTruthy();
    expect(screen.getByText('Markets')).toBeTruthy();
  });

  it('renders menu items', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCustomerProfile: {
          displayName: 'Jane',
          followedVendors: [],
          followedMarkets: [],
        },
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<CustomerProfileScreen />);
    expect(screen.getByText('Followed Vendors')).toBeTruthy();
    expect(screen.getByText('Followed Markets')).toBeTruthy();
    expect(screen.getByText('Settings & Preferences')).toBeTruthy();
  });

  it('renders "Customer" when no display name', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myCustomerProfile: null,
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<CustomerProfileScreen />);
    expect(screen.getByText('Customer')).toBeTruthy();
  });
});
