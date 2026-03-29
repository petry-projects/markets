import { Link, Stack } from 'expo-router';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <Box className="flex-1 items-center justify-center p-5 bg-background-0">
        <Heading className="text-xl text-typography-900">This screen does not exist.</Heading>
        <Link href="/">
          <Text className="mt-4 text-primary-500">Go to home screen</Text>
        </Link>
      </Box>
    </>
  );
}
