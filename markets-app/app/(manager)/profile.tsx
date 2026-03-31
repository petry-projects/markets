import React from 'react';
import { Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, ChevronRight } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

export default function ManagerProfileScreen() {
  const router = useRouter();

  return (
    <Box className="flex-1 bg-background-0 p-4">
      <VStack className="items-center gap-2 py-6 mb-4">
        <Heading className="text-xl text-typography-900">Profile</Heading>
        <Text className="mt-2 text-typography-500">Your manager profile.</Text>
      </VStack>

      <VStack className="gap-2">
        <Pressable
          onPress={() => {
            router.push('/(manager)/settings/activity-log');
          }}
          accessibilityLabel="Activity Log"
          accessibilityRole="button"
        >
          <Box className="flex-row items-center rounded-lg border border-outline-200 bg-background-0 p-4">
            <Box className="mr-3">
              <FileText size={20} color="#6b7280" />
            </Box>
            <Text className="flex-1 text-typography-900">Activity Log</Text>
            <ChevronRight size={18} color="#9ca3af" />
          </Box>
        </Pressable>
      </VStack>
    </Box>
  );
}
