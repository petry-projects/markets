import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import VendorDiscoverCard from '../VendorDiscoverCard';

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

jest.mock('@/components/customer/FollowButton', () => {
  const { Pressable, Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({
      targetType,
      targetID,
      isFollowing,
      onToggle,
    }: {
      targetType: string;
      targetID: string;
      isFollowing: boolean;
      onToggle: (t: string, id: string) => void;
    }) => (
      <Pressable
        testID="follow-button"
        onPress={() => {
          onToggle(targetType, targetID);
        }}
      >
        <Text>{isFollowing ? 'Following' : 'Follow'}</Text>
      </Pressable>
    ),
  };
});

const mockVendor = {
  id: 'vendor-1',
  businessName: 'Fresh Farm Produce',
  description: 'Organic vegetables and fruits',
  imageURL: null,
  products: [
    { id: 'p1', name: 'Tomatoes', category: 'Produce', isAvailable: true },
    { id: 'p2', name: 'Basil', category: 'Herbs', isAvailable: true },
    { id: 'p3', name: 'More Tomatoes', category: 'Produce', isAvailable: false },
  ],
};

describe('VendorDiscoverCard', () => {
  const mockOnPress = jest.fn();
  const mockOnFollowToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders vendor business name', () => {
    render(<VendorDiscoverCard vendor={mockVendor} onPress={mockOnPress} />);
    expect(screen.getByText('Fresh Farm Produce')).toBeTruthy();
  });

  it('renders vendor description when present', () => {
    render(<VendorDiscoverCard vendor={mockVendor} onPress={mockOnPress} />);
    expect(screen.getByText('Organic vegetables and fruits')).toBeTruthy();
  });

  it('does not render description when null', () => {
    const vendorNoDesc = { ...mockVendor, description: null };
    render(<VendorDiscoverCard vendor={vendorNoDesc} onPress={mockOnPress} />);
    expect(screen.queryByText('Organic vegetables and fruits')).toBeNull();
  });

  it('renders unique categories', () => {
    render(<VendorDiscoverCard vendor={mockVendor} onPress={mockOnPress} />);
    expect(screen.getByText('Produce')).toBeTruthy();
    expect(screen.getByText('Herbs')).toBeTruthy();
  });

  it('renders product count', () => {
    render(<VendorDiscoverCard vendor={mockVendor} onPress={mockOnPress} />);
    expect(screen.getByText('3 products')).toBeTruthy();
  });

  it('renders singular product count', () => {
    const singleProduct = {
      ...mockVendor,
      products: [{ id: 'p1', name: 'Tomatoes', category: 'Produce', isAvailable: true }],
    };
    render(<VendorDiscoverCard vendor={singleProduct} onPress={mockOnPress} />);
    expect(screen.getByText('1 product')).toBeTruthy();
  });

  it('calls onPress with vendor id when pressed', () => {
    render(<VendorDiscoverCard vendor={mockVendor} onPress={mockOnPress} />);
    fireEvent.press(screen.getByLabelText('Vendor: Fresh Farm Produce'));
    expect(mockOnPress).toHaveBeenCalledWith('vendor-1');
  });

  it('renders FollowButton when onFollowToggle is provided', () => {
    render(
      <VendorDiscoverCard
        vendor={mockVendor}
        onPress={mockOnPress}
        onFollowToggle={mockOnFollowToggle}
        isFollowing={false}
      />,
    );
    expect(screen.getByTestId('follow-button')).toBeTruthy();
  });

  it('does not render FollowButton when onFollowToggle is not provided', () => {
    render(<VendorDiscoverCard vendor={mockVendor} onPress={mockOnPress} />);
    expect(screen.queryByTestId('follow-button')).toBeNull();
  });

  it('calls onFollowToggle through FollowButton', () => {
    render(
      <VendorDiscoverCard
        vendor={mockVendor}
        onPress={mockOnPress}
        onFollowToggle={mockOnFollowToggle}
        isFollowing={false}
      />,
    );
    fireEvent.press(screen.getByTestId('follow-button'));
    expect(mockOnFollowToggle).toHaveBeenCalledWith('VENDOR', 'vendor-1');
  });

  it('has correct accessibility label', () => {
    render(<VendorDiscoverCard vendor={mockVendor} onPress={mockOnPress} />);
    expect(screen.getByLabelText('Vendor: Fresh Farm Produce')).toBeTruthy();
  });
});
