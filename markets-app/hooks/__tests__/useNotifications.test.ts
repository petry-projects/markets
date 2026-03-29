import { renderHook, act } from '@testing-library/react-native';

import { useNotifications } from '../useNotifications';

const mockGetPermissions = jest.fn();
const mockRequestPermissions = jest.fn();
const mockGetExpoPushToken = jest.fn();

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: () => mockGetPermissions() as unknown,
  requestPermissionsAsync: () => mockRequestPermissions() as unknown,
  getExpoPushTokenAsync: () => mockGetExpoPushToken() as unknown,
}));

const mockRegisterToken = jest.fn().mockResolvedValue({ data: {} });
jest.mock('@apollo/client/react', () => ({
  useMutation: () => [mockRegisterToken] as unknown,
}));

jest.mock('@/graphql/generated/graphql', () => ({
  RegisterDeviceTokenDocument: { kind: 'Document' },
}));

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useNotifications());

    expect(result.current.pushToken).toBeNull();
    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('requests permission and registers token on success', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushToken.mockResolvedValue({
      data: 'ExponentPushToken[abc123]',
    });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permissionGranted).toBe(true);
    expect(result.current.pushToken).toBe('ExponentPushToken[abc123]');
    expect(mockRegisterToken).toHaveBeenCalledWith({
      variables: {
        input: {
          token: 'ExponentPushToken[abc123]',
          platform: expect.any(String) as string,
        },
      },
    });
  });

  it('sets error when permission is denied', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'undetermined' });
    mockRequestPermissions.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.permissionGranted).toBe(false);
    expect(result.current.error).toBe('Push notification permission not granted');
  });

  it('skips requesting if already granted', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushToken.mockResolvedValue({
      data: 'ExponentPushToken[xyz789]',
    });

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(result.current.pushToken).toBe('ExponentPushToken[xyz789]');
  });

  it('handles errors during registration', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });
    mockGetExpoPushToken.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useNotifications());

    await act(async () => {
      await result.current.requestPermission();
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.loading).toBe(false);
  });

  it('detects already-granted permission on mount', async () => {
    mockGetPermissions.mockResolvedValue({ status: 'granted' });

    const { result } = renderHook(() => useNotifications());

    // Wait for the useEffect to run
    await act(async () => {
      await new Promise((resolve) => {
        setTimeout(resolve, 10);
      });
    });

    expect(result.current.permissionGranted).toBe(true);
  });
});
