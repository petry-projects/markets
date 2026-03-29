/**
 * Push notification setup using expo-notifications.
 * Placeholder - will be implemented in Epic 7 (Notifications).
 */

// Push notification setup will include:
// - FCM token registration
// - Notification channel configuration
// - Foreground/background notification handling
// - Permission request flow

export const NOTIFICATION_CHANNELS = {
  VENDOR_CHECKIN: 'vendor-checkin',
  MARKET_UPDATES: 'market-updates',
  FOLLOWING: 'following',
} as const;
