/* global jest */
// Pre-define globals that expo/src/winter tries to lazily install
// This prevents the lazy getter from trying to use dynamic import() in Jest
if (typeof globalThis.structuredClone === 'undefined') {
  globalThis.structuredClone = (obj) => JSON.parse(JSON.stringify(obj));
}

// Pre-define __ExpoImportMetaRegistry before expo/src/winter tries to install it
if (typeof globalThis.__ExpoImportMetaRegistry === 'undefined') {
  Object.defineProperty(globalThis, '__ExpoImportMetaRegistry', {
    value: { url: null },
    configurable: true,
    enumerable: false,
    writable: true,
  });
}

// Mock react-native-safe-area-context for NativeWind CSS interop
jest.mock('react-native-safe-area-context', () => {
  const SafeAreaProvider = ({ children }) => children;
  SafeAreaProvider.displayName = 'SafeAreaProvider';
  const SafeAreaView = ({ children }) => children;
  SafeAreaView.displayName = 'SafeAreaView';
  return {
    SafeAreaProvider,
    SafeAreaView,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  };
});
