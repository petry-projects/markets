/**
 * Web shim for @react-native-firebase/auth.
 * The native Firebase SDK doesn't support web — this provides a stub
 * so the app can load in a browser for development/testing.
 * Real Firebase auth on web would use the Firebase JS SDK (firebase/auth).
 */

const noopAuth = {
  currentUser: null,
  onAuthStateChanged: (cb) => {
    cb(null);
    return () => {};
  },
  signInWithCredential: async () => {
    throw new Error('Firebase native auth is not available on web');
  },
  signOut: async () => {},
  onIdTokenChanged: (cb) => {
    cb(null);
    return () => {};
  },
};

const auth = () => noopAuth;
auth.GoogleAuthProvider = { credential: () => ({}) };
auth.AppleAuthProvider = { credential: () => ({}) };

const firebase = {
  auth: () => noopAuth,
};

// Support both default and named imports
module.exports = auth;
module.exports.default = auth;
module.exports.firebase = firebase;
module.exports.FirebaseAuthTypes = {};
