/**
 * Web shim for @react-native-google-signin/google-signin.
 * The native SDK doesn't support web — on web, useAuth uses expo-auth-session instead.
 */
const GoogleSignin = {
  hasPlayServices: async () => true,
  signIn: async () => ({ data: { idToken: null } }),
  configure: () => {},
  signOut: async () => {},
};

module.exports = { GoogleSignin };
module.exports.GoogleSignin = GoogleSignin;
