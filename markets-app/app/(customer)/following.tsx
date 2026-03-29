import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

export default function FollowingScreen() {
  return (
    <Box className="flex-1 items-center justify-center bg-background-0">
      <Heading className="text-xl text-typography-900">Following</Heading>
      <Text className="mt-2 text-typography-500">Vendors and markets you follow.</Text>
    </Box>
  );
}
