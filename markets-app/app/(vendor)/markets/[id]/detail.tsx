import React, { useState, useCallback, useMemo } from 'react';
import { ScrollView, Alert, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery, useMutation } from '@apollo/client/react';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CheckIcon } from 'lucide-react-native';
import {
  GetMarketDocument,
  RequestToJoinMarketDocument,
  VendorMarketsDocument,
} from '@/graphql/generated/graphql';

export default function MarketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data, loading } = useQuery(GetMarketDocument, {
    variables: { id },
  });
  const [requestJoin, { loading: joinLoading }] = useMutation(RequestToJoinMarketDocument, {
    refetchQueries: [{ query: VendorMarketsDocument }],
  });

  const [selectedDates, setSelectedDates] = useState(new Set<string>());
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);

  const market = data?.market;

  // Generate upcoming operating dates from schedule (next 12 weeks)
  const upcomingDates = useMemo(() => {
    if (!market?.schedule) return [];
    const dates: string[] = [];
    const now = new Date();

    for (const sched of market.schedule) {
      if (sched.scheduleType === 'RECURRING' && sched.dayOfWeek != null) {
        const d = new Date(now);
        const diff = (sched.dayOfWeek - d.getDay() + 7) % 7;
        d.setDate(d.getDate() + (diff === 0 ? 0 : diff));

        for (let i = 0; i < 12; i++) {
          const dateStr = d.toISOString().split('T')[0] ?? '';

          if (
            sched.seasonStart != null &&
            sched.seasonStart !== '' &&
            dateStr < sched.seasonStart
          ) {
            d.setDate(d.getDate() + 7);
            continue;
          }
          if (sched.seasonEnd != null && sched.seasonEnd !== '' && dateStr > sched.seasonEnd) break;

          dates.push(dateStr);
          d.setDate(d.getDate() + 7);
        }
      } else if (
        sched.scheduleType === 'ONE_TIME' &&
        sched.eventDate != null &&
        sched.eventDate !== ''
      ) {
        const todayStr = now.toISOString().split('T')[0] ?? '';
        if (sched.eventDate >= todayStr) {
          dates.push(sched.eventDate);
        }
      }
    }

    return [...new Set(dates)].sort();
  }, [market?.schedule]);

  const toggleDate = useCallback((date: string) => {
    setSelectedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) {
        next.delete(date);
      } else {
        next.add(date);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedDates(new Set(upcomingDates));
  }, [upcomingDates]);

  const handleJoinRequest = useCallback(async () => {
    if (selectedDates.size === 0) {
      Alert.alert('No Dates Selected', 'Please select at least one date.');
      return;
    }

    try {
      await requestJoin({
        variables: {
          marketID: id,
          dates: Array.from(selectedDates),
          acknowledgeRules: rulesAcknowledged,
        },
      });
      Alert.alert('Request Sent', 'Your join request has been submitted.', [
        {
          text: 'OK',
          onPress: () => {
            router.back();
          },
        },
      ]);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit request';
      Alert.alert('Error', message);
    }
  }, [requestJoin, id, selectedDates, rulesAcknowledged, router]);

  if (loading) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Spinner />
      </Box>
    );
  }

  if (!market) {
    return (
      <Box className="flex-1 items-center justify-center bg-background-0">
        <Text className="text-typography-400">Market not found.</Text>
      </Box>
    );
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <ScrollView className="flex-1 bg-background-0">
      <VStack className="p-4 gap-5">
        {/* Market Info */}
        <VStack className="gap-2">
          <Heading className="text-xl text-typography-900">{market.name}</Heading>
          <Text className="text-typography-500">{market.address}</Text>
          {market.description != null && market.description !== '' && (
            <Text className="text-typography-600">{market.description}</Text>
          )}
          <Text className="text-sm text-typography-500">
            Contact: {market.contactEmail}
            {market.contactPhone != null && market.contactPhone !== ''
              ? ` | ${market.contactPhone}`
              : ''}
          </Text>
        </VStack>

        {/* Schedule */}
        {market.schedule.length > 0 && (
          <VStack className="gap-2">
            <Heading className="text-lg text-typography-900">Schedule</Heading>
            {market.schedule.map((s) => (
              <Text key={s.id} className="text-sm text-typography-600">
                {s.scheduleType === 'RECURRING'
                  ? `${String(dayNames[s.dayOfWeek ?? 0])}s ${s.startTime}-${s.endTime}`
                  : `${s.eventName ?? 'Event'} on ${s.eventDate ?? ''}`}
                {s.seasonStart != null && s.seasonStart !== ''
                  ? ` (${s.seasonStart} - ${s.seasonEnd ?? ''})`
                  : ''}
              </Text>
            ))}
          </VStack>
        )}

        {/* Rules */}
        {market.rulesText != null && market.rulesText !== '' && (
          <VStack className="gap-2">
            <Heading className="text-lg text-typography-900">Market Rules</Heading>
            <Box className="rounded-lg border border-outline-200 bg-background-50 p-3">
              <Text className="text-sm text-typography-600">{market.rulesText}</Text>
              {market.rulesUpdatedAt != null && market.rulesUpdatedAt !== '' && (
                <Text className="text-xs text-typography-400 mt-2">
                  Last updated: {market.rulesUpdatedAt}
                </Text>
              )}
            </Box>
          </VStack>
        )}

        {/* Date Selection */}
        <VStack className="gap-2">
          <Box className="flex-row items-center justify-between">
            <Heading className="text-lg text-typography-900">Select Dates</Heading>
            <Button
              className="bg-transparent"
              onPress={selectAll}
              accessibilityLabel="Select all dates"
            >
              <ButtonText className="text-primary-600 text-sm">Select All</ButtonText>
            </Button>
          </Box>

          {selectedDates.size > 0 && (
            <Text className="text-sm text-primary-600">
              {selectedDates.size} date
              {selectedDates.size !== 1 ? 's' : ''} selected
            </Text>
          )}

          {upcomingDates.map((date) => (
            <Pressable
              key={date}
              onPress={() => {
                toggleDate(date);
              }}
              accessibilityLabel={`Select ${date}`}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selectedDates.has(date) }}
            >
              <Box
                className={`rounded-lg border p-3 ${
                  selectedDates.has(date)
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-outline-200 bg-background-0'
                }`}
              >
                <Box className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm ${
                      selectedDates.has(date)
                        ? 'text-primary-700 font-medium'
                        : 'text-typography-600'
                    }`}
                  >
                    {new Date(date + 'T12:00:00').toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                  {selectedDates.has(date) && <CheckIcon size={16} color="#16a34a" />}
                </Box>
              </Box>
            </Pressable>
          ))}

          {upcomingDates.length === 0 && (
            <Text className="text-sm text-typography-400">No upcoming dates available.</Text>
          )}
        </VStack>

        {/* Rules Acknowledgment */}
        {market.rulesText != null && market.rulesText !== '' && (
          <Pressable
            onPress={() => {
              setRulesAcknowledged(!rulesAcknowledged);
            }}
            accessibilityLabel="I acknowledge the market rules"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: rulesAcknowledged }}
          >
            <Box className="flex-row items-center gap-3">
              <Box
                className={`w-5 h-5 rounded border items-center justify-center ${
                  rulesAcknowledged
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-outline-300 bg-background-0'
                }`}
              >
                {rulesAcknowledged && <CheckIcon size={14} color="#ffffff" />}
              </Box>
              <Text className="text-sm text-typography-600 flex-1">
                I acknowledge and agree to the market rules
              </Text>
            </Box>
          </Pressable>
        )}

        {/* Submit */}
        <Button
          className="h-14 bg-primary-500 rounded-lg mt-2"
          onPress={() => {
            void handleJoinRequest();
          }}
          disabled={
            joinLoading ||
            selectedDates.size === 0 ||
            (market.rulesText != null && market.rulesText !== '' && !rulesAcknowledged)
          }
          accessibilityLabel="Request to join market"
        >
          {joinLoading ? (
            <Spinner className="text-white" />
          ) : (
            <ButtonText className="text-white font-semibold text-base">Request to Join</ButtonText>
          )}
        </Button>
      </VStack>
    </ScrollView>
  );
}
