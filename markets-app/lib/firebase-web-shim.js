/**
 * Web shim for @react-native-firebase/auth.
 * The native Firebase SDK doesn't support web — this provides a stub
 * so the app can load in a browser for development/testing.
 *
 * UAT bypass: when EXPO_PUBLIC_UAT_BYPASS_AUTH is set, signInWithCredential
 * simulates a successful sign-in with a mock user instead of throwing.
 */

const UAT_BYPASS =
  typeof process !== 'undefined' &&
  process.env &&
  process.env.EXPO_PUBLIC_UAT_BYPASS_AUTH === 'true';

const UAT_ROLE = (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_UAT_ROLE) || 'customer';

let authStateListener = null;

const mockUser = {
  uid: 'uat-mock-uid',
  email: 'uat@example.com',
  displayName: 'UAT User',
  getIdToken: async () => 'uat-mock-jwt-token',
  getIdTokenResult: async () => ({
    claims: { role: UAT_ROLE },
    token: 'uat-mock-jwt-token',
  }),
};

const noopAuth = {
  currentUser: null,
  onAuthStateChanged: (cb) => {
    authStateListener = cb;
    // Fire immediately with current state (null = not signed in)
    if (!UAT_BYPASS) {
      cb(null);
    } else {
      // In UAT bypass mode, start as not signed in — wait for signInWithCredential
      cb(null);
    }
    return () => {
      authStateListener = null;
    };
  },
  signInWithCredential: async () => {
    if (!UAT_BYPASS) {
      throw new Error('Firebase native auth is not available on web');
    }
    // UAT bypass: simulate successful sign-in
    noopAuth.currentUser = mockUser;
    if (authStateListener) {
      authStateListener(mockUser);
    }
    return { user: mockUser };
  },
  signOut: async () => {
    noopAuth.currentUser = null;
    if (authStateListener) {
      authStateListener(null);
    }
  },
  onIdTokenChanged: (cb) => {
    cb(null);
    return () => {};
  },
};

const auth = () => noopAuth;
auth.GoogleAuthProvider = { credential: () => ({}) };
auth.AppleAuthProvider = { credential: () => ({}) };
auth.FacebookAuthProvider = { credential: () => ({}) };

const firebase = {
  auth: () => noopAuth,
};

// Support both default and named imports
module.exports = auth;
module.exports.default = auth;
module.exports.firebase = firebase;
module.exports.FirebaseAuthTypes = {};
