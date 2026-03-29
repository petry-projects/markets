import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

type MarketCardProps = {
  id: string;
  name: string;
  address: string;
  description?: string | null;
  onPress: (id: string) => void;
};

export function MarketCard({ id, name, address, description, onPress }: MarketCardProps) {
  return (
    <Pressable
      onPress={() => onPress(id)}
      className="bg-background-0 rounded-xl border border-outline-100 p-4 mb-3"
      accessibilityRole="button"
      accessibilityLabel={`View ${name}`}
    >
      <Heading className="text-base text-typography-900">{name}</Heading>
      <Text className="text-sm text-typography-500 mt-1">{address}</Text>
      {description ? (
        <Text className="text-sm text-typography-400 mt-1" numberOfLines={2}>
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}
