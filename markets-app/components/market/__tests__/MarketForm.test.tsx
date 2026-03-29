import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { MarketForm, MarketFormData } from '../MarketForm';

type MockProps = Record<string, unknown> & { children?: ReactNode };
type MockPressableProps = MockProps & { onPress?: () => void };

// Mock gluestack components using React Native primitives.
// require() inside factory avoids out-of-scope variable error.
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
      <Pressable {...props} onPress={onPress}>{children}</Pressable>
    ),
    ButtonText: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text>,
  };
});
jest.mock('@/components/ui/spinner', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { Spinner: () => <View testID="spinner" /> };
});

describe('MarketForm', () => {
  const mockSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders in create mode with title', () => {
    render(
      <MarketForm mode="create" onSubmit={mockSubmit} />,
    );
    // "Create Market" appears in heading and button — verify at least one exists
    expect(screen.getAllByText('Create Market').length).toBeGreaterThanOrEqual(1);
  });

  it('renders in edit mode with title', () => {
    render(
      <MarketForm mode="edit" onSubmit={mockSubmit} />,
    );
    expect(screen.getByText('Edit Market')).toBeTruthy();
  });

  it('pre-fills initial data in edit mode', () => {
    const initialData = {
      name: 'Riverside Market',
      address: '123 River St',
      latitude: '40.7128',
      longitude: '-74.0060',
      contactEmail: 'info@riverside.com',
    };

    render(
      <MarketForm mode="edit" initialData={initialData} onSubmit={mockSubmit} />,
    );

    expect(screen.getByDisplayValue('Riverside Market')).toBeTruthy();
    expect(screen.getByDisplayValue('123 River St')).toBeTruthy();
  });

  it('does not call onSubmit with empty required fields', async () => {
    render(
      <MarketForm mode="create" onSubmit={mockSubmit} />,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const submitButton = screen.getByLabelText('Create market');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  it('calls onSubmit with valid data', async () => {
    const validData: Partial<MarketFormData> = {
      name: 'Test Market',
      address: '456 Test Ave',
      latitude: '40.0',
      longitude: '-74.0',
      contactEmail: 'test@market.com',
      recoveryContact: 'recovery@test.com',
    };

    render(
      <MarketForm mode="create" initialData={validData} onSubmit={mockSubmit} />,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const submitButton = screen.getByLabelText('Create market');
    fireEvent.press(submitButton);

    await waitFor(() => {
      expect(mockSubmit).toHaveBeenCalledTimes(1);
      expect(mockSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Market',
          address: '456 Test Ave',
          contactEmail: 'test@market.com',
        }),
      );
    });
  });

  it('disables submit button when loading', () => {
    render(
      <MarketForm mode="create" onSubmit={mockSubmit} loading={true} />,
    );

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const submitButton = screen.getByLabelText('Create market');
    // Pressable receives disabled via props or accessibilityState
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const buttonProps = submitButton.props as Record<string, unknown>;
    const accessibilityState = buttonProps.accessibilityState as Record<string, unknown> | undefined;
    const isDisabled =
      buttonProps.disabled ??
      accessibilityState?.disabled;
    expect(isDisabled).toBe(true);
  });
});
