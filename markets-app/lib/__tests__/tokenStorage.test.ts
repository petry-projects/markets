import { storeToken, getToken, deleteToken } from '../tokenStorage';
import * as SecureStore from 'expo-secure-store';

// Mock expo-secure-store
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

  // Test case 1.2.10: Successful sign-in stores token in expo-secure-store
  describe('storeToken', () => {
    it('stores the Firebase JWT in secure storage', async () => {
      await storeToken('test-jwt-token');
      expect(mockSetItem).toHaveBeenCalledWith('firebase_jwt', 'test-jwt-token');
    });
  });

  describe('getToken', () => {
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
  });

  describe('deleteToken', () => {
    it('removes token from secure storage on sign-out', async () => {
      await deleteToken();
      expect(mockDeleteItem).toHaveBeenCalledWith('firebase_jwt');
    });
  });
});
