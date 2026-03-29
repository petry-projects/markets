import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import ActivityFeedItem from '../ActivityFeedItem';

type MockProps = Record<string, unknown> & { children?: ReactNode };

jest.mock('@/components/ui/box', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    Box: ({ children, ...props }: MockProps) => <View {...props}>{children}</View>,
  };
});
jest.mock('@/components/ui/text', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return {
    Text: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text>,
  };
});

jest.mock('lucide-react-native', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return {
    LogIn: (props: Record<string, unknown>) => <View testID="icon-log-in" {...props} />,
    LogOut: (props: Record<string, unknown>) => <View testID="icon-log-out" {...props} />,
    AlertTriangle: (props: Record<string, unknown>) => (
      <View testID="icon-alert-triangle" {...props} />
    ),
    Megaphone: (props: Record<string, unknown>) => <View testID="icon-megaphone" {...props} />,
  };
});

describe('ActivityFeedItem', () => {
  const baseItem = {
    id: 'a1',
    actionType: 'check_in',
    message: 'Vendor checked in at Downtown Market',
    createdAt: new Date().toISOString(),
  };

  it('renders the message text', () => {
    render(<ActivityFeedItem item={baseItem} />);
    expect(screen.getByText('Vendor checked in at Downtown Market')).toBeTruthy();
  });

  it('renders check_in icon', () => {
    render(<ActivityFeedItem item={baseItem} />);
    expect(screen.getByTestId('icon-log-in')).toBeTruthy();
  });

  it('renders check_out icon', () => {
    render(<ActivityFeedItem item={{ ...baseItem, actionType: 'check_out' }} />);
    expect(screen.getByTestId('icon-log-out')).toBeTruthy();
  });

  it('renders exception icon', () => {
    render(<ActivityFeedItem item={{ ...baseItem, actionType: 'exception' }} />);
    expect(screen.getByTestId('icon-alert-triangle')).toBeTruthy();
  });

  it('renders market_update icon', () => {
    render(<ActivityFeedItem item={{ ...baseItem, actionType: 'market_update' }} />);
    expect(screen.getByTestId('icon-megaphone')).toBeTruthy();
  });

  it('renders default icon for unknown action type', () => {
    render(<ActivityFeedItem item={{ ...baseItem, actionType: 'unknown_type' }} />);
    expect(screen.getByTestId('icon-megaphone')).toBeTruthy();
  });

  it('renders "Just now" for recent timestamps', () => {
    render(<ActivityFeedItem item={baseItem} />);
    expect(screen.getByText('Just now')).toBeTruthy();
  });

  it('renders time ago for older timestamps', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    render(<ActivityFeedItem item={{ ...baseItem, createdAt: twoHoursAgo }} />);
    expect(screen.getByText('2h ago')).toBeTruthy();
  });

  it('renders days ago for old timestamps', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    render(<ActivityFeedItem item={{ ...baseItem, createdAt: threeDaysAgo }} />);
    expect(screen.getByText('3d ago')).toBeTruthy();
  });

  it('renders minutes ago', () => {
    const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    render(<ActivityFeedItem item={{ ...baseItem, createdAt: tenMinsAgo }} />);
    expect(screen.getByText('10m ago')).toBeTruthy();
  });

  it('renders testID with item id', () => {
    render(<ActivityFeedItem item={baseItem} />);
    expect(screen.getByTestId('activity-item-a1')).toBeTruthy();
  });
});
