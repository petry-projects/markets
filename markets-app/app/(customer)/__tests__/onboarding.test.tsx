import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import OnboardingScreen from '../onboarding';

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
    Check: (props: Record<string, unknown>) => <View {...props} />,
    ChevronRight: (props: Record<string, unknown>) => <View {...props} />,
  };
});

const mockReplace = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() })),
}));

jest.mock('@/components/customer/MarketDiscoverCard', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({ market }: { market: { name: string } }) => (
      <Text testID="market-card">{market.name}</Text>
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

const mockUseLocation = jest.fn();
jest.mock('@/hooks/useLocation', () => ({
  useLocation: () => mockUseLocation() as unknown,
}));

describe('OnboardingScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: null,
      loading: false,
    });
    mockUseLocation.mockReturnValue({
      location: null,
      loading: false,
      error: null,
      requestLocation: jest.fn().mockResolvedValue(undefined),
    });
  });

  it('renders location step initially', () => {
    render(<OnboardingScreen />);
    expect(screen.getByText('Welcome to Markets')).toBeTruthy();
    expect(
      screen.getByText('Share your location so we can find farmers markets near you.'),
    ).toBeTruthy();
    expect(screen.getByText('Use My Location')).toBeTruthy();
    expect(screen.getByText('Skip for Now')).toBeTruthy();
  });

  it('navigates to preferences step when skip is pressed', () => {
    render(<OnboardingScreen />);
    fireEvent.press(screen.getByLabelText('Skip location'));
    expect(screen.getByText('What are you looking for?')).toBeTruthy();
    expect(screen.getByText('Select categories you are interested in.')).toBeTruthy();
  });

  it('renders category options in preferences step', () => {
    render(<OnboardingScreen />);
    fireEvent.press(screen.getByLabelText('Skip location'));
    expect(screen.getByText('Produce')).toBeTruthy();
    expect(screen.getByText('Baked Goods')).toBeTruthy();
    expect(screen.getByText('Dairy')).toBeTruthy();
    expect(screen.getByText('Honey')).toBeTruthy();
  });

  it('allows toggling categories', () => {
    render(<OnboardingScreen />);
    fireEvent.press(screen.getByLabelText('Skip location'));
    // Select Produce
    fireEvent.press(screen.getByLabelText('Select Produce'));
    // Now it should show Deselect
    expect(screen.getByLabelText('Deselect Produce')).toBeTruthy();
    // Deselect it
    fireEvent.press(screen.getByLabelText('Deselect Produce'));
    expect(screen.getByLabelText('Select Produce')).toBeTruthy();
  });

  it('navigates to done step from preferences when no location', () => {
    render(<OnboardingScreen />);
    // Skip location -> preferences
    fireEvent.press(screen.getByLabelText('Skip location'));
    // Press continue -> done (since no location)
    fireEvent.press(screen.getByLabelText('Continue'));
    expect(screen.getByText('You are all set!')).toBeTruthy();
  });

  it('renders done step with navigation buttons', () => {
    render(<OnboardingScreen />);
    fireEvent.press(screen.getByLabelText('Skip location'));
    fireEvent.press(screen.getByLabelText('Continue'));
    expect(screen.getByText('Explore Markets')).toBeTruthy();
    expect(screen.getByText('Go to My Feed')).toBeTruthy();
  });

  it('calls router.replace for discover on done step', () => {
    render(<OnboardingScreen />);
    fireEvent.press(screen.getByLabelText('Skip location'));
    fireEvent.press(screen.getByLabelText('Continue'));
    fireEvent.press(screen.getByLabelText('Go to discover'));
    expect(mockReplace).toHaveBeenCalledWith('/(customer)/discover');
  });

  it('calls router.replace for following on done step', () => {
    render(<OnboardingScreen />);
    fireEvent.press(screen.getByLabelText('Skip location'));
    fireEvent.press(screen.getByLabelText('Continue'));
    fireEvent.press(screen.getByLabelText('Go to following feed'));
    expect(mockReplace).toHaveBeenCalledWith('/(customer)/following');
  });

  it('shows spinner when location is loading', () => {
    mockUseLocation.mockReturnValue({
      location: null,
      loading: true,
      error: null,
      requestLocation: jest.fn(),
    });

    render(<OnboardingScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });
});
