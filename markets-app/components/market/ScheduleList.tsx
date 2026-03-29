import React from 'react';
import { Alert } from 'react-native';
import { Box } from '@/components/ui/box';
import { VStack } from '@/components/ui/vstack';
import { Text } from '@/components/ui/text';
import { Heading } from '@/components/ui/heading';
import { Button, ButtonText } from '@/components/ui/button';
import type { ScheduleType } from '@/graphql/generated/graphql';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export type ScheduleItem = {
  id: string;
  scheduleType: ScheduleType;
  dayOfWeek?: number | null;
  frequency?: string | null;
  seasonStart?: string | null;
  seasonEnd?: string | null;
  eventName?: string | null;
  eventDate?: string | null;
  startTime: string;
  endTime: string;
  label?: string | null;
};

type ScheduleListProps = {
  schedules: ScheduleItem[];
  onAdd: (type: 'RECURRING' | 'ONE_TIME') => void;
  onEdit: (schedule: ScheduleItem) => void;
  onDelete: (id: string) => void;
};

export function ScheduleList({ schedules, onAdd, onEdit, onDelete }: ScheduleListProps) {
  const recurring = schedules.filter((s) => s.scheduleType === 'RECURRING');
  const oneTime = schedules.filter((s) => s.scheduleType === 'ONE_TIME');

  const confirmDelete = (id: string) => {
    Alert.alert('Delete Schedule', 'Are you sure you want to remove this schedule?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => { onDelete(id); } },
    ]);
  };

  return (
    <VStack className="gap-4">
      <Heading className="text-lg text-typography-900">Schedules</Heading>

      {recurring.length > 0 && (
        <VStack className="gap-2">
          <Text className="text-sm font-medium text-typography-600">Recurring</Text>
          {recurring.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onEdit={onEdit}
              onDelete={confirmDelete}
              isRecurring
            />
          ))}
        </VStack>
      )}

      {oneTime.length > 0 && (
        <VStack className="gap-2">
          <Text className="text-sm font-medium text-typography-600">One-Time Events</Text>
          {oneTime.map((s) => (
            <ScheduleCard
              key={s.id}
              schedule={s}
              onEdit={onEdit}
              onDelete={confirmDelete}
              isRecurring={false}
            />
          ))}
        </VStack>
      )}

      {schedules.length === 0 && (
        <Text className="text-sm text-typography-400 text-center py-4">
          No schedules yet. Add a recurring or one-time schedule.
        </Text>
      )}

      <Box className="flex-row gap-3">
        <Button
          className="flex-1 h-12 bg-primary-50 border border-primary-500 rounded-lg"
          onPress={() => { onAdd('RECURRING'); }}
          accessibilityLabel="Add recurring schedule"
        >
          <ButtonText className="text-primary-500 font-medium text-sm">+ Recurring</ButtonText>
        </Button>
        <Button
          className="flex-1 h-12 bg-warning-50 border border-warning-500 rounded-lg"
          onPress={() => { onAdd('ONE_TIME'); }}
          accessibilityLabel="Add one-time event"
        >
          <ButtonText className="text-warning-600 font-medium text-sm">+ One-Time</ButtonText>
        </Button>
      </Box>
    </VStack>
  );
}

type ScheduleCardProps = {
  schedule: ScheduleItem;
  onEdit: (schedule: ScheduleItem) => void;
  onDelete: (id: string) => void;
  isRecurring: boolean;
};

function ScheduleCard({ schedule, onEdit, onDelete, isRecurring }: ScheduleCardProps) {
  const bgClass = isRecurring
    ? 'bg-primary-50 border-primary-200'
    : 'bg-warning-50 border-warning-200';

  return (
    <Box className={`p-3 rounded-lg border ${bgClass}`}>
      <Box className="flex-row justify-between items-start">
        <Box className="flex-1">
          {isRecurring ? (
            <>
              <Text className="text-sm font-semibold text-typography-900">
                {schedule.dayOfWeek != null ? DAY_NAMES[schedule.dayOfWeek] : 'Day TBD'}
              </Text>
              <Text className="text-xs text-typography-500">
                {schedule.startTime} - {schedule.endTime}
                {schedule.frequency != null && schedule.frequency !== '' ? ` (${schedule.frequency})` : ''}
              </Text>
              {schedule.label != null && schedule.label !== '' && (
                <Text className="text-xs text-typography-400 mt-1">{schedule.label}</Text>
              )}
              {schedule.seasonStart != null && schedule.seasonStart !== '' && (
                <Text className="text-xs text-typography-400">
                  Season: {schedule.seasonStart} to {schedule.seasonEnd}
                </Text>
              )}
            </>
          ) : (
            <>
              <Text className="text-sm font-semibold text-typography-900">
                {(schedule.eventName != null && schedule.eventName !== '') ? schedule.eventName : 'Event'}
              </Text>
              <Text className="text-xs text-typography-500">
                {schedule.eventDate} {schedule.startTime} - {schedule.endTime}
              </Text>
            </>
          )}
        </Box>
        <Box className="flex-row gap-2">
          <Button
            className="h-8 px-2 bg-transparent"
            onPress={() => { onEdit(schedule); }}
            accessibilityLabel={`Edit ${isRecurring ? 'recurring' : 'one-time'} schedule`}
          >
            <ButtonText className="text-xs text-primary-500">Edit</ButtonText>
          </Button>
          <Button
            className="h-8 px-2 bg-transparent"
            onPress={() => { onDelete(schedule.id); }}
            accessibilityLabel={`Delete ${isRecurring ? 'recurring' : 'one-time'} schedule`}
          >
            <ButtonText className="text-xs text-error-500">Delete</ButtonText>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
