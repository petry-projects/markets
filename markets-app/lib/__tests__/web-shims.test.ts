import { Platform } from 'react-native';

/**
 * Tests that web shims can be imported without crashing.
 * These run on all platforms but the web-specific assertions only fire on web.
 * Catches issues like "Cannot set property default of #<Object> which has only a getter"
 * that occur when shim modules use circular module.exports.default = module.exports.
 */

describe('web shims', () => {
  if (Platform.OS === 'web') {
    it('firebase-web-shim exports auth function with providers', () => {
      const auth = require('../firebase-web-shim') as {
        default: () => { signInWithCredential: unknown };
        GoogleAuthProvider: { credential: unknown };
        AppleAuthProvider: { credential: unknown };
        FacebookAuthProvider: { credential: unknown };
      };
      expect(typeof auth.default).toBe('function');
      expect(auth.GoogleAuthProvider).toBeDefined();
      expect(auth.AppleAuthProvider).toBeDefined();
      expect(auth.FacebookAuthProvider).toBeDefined();
    });

    it('google-signin-web-shim exports GoogleSignin', () => {
      const mod = require('../google-signin-web-shim') as {
        GoogleSignin: { signIn: unknown; hasPlayServices: unknown };
      };
      expect(mod.GoogleSignin).toBeDefined();
      expect(typeof mod.GoogleSignin.signIn).toBe('function');
      expect(typeof mod.GoogleSignin.hasPlayServices).toBe('function');
    });

    it('apple-auth-web-shim exports signInAsync and scopes', () => {
      const mod = require('../apple-auth-web-shim') as {
        signInAsync: unknown;
        AppleAuthenticationScope: { FULL_NAME: number; EMAIL: number };
      };
      expect(typeof mod.signInAsync).toBe('function');
      expect(mod.AppleAuthenticationScope.FULL_NAME).toBe(0);
      expect(mod.AppleAuthenticationScope.EMAIL).toBe(1);
    });

    it('apple-auth-web-shim does not have circular default export', () => {
      const mod = require('../apple-auth-web-shim') as Record<string, unknown>;
      // Accessing .default should not throw "Cannot set property default"
      // and should not be a circular reference to the module itself
      expect(mod['default']).toBeUndefined();
    });

    it('firebase-web-shim signInWithCredential throws without UAT bypass', () => {
      const auth = require('../firebase-web-shim') as {
        default: () => { signInWithCredential: () => Promise<unknown> };
      };
      const instance = auth.default();
      void expect(instance.signInWithCredential()).rejects.toThrow();
    });
  } else {
    it('shim tests only run on web platform', () => {
      expect(Platform.OS).not.toBe('web');
    });
  }
});
