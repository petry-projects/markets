import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import VendorMarketsScreen from '../markets';

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

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, back: jest.fn() })),
}));

const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  VendorMarketsDocument: { kind: 'Document' },
}));

describe('VendorMarketsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner', () => {
    mockUseQuery.mockReturnValue({ data: null, loading: true, refetch: jest.fn() });
    render(<VendorMarketsScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders empty state when no markets', () => {
    mockUseQuery.mockReturnValue({
      data: { vendorMarkets: [] },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorMarketsScreen />);
    expect(screen.getByText("You haven't joined any markets yet.")).toBeTruthy();
  });

  it('renders market list when data available', () => {
    mockUseQuery.mockReturnValue({
      data: {
        vendorMarkets: [
          {
            market: { id: 'm1', name: 'Sunday Market', address: '123 Oak' },
            status: 'APPROVED',
            nextUpcomingDate: '2026-04-01',
            dates: [{ id: 'd1' }],
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorMarketsScreen />);
    expect(screen.getByText('My Markets')).toBeTruthy();
    expect(screen.getByText('Sunday Market')).toBeTruthy();
    expect(screen.getByText('APPROVED')).toBeTruthy();
    expect(screen.getByText('1 date committed')).toBeTruthy();
  });

  it('renders PENDING status', () => {
    mockUseQuery.mockReturnValue({
      data: {
        vendorMarkets: [
          {
            market: { id: 'm1', name: 'Market', address: 'Addr' },
            status: 'PENDING',
            nextUpcomingDate: null,
            dates: [{ id: 'd1' }, { id: 'd2' }],
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorMarketsScreen />);
    expect(screen.getByText('PENDING')).toBeTruthy();
    expect(screen.getByText('2 dates committed')).toBeTruthy();
  });

  it('navigates to search when Find Markets header button pressed', () => {
    mockUseQuery.mockReturnValue({
      data: {
        vendorMarkets: [
          {
            market: { id: 'm1', name: 'Sunday Market', address: '123 Oak' },
            status: 'APPROVED',
            nextUpcomingDate: null,
            dates: [],
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorMarketsScreen />);
    fireEvent.press(screen.getByLabelText('Find markets'));
    expect(mockPush).toHaveBeenCalledWith('/(vendor)/markets/search');
  });

  it('navigates to market detail when market pressed', () => {
    mockUseQuery.mockReturnValue({
      data: {
        vendorMarkets: [
          {
            market: { id: 'm1', name: 'Sunday Market', address: '123 Oak' },
            status: 'APPROVED',
            nextUpcomingDate: null,
            dates: [],
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorMarketsScreen />);
    fireEvent.press(screen.getByLabelText('Market: Sunday Market'));
    expect(mockPush).toHaveBeenCalledWith('/(vendor)/markets/m1/detail');
  });

  it('navigates to search from empty state', () => {
    mockUseQuery.mockReturnValue({
      data: { vendorMarkets: [] },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorMarketsScreen />);
    fireEvent.press(screen.getByLabelText('Find markets to join'));
    expect(mockPush).toHaveBeenCalledWith('/(vendor)/markets/search');
  });

  it('renders APPROVED status badge', () => {
    mockUseQuery.mockReturnValue({
      data: {
        vendorMarkets: [
          {
            market: { id: 'm1', name: 'Market', address: 'Addr' },
            status: 'APPROVED',
            nextUpcomingDate: null,
            dates: [],
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorMarketsScreen />);
    expect(screen.getByText('APPROVED')).toBeTruthy();
  });

  it('renders REJECTED status badge', () => {
    mockUseQuery.mockReturnValue({
      data: {
        vendorMarkets: [
          {
            market: { id: 'm1', name: 'Market', address: 'Addr' },
            status: 'REJECTED',
            nextUpcomingDate: null,
            dates: [],
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorMarketsScreen />);
    expect(screen.getByText('REJECTED')).toBeTruthy();
  });
});
