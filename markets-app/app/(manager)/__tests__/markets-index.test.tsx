import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import MyMarketsScreen from '../markets/index';

type MockProps = Record<string, unknown> & { children?: ReactNode };
type MockPressableProps = MockProps & { onPress?: () => void };

jest.mock('@/components/ui/box', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { Box: ({ children, ...props }: MockProps) => <View {...props}>{children}</View> };
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

jest.mock('@/components/market/MarketCard', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    MarketCard: ({ name }: { name: string }) => <Text testID="market-card">{name}</Text>,
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
  MyMarketsDocument: { kind: 'Document' },
}));

describe('MyMarketsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner', () => {
    mockUseQuery.mockReturnValue({ data: null, loading: true, error: null, refetch: jest.fn() });
    render(<MyMarketsScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders error state', () => {
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('Network error'),
      refetch: jest.fn(),
    });
    render(<MyMarketsScreen />);
    expect(screen.getByText('Failed to load markets. Pull to retry.')).toBeTruthy();
  });

  it('renders empty state', () => {
    mockUseQuery.mockReturnValue({
      data: { myMarkets: [] },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<MyMarketsScreen />);
    expect(screen.getByText("You don't have any markets yet.")).toBeTruthy();
    expect(screen.getByText('Create Your First Market')).toBeTruthy();
  });

  it('renders market list', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myMarkets: [
          { id: 'm1', name: 'Downtown Market', address: '123 Main', description: 'A market' },
        ],
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    render(<MyMarketsScreen />);
    expect(screen.getByText('My Markets')).toBeTruthy();
    expect(screen.getByText('Downtown Market')).toBeTruthy();
  });
});
