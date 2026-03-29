import React from 'react';
import { LogIn, LogOut, AlertTriangle, Megaphone } from 'lucide-react-native';
import { Box } from '@/components/ui/box';
import { Text } from '@/components/ui/text';

type ActivityFeedItemData = {
  id: string;
  actionType: string;
  message: string;
  createdAt: string;
};

type ActivityFeedItemProps = {
  item: ActivityFeedItemData;
};

function getActionIcon(actionType: string): React.ReactNode {
  switch (actionType) {
    case 'check_in':
      return <LogIn size={20} color="#22c55e" />;
    case 'check_out':
      return <LogOut size={20} color="#3b82f6" />;
    case 'exception':
      return <AlertTriangle size={20} color="#ef4444" />;
    case 'market_update':
      return <Megaphone size={20} color="#8b5cf6" />;
    default:
      return <Megaphone size={20} color="#6b7280" />;
  }
}

function getActionColor(actionType: string): string {
  switch (actionType) {
    case 'check_in':
      return 'bg-success-100';
    case 'check_out':
      return 'bg-info-100';
    case 'exception':
      return 'bg-error-100';
    case 'market_update':
      return 'bg-primary-100';
    default:
      return 'bg-background-100';
  }
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${String(diffMins)}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${String(diffHours)}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${String(diffDays)}d ago`;
}

export default function ActivityFeedItem({ item }: ActivityFeedItemProps) {
  return (
    <Box
      className="flex-row items-start rounded-lg border border-outline-200 bg-background-0 p-3 mb-2"
      testID={`activity-item-${item.id}`}
    >
      <Box
        className={`w-10 h-10 rounded-full items-center justify-center mr-3 ${getActionColor(item.actionType)}`}
      >
        {getActionIcon(item.actionType)}
      </Box>
      <Box className="flex-1">
        <Text className="text-sm text-typography-900">{item.message}</Text>
        <Text className="text-xs text-typography-500 mt-1">{formatTimestamp(item.createdAt)}</Text>
      </Box>
    </Box>
  );
}
