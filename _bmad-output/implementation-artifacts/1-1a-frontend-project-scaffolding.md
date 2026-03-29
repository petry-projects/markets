# Story 1.1a: Frontend Project Scaffolding

Status: ready-for-dev

## Story

As a developer,
I want the React Native/Expo frontend project initialized with all required dependencies,
So that frontend development can begin on a solid, configured foundation.

## Acceptance Criteria (from epics.md)

**Given** a fresh development environment
**When** the frontend setup is run
**Then** the Expo app is created with tabs template (`npx create-expo-app@latest markets-app --template tabs`)
**And** Gluestack UI v3 is initialized (`npx gluestack-ui init`) with custom theme provider and design tokens (UX-DR1)
**And** Apollo Client 4.x, NativeWind v4, MMKV, expo-secure-store, and expo-notifications are installed
**And** @graphql-codegen is configured to generate TypeScript types from the schema
**And** role-specific tab navigation is configured (UX-DR10): Customer (Discover/Following/Profile), Vendor (Markets/Status/Profile), Manager (Dashboard/Vendors/Profile)
**And** CI workflow exists for frontend (lint, test, type-check)
**And** a test runner is configured (Jest + React Native Testing Library) and a smoke test passes

## Tasks / Subtasks

### Task 1: Create Expo App with Tabs Template [AC-1]

1.1. Run `npx create-expo-app@latest markets-app --template tabs` from the repo root
1.2. Verify the generated app starts with `npx expo start`
1.3. Confirm TypeScript strict mode is enabled in `tsconfig.json`
1.4. Add `noUncheckedIndexedAccess: true` to `tsconfig.json` compiler options (coding-standards.md Section 9)

### Task 2: Initialize Gluestack UI v3 with Custom Theme [AC-2]

2.1. Run `npx gluestack-ui init` inside `markets-app/`
2.2. Verify `components/gluestack-ui-provider/` is created with `config.ts`
2.3. Configure design tokens in `config.ts` as CSS variables for light and dark modes:
```typescript
export const config = {
  light: vars({
    '--color-primary-500': '...', // Main brand color
    '--color-background-0': '...', // Base background
    // Additional tokens per UX-DR1
  }),
  dark: vars({
    '--color-primary-500': '...',
    '--color-background-0': '...',
  }),
};
```
2.4. Wrap root layout (`app/_layout.tsx`) with `GluestackUIProvider`
2.5. Add a few base Gluestack components via CLI for verification: `npx gluestack-ui add box text button`

### Task 3: Install All Required Dependencies [AC-3]

3.1. Install Apollo Client and codegen:
```bash
npx expo install @apollo/client graphql
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo
```

3.2. Install NativeWind v4:
```bash
npx expo install nativewind tailwindcss
```

3.3. Install MMKV:
```bash
npx expo install react-native-mmkv
```

3.4. Install expo-secure-store:
```bash
npx expo install expo-secure-store
```

3.5. Install expo-notifications:
```bash
npx expo install expo-notifications
```

3.6. Install expo-image (required per Agents.md for all image rendering):
```bash
npx expo install expo-image
```

3.7. Install FlashList (required per architecture.md for list virtualization):
```bash
npx expo install @shopify/flash-list
```

3.8. Install lucide-react-native (the only permitted icon library per Agents.md):
```bash
npm install lucide-react-native react-native-svg
```

3.9. Verify all dependencies resolve without conflicts via `npx expo doctor`

### Task 4: Configure NativeWind v4 [AC-3]

4.1. Create `tailwind.config.js` at the project root:
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: { 500: 'var(--color-primary-500)' },
        background: { DEFAULT: 'var(--color-background-0)' },
        // Map additional design tokens from config.ts
      },
    },
  },
  plugins: [],
};
```

4.2. Create `global.css` with Tailwind directives:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

4.3. Add NativeWind babel preset to `babel.config.js`:
```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

4.4. Import `global.css` in the root layout
4.5. Add `/// <reference types="nativewind/types" />` to a global `.d.ts` file so `className` prop is recognized

### Task 5: Configure @graphql-codegen [AC-4]

5.1. Create `codegen.ts` configuration file:
```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  // Schema source will be updated when backend is ready
  // For now, use a placeholder schema file
  schema: './graphql/schema.graphql',
  documents: ['./graphql/queries/**/*.graphql', './graphql/mutations/**/*.graphql'],
  generates: {
    './graphql/generated/': {
      preset: 'client',
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-apollo',
      ],
      config: {
        strictScalars: true,
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
```

5.2. Create placeholder directory structure:
```
graphql/
  queries/
  mutations/
  generated/
  schema.graphql  (placeholder with minimal valid schema)
```

5.3. Create a minimal placeholder `schema.graphql`:
```graphql
type Query {
  health: Boolean!
}
```

5.4. Add codegen script to `package.json`:
```json
"scripts": {
  "codegen": "graphql-codegen --config codegen.ts",
  "codegen:check": "graphql-codegen --config codegen.ts --check"
}
```

5.5. Run codegen and verify TypeScript types are generated in `graphql/generated/`

### Task 6: Configure Role-Specific Tab Navigation (UX-DR10) [AC-5]

6.1. Create the route group directories:
```
app/
  (auth)/
    _layout.tsx
  (customer)/
    _layout.tsx       # Tab layout: Discover, Following, Profile
    discover.tsx
    following.tsx
    profile.tsx
  (vendor)/
    _layout.tsx       # Tab layout: Markets, Status, Profile
    markets.tsx
    status.tsx
    profile.tsx
  (manager)/
    _layout.tsx       # Tab layout: Dashboard, Vendors, Profile
    dashboard.tsx
    vendors.tsx
    profile.tsx
  _layout.tsx          # Root layout: auth gate + role-based routing
  +not-found.tsx
```

6.2. Configure each role's `_layout.tsx` with a `<Tabs>` navigator:

**Customer tabs:**
- Discover (icon: Search from lucide-react-native)
- Following (icon: Heart from lucide-react-native)
- Profile (icon: User from lucide-react-native)

**Vendor tabs:**
- Markets (icon: MapPin from lucide-react-native)
- Status (icon: Activity from lucide-react-native)
- Profile (icon: User from lucide-react-native)

**Manager tabs:**
- Dashboard (icon: LayoutDashboard from lucide-react-native)
- Vendors (icon: Store from lucide-react-native)
- Profile (icon: User from lucide-react-native)

6.3. Implement root `_layout.tsx` with placeholder auth gate logic:
- Wrap with `GluestackUIProvider` and `ApolloProvider`
- Add a placeholder role check that can be wired to real auth in Story 1.2
- Route to appropriate tab group based on role
- Default to `(auth)/` when unauthenticated

6.4. Add `accessibilityLabel` to all tab bar buttons (Agents.md accessibility requirements)

### Task 7: Configure CI Workflow [AC-6]

7.1. Create `.github/workflows/frontend-ci.yml`:
```yaml
name: Frontend CI

on:
  pull_request:
    paths:
      - 'markets-app/**'
  push:
    branches: [main]
    paths:
      - 'markets-app/**'

jobs:
  quality:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: markets-app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: markets-app/package-lock.json
      - run: npm ci
      - name: Type check
        run: npx tsc --noEmit
      - name: Lint
        run: npx eslint . --max-warnings 0
      - name: Format check
        run: npx prettier --check .
      - name: Unit + component tests
        run: npx jest --ci --coverage
      - name: Codegen check
        run: npm run codegen:check
```

7.2. Verify workflow validates: lint, test, type-check, format, codegen (per coding-standards.md Section 7)

### Task 8: Configure Jest + RNTL with Smoke Test [AC-7]

8.1. Install test dependencies:
```bash
npm install -D @testing-library/react-native @testing-library/jest-dom jest-expo @types/jest
```

8.2. Configure Jest in `package.json` or `jest.config.js`:
```javascript
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterSetup: ['@testing-library/jest-dom'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@gluestack-ui/.*|@gluestack-style/.*|nativewind|@legendapp/.*)',
  ],
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/jest.config.js',
    '!**/graphql/generated/**',
  ],
  coverageThreshold: {
    global: {
      branches: 75,
      lines: 80,
      statements: 80,
    },
  },
};
```

8.3. Create smoke test `app/__tests__/smoke.test.tsx`:
```typescript
import { render } from '@testing-library/react-native';
import RootLayout from '../_layout';

describe('App Smoke Test', () => {
  it('renders the root layout without crashing', () => {
    const { toJSON } = render(<RootLayout />);
    expect(toJSON()).toBeTruthy();
  });
});
```

8.4. Verify `npx jest` runs and the smoke test passes

### Task 9: Configure ESLint with Strict Rules [AC-6]

9.1. Install ESLint dependencies:
```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-config-expo
```

9.2. Create `.eslintrc.js` with the rules mandated by coding-standards.md Section 9:

```javascript
module.exports = {
  root: true,
  extends: [
    'expo',
    'plugin:@typescript-eslint/strict-type-checked',
    'plugin:react-hooks/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
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
  },
  ignorePatterns: ['graphql/generated/**', 'node_modules/**'],
};
```

9.3. Verify `npx eslint .` passes with zero warnings

### Task 10: Configure Prettier

10.1. Create `.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

10.2. Create `.prettierignore`:
```
node_modules/
graphql/generated/
coverage/
.expo/
```

10.3. Run `npx prettier --write .` to format existing files
10.4. Verify `npx prettier --check .` passes

### Task 11: Set Up Husky Pre-Commit Hooks

11.1. Install Husky and lint-staged:
```bash
npm install -D husky lint-staged
npx husky init
```

11.2. Configure lint-staged in `package.json` (per coding-standards.md Section 6):
```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix --max-warnings 0",
      "prettier --write"
    ],
    "*.{css,json,md}": [
      "prettier --write"
    ]
  }
}
```

11.3. Configure `.husky/pre-commit`:
```bash
npx lint-staged && npx tsc --noEmit
```

11.4. Verify the pre-commit hook runs on a test commit

### Task 12: Create Lib Stubs and Directory Structure

12.1. Create placeholder lib files referenced in architecture:
```
lib/
  apollo.ts           # Export placeholder Apollo Client setup
  firebase.ts         # Export placeholder config
  mmkv.ts             # Export placeholder MMKV utilities
  notifications.ts    # Export placeholder notification setup
```

12.2. Create `lib/apollo.ts` with initial Apollo Client configuration pattern:
```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8080/query',
});

const authLink = setContext(async (_, { headers }) => {
  // Token retrieval will be implemented in Story 1.2
  return {
    headers: {
      ...headers,
      // authorization: `Bearer ${token}`,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
```

12.3. Create remaining directories:
```
hooks/
constants/
components/market/
components/vendor/
components/checkin/
components/search/
components/activity/
components/freshness/
components/settings/
```

12.4. Add `.gitkeep` files to empty directories so they are tracked

### Task 13: Add Package Scripts

13.1. Add the following scripts to `package.json`:
```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "test": "jest",
    "test:coverage": "jest --coverage",
    "lint": "eslint . --max-warnings 0",
    "lint:fix": "eslint . --fix --max-warnings 0",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "typecheck": "tsc --noEmit",
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:check": "graphql-codegen --config codegen.ts --check",
    "validate": "npm run typecheck && npm run lint && npm run format:check && npm run test"
  }
}
```

## Dev Notes

### Exact Initialization Commands

```bash
# Step 1: Create the Expo app
npx create-expo-app@latest markets-app --template tabs

# Step 2: Enter the project
cd markets-app

# Step 3: Initialize Gluestack UI v3
npx gluestack-ui init

# Step 4: Add base Gluestack components
npx gluestack-ui add box text button heading input image

# Step 5: Install all dependencies (batch)
npx expo install @apollo/client graphql nativewind tailwindcss react-native-mmkv expo-secure-store expo-notifications expo-image @shopify/flash-list
npm install lucide-react-native react-native-svg
npm install -D @graphql-codegen/cli @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-react-apollo @testing-library/react-native @testing-library/jest-dom jest-expo @types/jest eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint-plugin-react eslint-plugin-react-hooks eslint-config-expo husky lint-staged prettier
```

### Version Context

- Expo SDK 55 (latest as of 2026-03-21)
- React Native 0.83
- New Architecture enabled by default
- Hermes JS engine
- Metro bundler

### NativeWind v4 Configuration Checklist

1. Install `nativewind` and `tailwindcss`
2. Create `tailwind.config.js` with `nativewind/preset`
3. Create `global.css` with `@tailwind` directives
4. Update `babel.config.js` with `jsxImportSource: 'nativewind'` and `'nativewind/babel'` preset
5. Import `global.css` in root layout
6. Add NativeWind type reference for `className` prop support
7. Map Gluestack design tokens from `config.ts` to `tailwind.config.js` theme extension

### Apollo Client Setup Pattern

- Use `createHttpLink` with env-var-based URI
- Use `setContext` for auth header injection (token from `expo-secure-store`)
- Use `InMemoryCache` with type policies to be defined per domain
- No additional state management libraries (no Redux, Zustand, MobX)
- Server state via Apollo cache, local UI state via React Context

### Design Token Structure (from Agents.md)

Tokens are CSS variables in `components/gluestack-ui-provider/config.ts`:

```typescript
export const config = {
  light: vars({
    '--color-primary-500': '...', // Main brand color
    '--color-background-0': '...', // Base background
  }),
  dark: vars({
    '--color-primary-500': '...',
    '--color-background-0': '...',
  }),
};
```

Mapped to Tailwind in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: { 500: 'var(--color-primary-500)' },
      background: { DEFAULT: 'var(--color-background-0)' },
    },
  },
}
```

**Rule:** Never hardcode hex colors. Always reference design tokens.

### Tab Navigation Configuration (UX-DR10)

Three role-based tab groups in Expo Router:

| Role | Route Group | Tab 1 | Tab 2 | Tab 3 |
|------|-------------|-------|-------|-------|
| Customer | `(customer)/` | Discover | Following | Profile |
| Vendor | `(vendor)/` | Markets | Status | Profile |
| Manager | `(manager)/` | Dashboard | Vendors | Profile |

Each `_layout.tsx` uses Expo Router's `<Tabs>` component. Icons from `lucide-react-native` only. All tab buttons must have `accessibilityLabel` props.

### ESLint Rules to Enforce (from coding-standards.md Section 9)

| Rule | Severity | Reason |
|------|----------|--------|
| `@typescript-eslint/no-floating-promises` | error | Forgotten `await` is the #1 async bug |
| `@typescript-eslint/strict-boolean-expressions` | error | Prevents truthy/falsy surprises |
| `@typescript-eslint/no-unused-vars` | error | Dead code removal |
| `@typescript-eslint/no-explicit-any` | error | Use proper types from codegen |
| `react-hooks/rules-of-hooks` | error | Enforce rules of hooks |
| `react-hooks/exhaustive-deps` | warn | Enforce exhaustive deps |

### TypeScript Strict Configuration

In `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true
  }
}
```

### Testing Infrastructure

- **Runner:** Jest via `jest-expo` preset
- **Component testing:** `@testing-library/react-native`
- **Apollo mocking:** `MockedProvider` from `@apollo/client/testing`
- **Coverage thresholds:** 80% lines, 75% branches (coding-standards.md)
- **Test file naming:** `*.test.tsx` co-located with source (Agents.md)
- **Excluded from coverage:** `graphql/generated/`, `node_modules/`, config files

### Scaffolding Completion Verification (from epic-1-test-strategy.md)

Story 1.1a is DONE when:
- [ ] Jest runs and finds test files
- [ ] A smoke test renders the root layout without crashing
- [ ] TypeScript compiles with zero errors (`tsc --noEmit`)
- [ ] ESLint passes with zero warnings
- [ ] GraphQL codegen generates types successfully
- [ ] Prettier format check passes
- [ ] Pre-commit hook runs successfully
- [ ] CI workflow file exists and is valid YAML

### Project Structure Notes

Final directory structure after scaffolding (from Agents.md and architecture.md):

```
markets-app/
  app/
    (auth)/
      _layout.tsx
    (customer)/
      _layout.tsx
      discover.tsx
      following.tsx
      profile.tsx
    (vendor)/
      _layout.tsx
      markets.tsx
      status.tsx
      profile.tsx
    (manager)/
      _layout.tsx
      dashboard.tsx
      vendors.tsx
      profile.tsx
    _layout.tsx              # Root layout: providers + auth gate + role routing
    +not-found.tsx
    __tests__/
      smoke.test.tsx
  components/
    gluestack-ui-provider/   # Theme provider + config.ts (design tokens)
    ui/                      # Gluestack UI components (managed by CLI)
    market/                  # Market domain components (empty, future)
    vendor/                  # Vendor domain components (empty, future)
    checkin/                 # Check-in flow components (empty, future)
    search/                  # Search/discovery components (empty, future)
    activity/                # Activity feed components (empty, future)
    freshness/               # Freshness timestamp components (empty, future)
    settings/                # Settings components (empty, future)
  lib/
    apollo.ts                # Apollo Client configuration
    firebase.ts              # Firebase Auth + Realtime config (placeholder)
    mmkv.ts                  # MMKV offline queue utilities (placeholder)
    notifications.ts         # Push notification setup (placeholder)
  graphql/
    queries/                 # .graphql query files (empty, future)
    mutations/               # .graphql mutation files (empty, future)
    generated/               # @graphql-codegen output
    schema.graphql           # Placeholder schema
  hooks/                     # Custom React hooks (empty, future)
  constants/                 # Theme, config values (empty, future)
  assets/                    # Images, fonts
  .eslintrc.js
  .prettierrc
  .prettierignore
  babel.config.js
  codegen.ts
  global.css
  jest.config.js
  tailwind.config.js
  tsconfig.json
  package.json
```

### Anti-Patterns to Avoid (from Agents.md)

- No Redux, Zustand, or MobX
- No `any` type in TypeScript
- No inline `style` objects when NativeWind classes work
- No hardcoded hex colors
- No raw `<View>`, `<Text>` from react-native when Gluestack equivalents exist
- No new icon libraries beyond `lucide-react-native`
- No barrel files (`index.ts` re-exports)

### References

| Document | Section | Relevance |
|----------|---------|-----------|
| `_bmad-output/planning-artifacts/epics.md` | Lines 207-224 | Story definition and acceptance criteria |
| `_bmad-output/planning-artifacts/architecture.md` | Lines 87-124 (Frontend Starter) | Expo template, dependency list, version context |
| `_bmad-output/planning-artifacts/architecture.md` | Lines 322-358 (Frontend Architecture) | State management, navigation, project structure |
| `_bmad-output/planning-artifacts/coding-standards.md` | Section 1 (TDD) | Test frameworks, coverage thresholds, mocking strategy |
| `_bmad-output/planning-artifacts/coding-standards.md` | Section 6 (Pre-Commit) | Husky, lint-staged configuration |
| `_bmad-output/planning-artifacts/coding-standards.md` | Section 7 (CI) | Frontend CI gate commands |
| `_bmad-output/planning-artifacts/coding-standards.md` | Section 9 (React Native/TS) | ESLint rules, TypeScript config, component patterns |
| `Agents.md` | Component Organization | Directory structure, Gluestack CLI usage |
| `Agents.md` | Styling Rules | NativeWind approach, design token structure, tailwind config |
| `Agents.md` | Naming Conventions | File naming patterns |
| `Agents.md` | Accessibility Requirements | accessibilityLabel on all interactive elements |
| `Agents.md` | Anti-Patterns | Forbidden libraries and practices |
| `_bmad-output/test-artifacts/epic-1-test-strategy.md` | Section 2 | React Native test infrastructure, scaffolding done criteria |

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### Change Log
| Change | Date | Reason |
|--------|------|--------|

### File List
