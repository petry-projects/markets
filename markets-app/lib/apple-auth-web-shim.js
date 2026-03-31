/**
 * Web shim for expo-apple-authentication.
 * Apple Sign-In is iOS-only. The login screen already hides the Apple button
 * on non-iOS platforms, so these stubs should never be called.
 */
const AppleAuthenticationScope = {
  FULL_NAME: 0,
  EMAIL: 1,
};

async function signInAsync() {
  throw new Error('Apple Sign-In is not available on web');
}

module.exports = {
  signInAsync,
  AppleAuthenticationScope,
};
