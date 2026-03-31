import { renderHook, act } from '@testing-library/react-native';

import { useLocation, useAutoLocation } from '../useLocation';

const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) =>
    mockRequestForegroundPermissionsAsync(...args) as unknown,
  getCurrentPositionAsync: (...args: unknown[]) => mockGetCurrentPositionAsync(...args) as unknown,
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  Accuracy: { Balanced: 3 },
}));

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns initial state', () => {
    const { result } = renderHook(() => useLocation());
    expect(result.current.location).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.requestLocation).toBeInstanceOf(Function);
  });

  it('sets location on successful permission and position', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.006 },
    });

    const { result } = renderHook(() => useLocation());
    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.location).toEqual({ latitude: 40.7128, longitude: -74.006 });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('sets error when permission is denied', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'denied' });

    const { result } = renderHook(() => useLocation());
    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('Location permission denied');
    expect(result.current.loading).toBe(false);
  });

  it('sets error when getCurrentPositionAsync throws', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPositionAsync.mockRejectedValue(new Error('GPS unavailable'));

    const { result } = renderHook(() => useLocation());
    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.location).toBeNull();
    expect(result.current.error).toBe('GPS unavailable');
    expect(result.current.loading).toBe(false);
  });

  it('sets generic error for non-Error throws', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPositionAsync.mockRejectedValue('string error');

    const { result } = renderHook(() => useLocation());
    await act(async () => {
      await result.current.requestLocation();
    });

    expect(result.current.error).toBe('Failed to get location');
  });
});

describe('useAutoLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests location on mount', async () => {
    mockRequestForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: { latitude: 35.0, longitude: -120.0 },
    });

    renderHook(() => useAutoLocation());

    // Wait for the auto-request to complete
    await act(async () => {
      // Let the useEffect fire
    });

    expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalled();
  });
});
