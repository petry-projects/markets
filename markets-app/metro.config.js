// Learn more: https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Fix tslib CJS/ESM interop issue with Metro web bundler.
// Metro resolves tslib/modules/index.js (CJS node wrapper) on web
// which fails because it can't destructure the default export.
// Force resolution to the ESM build instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Fix tslib CJS/ESM interop on web
  if (platform === 'web' && moduleName === 'tslib') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/tslib/tslib.es6.mjs'),
      type: 'sourceFile',
    };
  }

  // Shim @react-native-firebase/* on web — these packages use native modules
  // that aren't available in the browser
  if (platform === 'web' && moduleName.startsWith('@react-native-firebase/')) {
    return {
      filePath: path.resolve(__dirname, 'lib/firebase-web-shim.js'),
      type: 'sourceFile',
    };
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
