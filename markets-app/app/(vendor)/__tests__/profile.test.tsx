import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import VendorProfileScreen from '../profile';

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
    FileText: (props: Record<string, unknown>) => <View {...props} />,
    Trash2: (props: Record<string, unknown>) => <View {...props} />,
    ChevronRight: (props: Record<string, unknown>) => <View {...props} />,
  };
});

jest.mock('@/components/vendor/ProductCard', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    __esModule: true,
    default: ({ name }: { name: string }) => <Text testID="product-card">{name}</Text>,
  };
});

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: jest.fn(() => ({ push: mockPush, back: jest.fn() })),
}));

const mockUseQuery = jest.fn();
const mockUseMutation = jest.fn(() => [jest.fn(), { loading: false }]);
jest.mock('@apollo/client/react', () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args) as unknown,
  useMutation: () => mockUseMutation() as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  MyVendorProfileDocument: { kind: 'Document' },
  DeleteProductDocument: { kind: 'Document' },
}));

describe('VendorProfileScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading spinner', () => {
    mockUseQuery.mockReturnValue({ data: null, loading: true, refetch: jest.fn() });
    render(<VendorProfileScreen />);
    expect(screen.getByTestId('spinner')).toBeTruthy();
  });

  it('renders create profile prompt when no profile', () => {
    mockUseQuery.mockReturnValue({
      data: { myVendorProfile: null },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorProfileScreen />);
    expect(screen.getByText('Welcome, Vendor!')).toBeTruthy();
    expect(screen.getByText('Create Profile')).toBeTruthy();
  });

  it('renders profile with business name and products', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myVendorProfile: {
          businessName: 'Farm Fresh',
          description: 'Organic produce',
          contactInfo: 'farm@fresh.com',
          instagramHandle: 'farmfresh',
          websiteURL: 'https://farmfresh.com',
          products: [
            {
              id: 'p1',
              name: 'Tomatoes',
              category: 'Produce',
              description: null,
              isAvailable: true,
            },
          ],
        },
      },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorProfileScreen />);
    expect(screen.getByText('Farm Fresh')).toBeTruthy();
    expect(screen.getByText('Organic produce')).toBeTruthy();
    expect(screen.getByText('Contact: farm@fresh.com')).toBeTruthy();
    expect(screen.getByText('@farmfresh')).toBeTruthy();
    expect(screen.getByText('Products')).toBeTruthy();
    expect(screen.getByText('Tomatoes')).toBeTruthy();
  });

  it('renders empty products state', () => {
    mockUseQuery.mockReturnValue({
      data: {
        myVendorProfile: {
          businessName: 'Farm Fresh',
          description: null,
          contactInfo: null,
          instagramHandle: null,
          websiteURL: null,
          products: [],
        },
      },
      loading: false,
      refetch: jest.fn(),
    });
    render(<VendorProfileScreen />);
    expect(screen.getByText('No products yet. Add your first product!')).toBeTruthy();
  });
});
