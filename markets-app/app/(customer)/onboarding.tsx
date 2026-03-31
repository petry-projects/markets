import React, { useState, useCallback } from 'react';
import { ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery } from '@apollo/client/react';
import { MapPin, Check, ChevronRight } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import MarketDiscoverCard from '@/components/customer/MarketDiscoverCard';
import { DiscoverMarketsDocument } from '@/graphql/generated/graphql';
import { useLocation } from '@/hooks/useLocation';

const CATEGORIES = [
  'Produce',
  'Baked Goods',
  'Dairy',
  'Meat',
  'Honey',
  'Flowers',
  'Crafts',
  'Prepared Foods',
  'Beverages',
  'Herbs',
] as const;

type Step = 'location' | 'preferences' | 'discover' | 'done';

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('location');
  const [selectedCategories, setSelectedCategories] = useState(new Set<string>());
  const { location, loading: locationLoading, requestLocation } = useLocation();

  const { data: marketsData, loading: marketsLoading } = useQuery(DiscoverMarketsDocument, {
    variables: {
      latitude: location?.latitude ?? 0,
      longitude: location?.longitude ?? 0,
      radiusMiles: 25,
      limit: 5,
      offset: 0,
    },
    skip: location == null,
  });

  const suggestedMarkets = marketsData?.discoverMarkets ?? [];

  const toggleCategory = useCallback((cat: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) {
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  }, []);

  const handleLocationStep = useCallback(async () => {
    await requestLocation();
    setStep('preferences');
  }, [requestLocation]);

  const handleSkipLocation = useCallback(() => {
    setStep('preferences');
  }, []);

  const handlePreferencesNext = useCallback(() => {
    setStep(location != null ? 'discover' : 'done');
  }, [location]);

  const handleDiscoverNext = useCallback(() => {
    setStep('done');
  }, []);

  const handleFinish = useCallback(
    (destination: 'following' | 'discover') => {
      if (destination === 'discover') {
        router.replace('/(customer)/discover');
      } else {
        router.replace('/(customer)/following');
      }
    },
    [router],
  );

  if (step === 'location') {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0 p-6">
        <VStack className="items-center gap-6 max-w-sm">
          <Box className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center">
            <MapPin size={36} color="#6366f1" />
          </Box>
          <Heading className="text-2xl text-typography-900 text-center">Welcome to Markets</Heading>
          <Text className="text-center text-typography-500">
            Share your location so we can find farmers markets near you.
          </Text>
          {locationLoading ? (
            <Spinner />
          ) : (
            <VStack className="gap-3 w-full">
              <Button
                className="h-12 bg-primary-500 rounded-lg"
                onPress={() => {
                  void handleLocationStep();
                }}
                accessibilityLabel="Use my location"
              >
                <ButtonText className="text-white font-semibold">Use My Location</ButtonText>
              </Button>
              <Button
                className="h-12 bg-transparent border border-outline-300 rounded-lg"
                onPress={handleSkipLocation}
                accessibilityLabel="Skip location"
              >
                <ButtonText className="text-typography-700 font-semibold">Skip for Now</ButtonText>
              </Button>
            </VStack>
          )}
        </VStack>
      </Box>
    );
  }

  if (step === 'preferences') {
    return (
      <Box className="flex-1 bg-background-0 p-6">
        <VStack className="gap-6 flex-1">
          <VStack className="gap-2">
            <Heading className="text-2xl text-typography-900">What are you looking for?</Heading>
            <Text className="text-typography-500">Select categories you are interested in.</Text>
          </VStack>
          <Box className="flex-row flex-wrap gap-3">
            {CATEGORIES.map((cat) => {
              const selected = selectedCategories.has(cat);
              return (
                <Pressable
                  key={cat}
                  onPress={() => {
                    toggleCategory(cat);
                  }}
                  accessibilityLabel={`${selected ? 'Deselect' : 'Select'} ${cat}`}
                  accessibilityRole="button"
                >
                  <Box
                    className={`flex-row items-center gap-1 rounded-full px-4 py-2 ${
                      selected ? 'bg-primary-500' : 'bg-background-100 border border-outline-200'
                    }`}
                  >
                    {selected && <Check size={14} color="#ffffff" />}
                    <Text
                      className={`text-sm font-medium ${
                        selected ? 'text-white' : 'text-typography-600'
                      }`}
                    >
                      {cat}
                    </Text>
                  </Box>
                </Pressable>
              );
            })}
          </Box>
          <Box className="flex-1" />
          <Button
            className="h-12 bg-primary-500 rounded-lg"
            onPress={handlePreferencesNext}
            accessibilityLabel="Continue"
          >
            <ButtonText className="text-white font-semibold">Continue</ButtonText>
          </Button>
        </VStack>
      </Box>
    );
  }

  if (step === 'discover') {
    return (
      <Box className="flex-1 bg-background-0">
        <ScrollView contentContainerStyle={{ padding: 24 }}>
          <VStack className="gap-4">
            <Heading className="text-2xl text-typography-900">Markets Near You</Heading>
            <Text className="text-typography-500">
              Here are some markets nearby. You can follow them to stay updated.
            </Text>
            {marketsLoading ? (
              <Box className="items-center py-8">
                <Spinner />
              </Box>
            ) : suggestedMarkets.length > 0 ? (
              suggestedMarkets.map((market) => (
                <MarketDiscoverCard
                  key={market.id}
                  market={market}
                  onPress={() => {
                    // No navigation during onboarding
                  }}
                />
              ))
            ) : (
              <Text className="text-typography-400 text-center py-4">
                No markets found nearby. You can search later.
              </Text>
            )}
            <Button
              className="h-12 bg-primary-500 rounded-lg mt-4"
              onPress={handleDiscoverNext}
              accessibilityLabel="Continue to finish"
            >
              <ButtonText className="text-white font-semibold">Continue</ButtonText>
            </Button>
          </VStack>
        </ScrollView>
      </Box>
    );
  }

  // Done step
  return (
    <Box className="flex-1 items-center justify-center bg-background-0 p-6">
      <VStack className="items-center gap-6 max-w-sm">
        <Box className="w-20 h-20 rounded-full bg-success-100 items-center justify-center">
          <Check size={36} color="#16a34a" />
        </Box>
        <Heading className="text-2xl text-typography-900 text-center">You are all set!</Heading>
        <Text className="text-center text-typography-500">
          Start discovering markets and following your favorite vendors.
        </Text>
        <VStack className="gap-3 w-full">
          <Button
            className="h-12 bg-primary-500 rounded-lg flex-row items-center justify-center gap-2"
            onPress={() => {
              handleFinish('discover');
            }}
            accessibilityLabel="Go to discover"
          >
            <ButtonText className="text-white font-semibold">Explore Markets</ButtonText>
            <ChevronRight size={18} color="#ffffff" />
          </Button>
          <Button
            className="h-12 bg-transparent border border-outline-300 rounded-lg"
            onPress={() => {
              handleFinish('following');
            }}
            accessibilityLabel="Go to following feed"
          >
            <ButtonText className="text-typography-700 font-semibold">Go to My Feed</ButtonText>
          </Button>
        </VStack>
      </VStack>
    </Box>
  );
}
