import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import MarketDiscoverCard from '../MarketDiscoverCard';

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

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    MapPin: (props: Record<string, unknown>) => <View testID="map-pin-icon" {...props} />,
    ChevronRight: (props: Record<string, unknown>) => (
      <View testID="chevron-right-icon" {...props} />
    ),
  };
});

const mockMarket = {
  id: 'market-1',
  name: 'Downtown Farmers Market',
  description: 'A great market for fresh produce',
  address: '123 Main St',
  latitude: 40.7128,
  longitude: -74.006,
  imageURL: null,
  status: 'ACTIVE',
};

describe('MarketDiscoverCard', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders market name', () => {
    render(<MarketDiscoverCard market={mockMarket} onPress={mockOnPress} />);
    expect(screen.getByText('Downtown Farmers Market')).toBeTruthy();
  });

  it('renders market address', () => {
    render(<MarketDiscoverCard market={mockMarket} onPress={mockOnPress} />);
    expect(screen.getByText('123 Main St')).toBeTruthy();
  });

  it('renders market description when present', () => {
    render(<MarketDiscoverCard market={mockMarket} onPress={mockOnPress} />);
    expect(screen.getByText('A great market for fresh produce')).toBeTruthy();
  });

  it('does not render description when null', () => {
    const marketNoDesc = { ...mockMarket, description: null };
    render(<MarketDiscoverCard market={marketNoDesc} onPress={mockOnPress} />);
    expect(screen.queryByText('A great market for fresh produce')).toBeNull();
  });

  it('renders distance when provided', () => {
    render(<MarketDiscoverCard market={mockMarket} distance={3.456} onPress={mockOnPress} />);
    expect(screen.getByText('3.5 mi away')).toBeTruthy();
  });

  it('does not render distance when null', () => {
    render(<MarketDiscoverCard market={mockMarket} distance={null} onPress={mockOnPress} />);
    expect(screen.queryByText(/mi away/)).toBeNull();
  });

  it('calls onPress with market id when pressed', () => {
    render(<MarketDiscoverCard market={mockMarket} onPress={mockOnPress} />);
    fireEvent.press(screen.getByLabelText('Market: Downtown Farmers Market'));
    expect(mockOnPress).toHaveBeenCalledWith('market-1');
  });

  it('has correct accessibility label', () => {
    render(<MarketDiscoverCard market={mockMarket} onPress={mockOnPress} />);
    expect(screen.getByLabelText('Market: Downtown Farmers Market')).toBeTruthy();
  });
});
