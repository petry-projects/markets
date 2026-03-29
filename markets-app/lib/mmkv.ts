/**
 * MMKV offline queue utilities.
 * Placeholder - will be implemented when offline support is needed.
 */

// MMKV will be used for:
// - Offline action queue (mutations to retry when online)
// - Local preferences and cached data
// - Fast key-value storage for non-sensitive data

export const MMKV_KEYS = {
  OFFLINE_QUEUE: 'offline-queue',
  USER_PREFERENCES: 'user-preferences',
} as const;
