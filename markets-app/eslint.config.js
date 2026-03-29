const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const tseslint = require('typescript-eslint');

module.exports = defineConfig([
  ...expoConfig,
  ...tseslint.configs.strictTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.{ts,tsx}'],
  })),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // Mandatory rules from coding-standards.md Section 9
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/strict-boolean-expressions': 'error',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      // React hooks enforcement
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // no-require-imports is off because _layout.tsx uses require() for font assets
      // and config files (babel, jest, tailwind) are already in ignores
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    ignores: [
      'graphql/generated/**',
      'node_modules/**',
      'babel.config.js',
      'jest.config.js',
      'tailwind.config.js',
      'eslint.config.js',
      'codegen.ts',
    ],
  },
]);
