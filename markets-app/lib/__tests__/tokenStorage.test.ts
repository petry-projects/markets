import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { storeToken, getToken, deleteToken } from '../tokenStorage';

jest.mock('expo-secure-store', () => ({
  setItemAsync: jest.fn(),
  getItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

const mockSetItem = SecureStore.setItemAsync as jest.MockedFunction<
  typeof SecureStore.setItemAsync
>;
const mockGetItem = SecureStore.getItemAsync as jest.MockedFunction<
  typeof SecureStore.getItemAsync
>;
const mockDeleteItem = SecureStore.deleteItemAsync as jest.MockedFunction<
  typeof SecureStore.deleteItemAsync
>;

describe('tokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  if (Platform.OS === 'web') {
    // Web platform tests — tokenStorage should use localStorage
    let spySetItem: jest.SpyInstance;
    let spyGetItem: jest.SpyInstance;
    let spyRemoveItem: jest.SpyInstance;

    beforeEach(() => {
      localStorage.clear();
      spySetItem = jest.spyOn(Storage.prototype, 'setItem');
      spyGetItem = jest.spyOn(Storage.prototype, 'getItem');
      spyRemoveItem = jest.spyOn(Storage.prototype, 'removeItem');
    });

    afterEach(() => {
      spySetItem.mockRestore();
      spyGetItem.mockRestore();
      spyRemoveItem.mockRestore();
    });

    it('storeToken uses localStorage instead of SecureStore', async () => {
      await storeToken('web-token');
      expect(mockSetItem).not.toHaveBeenCalled();
      expect(spySetItem).toHaveBeenCalledWith('firebase_jwt', 'web-token');
    });

    it('getToken uses localStorage instead of SecureStore', async () => {
      localStorage.setItem('firebase_jwt', 'web-token');
      spyGetItem.mockClear();
      const token = await getToken();
      expect(token).toBe('web-token');
      expect(mockGetItem).not.toHaveBeenCalled();
    });

    it('deleteToken uses localStorage instead of SecureStore', async () => {
      await deleteToken();
      expect(mockDeleteItem).not.toHaveBeenCalled();
      expect(spyRemoveItem).toHaveBeenCalledWith('firebase_jwt');
    });

    it('getToken returns null when no token stored on web', async () => {
      const token = await getToken();
      expect(token).toBeNull();
    });
  } else {
    // Native platform tests (ios/android) — tokenStorage should use SecureStore
    // Test case 1.2.10: Successful sign-in stores token in expo-secure-store
    it('stores the Firebase JWT in secure storage', async () => {
      await storeToken('test-jwt-token');
      expect(mockSetItem).toHaveBeenCalledWith('firebase_jwt', 'test-jwt-token');
    });

    it('retrieves stored token', async () => {
      mockGetItem.mockResolvedValue('stored-token');
      const token = await getToken();
      expect(token).toBe('stored-token');
      expect(mockGetItem).toHaveBeenCalledWith('firebase_jwt');
    });

    it('returns null when no token stored', async () => {
      mockGetItem.mockResolvedValue(null);
      const token = await getToken();
      expect(token).toBeNull();
    });

    it('removes token from secure storage on sign-out', async () => {
      await deleteToken();
      expect(mockDeleteItem).toHaveBeenCalledWith('firebase_jwt');
    });
  }
});
