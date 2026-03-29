import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import DiscoverScreen from '../discover';

type MockProps = Record<string, unknown> & { children?: ReactNode };
type MockPressableProps = MockProps & { onPress?: () => void };

// Mock UI components
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
jest.mock('@/components/ui/input', () => {
  const { View, TextInput } = require('react-native') as typeof import('react-native');
  return {
    Input: ({ children, ...props }: MockProps) => <View {...props}>{children}</View>,
    InputField: (props: Record<string, unknown>) => <TextInput {...props} />,
  };
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
    Search: (props: Record<string, unknown>) => <View testID="search-icon" {...props} />,
    MapPin: (props: Record<string, unknown>) => <View testID="map-pin-icon" {...props} />,
    ChevronRight: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, back: jest.fn() })),
}));

jest.mock('@/components/customer/MarketDiscoverCard', () => {
  const { Pressable, Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({
      market,
      onPress,
    }: {
      market: { id: string; name: string };
      onPress: (id: string) => void;
    }) => (
      <Pressable
        testID={`market-card-${market.id}`}
        onPress={() => {
          onPress(market.id);
        }}
      >
        <Text>{market.name}</Text>
      </Pressable>
    ),
  };
});

const mockUseQuery = jest.fn();
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  DiscoverMarketsDocument: { kind: 'Document' },
}));

const mockUseAutoLocation = jest.fn();
jest.mock('@/hooks/useLocation', () => ({
  useAutoLocation: () => mockUseAutoLocation() as unknown,
}));

describe('DiscoverScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
      refetch: jest.fn(),
    });
  });

  it('renders location prompt when location is null and not loading', () => {
    mockUseAutoLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
      requestLocation: jest.fn(),
    });

    render(<DiscoverScreen />);
    expect(screen.getByText('Enable Location')).toBeTruthy();
    expect(screen.getByText('We need your location to find markets near you.')).toBeTruthy();
    expect(screen.getByText('Use My Location')).toBeTruthy();
  });

  it('renders location error message when permission denied', () => {
    mockUseAutoLocation.mockReturnValue({
      location: null,
      loading: false,
      error: 'Location permission denied',
      requestLocation: jest.fn(),
    });

    render(<DiscoverScreen />);
    expect(
      screen.getByText(
        'Location permission was denied. Please enable it in settings to discover nearby markets.',
      ),
    ).toBeTruthy();
    expect(screen.getByText('Try Again')).toBeTruthy();
  });

  it('renders loading spinner when getting location', () => {
    mockUseAutoLocation.mockReturnValue({
      location: null,
      loading: true,
      error: null,
      requestLocation: jest.fn(),
    });

    render(<DiscoverScreen />);
    expect(screen.getByText('Getting your location...')).toBeTruthy();
  });

  it('renders search bar and distance filters when location is available', () => {
    mockUseAutoLocation.mockReturnValue({
      location: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
      requestLocation: jest.fn(),
    });
    mockUseQuery.mockReturnValue({
      data: { discoverMarkets: [] },
      loading: false,
      refetch: jest.fn(),
    });

    render(<DiscoverScreen />);
    expect(screen.getByLabelText('Search markets')).toBeTruthy();
    expect(screen.getByText('Markets Near You')).toBeTruthy();
    expect(screen.getByText('5 mi')).toBeTruthy();
    expect(screen.getByText('10 mi')).toBeTruthy();
    expect(screen.getByText('25 mi')).toBeTruthy();
    expect(screen.getByText('50 mi')).toBeTruthy();
  });

  it('renders empty state when no markets', () => {
    mockUseAutoLocation.mockReturnValue({
      location: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
      requestLocation: jest.fn(),
    });
    mockUseQuery.mockReturnValue({
      data: { discoverMarkets: [] },
      loading: false,
      refetch: jest.fn(),
    });

    render(<DiscoverScreen />);
    expect(screen.getByText('No markets found nearby. Try increasing the distance.')).toBeTruthy();
  });

  it('renders market cards when data is available', () => {
    mockUseAutoLocation.mockReturnValue({
      location: { latitude: 40.7128, longitude: -74.006 },
      loading: false,
      error: null,
      requestLocation: jest.fn(),
    });
    mockUseQuery.mockReturnValue({
      data: {
        discoverMarkets: [
          {
            id: 'm1',
            name: 'Test Market',
            address: '123 St',
            latitude: 40.72,
            longitude: -74.01,
            description: null,
            imageURL: null,
            status: 'ACTIVE',
          },
        ],
      },
      loading: false,
      refetch: jest.fn(),
    });

    render(<DiscoverScreen />);
    expect(screen.getByText('Test Market')).toBeTruthy();
  });

  it('calls requestLocation when enable location button pressed', () => {
    const mockRequestLocation = jest.fn();
    mockUseAutoLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
      requestLocation: mockRequestLocation,
    });

    render(<DiscoverScreen />);
    fireEvent.press(screen.getByLabelText('Enable location access'));
    expect(mockRequestLocation).toHaveBeenCalled();
  });
});
