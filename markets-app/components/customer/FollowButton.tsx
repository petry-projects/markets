import React from 'react';
import { Heart } from 'lucide-react-native';
import { Button, ButtonText } from '@/components/ui/button';

type FollowButtonProps = {
  targetType: 'VENDOR' | 'MARKET';
  targetID: string;
  isFollowing: boolean;
  onToggle: (targetType: 'VENDOR' | 'MARKET', targetID: string) => void;
  disabled?: boolean;
};

export default function FollowButton({
  targetType,
  targetID,
  isFollowing,
  onToggle,
  disabled,
}: FollowButtonProps) {
  const label = isFollowing ? 'Following' : 'Follow';
  const accessibilityLabel = isFollowing
    ? `Unfollow this ${targetType.toLowerCase()}`
    : `Follow this ${targetType.toLowerCase()}`;

  return (
    <Button
      className={`flex-row items-center gap-2 rounded-full px-4 h-9 ${
        isFollowing ? 'bg-primary-100 border border-primary-300' : 'bg-primary-500'
      }`}
      onPress={() => {
        onToggle(targetType, targetID);
      }}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
    >
      <Heart
        size={16}
        color={isFollowing ? '#6366f1' : '#ffffff'}
        fill={isFollowing ? '#6366f1' : 'transparent'}
      />
      <ButtonText
        className={`text-sm font-semibold ${isFollowing ? 'text-primary-600' : 'text-white'}`}
      >
        {label}
      </ButtonText>
    </Button>
  );
}
