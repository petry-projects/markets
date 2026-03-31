import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import FollowButton from '../FollowButton';

type MockProps = Record<string, unknown> & { children?: ReactNode };
type MockPressableProps = MockProps & { onPress?: () => void };

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

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Heart: (props: Record<string, unknown>) => <View testID="heart-icon" {...props} />,
  };
});

describe('FollowButton', () => {
  const mockToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "Follow" when not following', () => {
    render(
      <FollowButton targetType="VENDOR" targetID="v1" isFollowing={false} onToggle={mockToggle} />,
    );
    expect(screen.getByText('Follow')).toBeTruthy();
  });

  it('renders "Following" when following', () => {
    render(
      <FollowButton targetType="VENDOR" targetID="v1" isFollowing={true} onToggle={mockToggle} />,
    );
    expect(screen.getByText('Following')).toBeTruthy();
  });

  it('has correct accessibility label when not following', () => {
    render(
      <FollowButton targetType="VENDOR" targetID="v1" isFollowing={false} onToggle={mockToggle} />,
    );
    expect(screen.getByLabelText('Follow this vendor')).toBeTruthy();
  });

  it('has correct accessibility label when following', () => {
    render(
      <FollowButton targetType="MARKET" targetID="m1" isFollowing={true} onToggle={mockToggle} />,
    );
    expect(screen.getByLabelText('Unfollow this market')).toBeTruthy();
  });

  it('calls onToggle with targetType and targetID on press', () => {
    render(
      <FollowButton targetType="VENDOR" targetID="v1" isFollowing={false} onToggle={mockToggle} />,
    );
    fireEvent.press(screen.getByLabelText('Follow this vendor'));
    expect(mockToggle).toHaveBeenCalledWith('VENDOR', 'v1');
  });

  it('calls onToggle for MARKET type', () => {
    render(
      <FollowButton targetType="MARKET" targetID="m1" isFollowing={true} onToggle={mockToggle} />,
    );
    fireEvent.press(screen.getByLabelText('Unfollow this market'));
    expect(mockToggle).toHaveBeenCalledWith('MARKET', 'm1');
  });

  it('renders heart icon', () => {
    render(
      <FollowButton targetType="VENDOR" targetID="v1" isFollowing={false} onToggle={mockToggle} />,
    );
    expect(screen.getByTestId('heart-icon')).toBeTruthy();
  });
});
