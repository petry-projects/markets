import React from 'react';
import { Pressable } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';

type ProductCardProps = {
  id: string;
  name: string;
  category?: string | null;
  description?: string | null;
  isAvailable: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function ProductCard({
  id,
  name,
  category,
  description,
  isAvailable,
  onEdit,
  onDelete,
}: ProductCardProps) {
  return (
    <Pressable
      onPress={() => onEdit?.(id)}
      accessibilityLabel={`Product: ${name}`}
      accessibilityRole="button"
    >
      <Box className="rounded-lg border border-outline-200 bg-background-0 p-4 mb-3">
        <Box className="flex-row items-start justify-between">
          <VStack className="flex-1 gap-1">
            <Box className="flex-row items-center gap-2">
              <Heading className="text-base text-typography-900">
                {name}
              </Heading>
              {!isAvailable && (
                <Box className="rounded-full bg-warning-100 px-2 py-0.5">
                  <Text className="text-xs text-warning-700">Unavailable</Text>
                </Box>
              )}
            </Box>
            {category && (
              <Text className="text-sm text-typography-500">{category}</Text>
            )}
            {description && (
              <Text className="text-sm text-typography-600" numberOfLines={2}>
                {description}
              </Text>
            )}
          </VStack>
          {onDelete && (
            <Button
              className="bg-transparent"
              onPress={() => onDelete(id)}
              accessibilityLabel={`Delete ${name}`}
            >
              <ButtonText className="text-error-600 text-sm">Delete</ButtonText>
            </Button>
          )}
        </Box>
      </Box>
    </Pressable>
  );
}
