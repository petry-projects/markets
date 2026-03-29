import React from 'react';
import { render, screen } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import FeedItem from '../FeedItem';

type MockProps = Record<string, unknown> & { children?: ReactNode };

jest.mock('@/components/ui/box', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { Box: ({ children, ...props }: MockProps) => <View {...props}>{children}</View> };
});
jest.mock('@/components/ui/vstack', () => {
  const { View } = require('react-native') as typeof import('react-native');
  return { VStack: ({ children, ...props }: MockProps) => <View {...props}>{children}</View> };
});
jest.mock('@/components/ui/text', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return { Text: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text> };
});
jest.mock('@/components/ui/heading', () => {
  const { Text } = require('react-native') as typeof import('react-native');
  return { Heading: ({ children, ...props }: MockProps) => <Text {...props}>{children}</Text> };
});

describe('FeedItem', () => {
  it('renders vendor feed item with business name', () => {
    const feedItem = {
      id: 'feed-1',
      type: 'VENDOR_UPDATE',
      vendor: { id: 'v1', businessName: 'Farm Fresh', imageURL: null },
      market: null,
      timestamp: new Date().toISOString(),
      message: 'New tomatoes available!',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByText('Farm Fresh')).toBeTruthy();
    expect(screen.getByText('New tomatoes available!')).toBeTruthy();
  });

  it('renders market feed item with market name', () => {
    const feedItem = {
      id: 'feed-2',
      type: 'MARKET_UPDATE',
      vendor: null,
      market: { id: 'm1', name: 'Sunday Market', address: '456 Oak Ave' },
      timestamp: new Date().toISOString(),
      message: 'Market opens at 8am this week!',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByText('Sunday Market')).toBeTruthy();
    expect(screen.getByText('Market opens at 8am this week!')).toBeTruthy();
  });

  it('renders market address when present', () => {
    const feedItem = {
      id: 'feed-3',
      type: 'MARKET_UPDATE',
      vendor: null,
      market: { id: 'm1', name: 'Sunday Market', address: '456 Oak Ave' },
      timestamp: new Date().toISOString(),
      message: 'Hello',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByText('456 Oak Ave')).toBeTruthy();
  });

  it('renders "Unknown" when neither vendor nor market is provided', () => {
    const feedItem = {
      id: 'feed-4',
      type: 'OTHER',
      vendor: null,
      market: null,
      timestamp: new Date().toISOString(),
      message: 'Some update',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByText('Unknown')).toBeTruthy();
  });

  it('has correct accessibility label with vendor name', () => {
    const feedItem = {
      id: 'feed-5',
      type: 'VENDOR_UPDATE',
      vendor: { id: 'v1', businessName: 'Farm Fresh', imageURL: null },
      market: null,
      timestamp: new Date().toISOString(),
      message: 'Update',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByLabelText('Feed update from Farm Fresh')).toBeTruthy();
  });

  it('renders "Just now" for very recent timestamps', () => {
    const feedItem = {
      id: 'feed-6',
      type: 'VENDOR_UPDATE',
      vendor: { id: 'v1', businessName: 'Farm Fresh', imageURL: null },
      market: null,
      timestamp: new Date().toISOString(),
      message: 'Just posted',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByText('Just now')).toBeTruthy();
  });

  it('renders minutes ago for recent timestamps', () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const feedItem = {
      id: 'feed-7',
      type: 'VENDOR_UPDATE',
      vendor: { id: 'v1', businessName: 'Farm Fresh', imageURL: null },
      market: null,
      timestamp: fiveMinAgo,
      message: 'Update',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByText('5m ago')).toBeTruthy();
  });

  it('renders hours ago for older timestamps', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    const feedItem = {
      id: 'feed-8',
      type: 'VENDOR_UPDATE',
      vendor: { id: 'v1', businessName: 'Farm Fresh', imageURL: null },
      market: null,
      timestamp: threeHoursAgo,
      message: 'Update',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByText('3h ago')).toBeTruthy();
  });

  it('renders days ago for multi-day timestamps', () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
    const feedItem = {
      id: 'feed-9',
      type: 'VENDOR_UPDATE',
      vendor: { id: 'v1', businessName: 'Farm Fresh', imageURL: null },
      market: null,
      timestamp: twoDaysAgo,
      message: 'Update',
    };
    render(<FeedItem feedItem={feedItem} />);
    expect(screen.getByText('2d ago')).toBeTruthy();
  });
});
