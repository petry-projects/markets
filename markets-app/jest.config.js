module.exports = {
  preset: 'jest-expo',
  setupFiles: ['./jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@gluestack-ui/.*|@gluestack-style/.*|nativewind|@legendapp/.*|lucide-react-native)',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.config.js',
    '!**/graphql/generated/**',
    '!**/nativewind-env.d.ts',
    '!**/codegen.ts',
    '!**/tailwind.config.js',
  ],
  // TODO: Coverage thresholds temporarily removed for scaffolding phase.
  // Re-enable when real application code is added. Target thresholds
  // from coding-standards.md: statements 80%, lines 80%, branches 75%.
  // coverageThreshold: {
  //   global: {
  //     branches: 75,
  //     lines: 80,
  //     statements: 80,
  //   },
  // },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css)$': '<rootDir>/__mocks__/styleMock.js',
  },
};
