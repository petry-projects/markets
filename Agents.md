# Markets — Project Coding Standards

> This file extends the **[petry-projects organization AGENTS.md](https://github.com/petry-projects/.github/blob/main/AGENTS.md)** with Markets-specific conventions. The org standards define TDD, SOLID, CLEAN, DRY, DDD, KISS, YAGNI, pre-commit checks, CI gates, BMAD workflows, and multi-agent isolation. This file does not restate those — it specifies how they apply to this project's Go + React Native/Expo stack. If a rule here conflicts with the org AGENTS.md, this file takes precedence.
>
> For detailed Markets-specific application of each principle (bounded contexts, aggregate roots, repository interfaces, domain events, typed IDs, dependency direction, test-by-layer guidance, coverage thresholds, and CI commands), see `_bmad-output/planning-artifacts/coding-standards.md`.

## Project Overview

**markets** is a real-time coordination platform for local farmers markets. Mobile-first (iOS/Android) with web via React Native for Web. Three user roles: Customer, Vendor, Market Manager.

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React Native / Expo SDK 55, TypeScript, Expo Router (file-based) |
| UI Components | Gluestack UI v3 (`@gluestack-ui/nativewind`) |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| GraphQL Client | Apollo Client 4.x with `@graphql-codegen` |
| State | Apollo Client cache (server state) + React Context (local UI state) |
| Offline | MMKV for queued actions, Apollo cache for server data |
| Backend | Go on GCP Cloud Run, gqlgen (GraphQL), Cloud SQL PostgreSQL |
| Auth | Firebase Auth (Google + Apple Sign-In only), JWT |
| Real-time | Firebase Realtime Database |
| Push | FCM via expo-notifications |

## Component Organization

### Gluestack UI v3 Components

- IMPORTANT: Always use Gluestack UI v3 components from `@gluestack-ui/nativewind` as the base component library
- Add new Gluestack components via CLI: `npx gluestack-ui add [component-name]`
- Gluestack provider is configured in `components/gluestack-ui-provider/` with `config.ts` for design tokens
- Use `tva()` from `@gluestack-ui/nativewind-utils` for component variant styling
- Use `VariantProps` for type-safe variant extraction
- Use `withStates()` HOC for native state-based styling (hover, active, focus)

### Project Component Structure

```text
markets-app/
├── app/
│   ├── (auth)/              # Login, role selection
│   ├── (customer)/          # Customer tabs: discover, following, profile
│   ├── (vendor)/            # Vendor tabs: markets, status, profile
│   ├── (manager)/           # Manager tabs: dashboard, vendors, profile
│   ├── _layout.tsx          # Root layout: auth gate + role-based routing
│   └── +not-found.tsx
├── components/
│   ├── gluestack-ui-provider/  # Gluestack theme provider + config.ts
│   ├── ui/                     # Gluestack UI components (added via CLI)
│   ├── market/                 # Market-specific composed components
│   ├── vendor/                 # Vendor-specific composed components
│   ├── checkin/                # Check-in flow components
│   ├── search/                 # Search and discovery components
│   ├── activity/               # Activity feed components
│   ├── freshness/              # Freshness timestamp components
│   └── settings/               # Settings and preferences components
├── hooks/                   # Custom React hooks
├── lib/
│   ├── apollo.ts            # Apollo Client configuration
│   ├── firebase.ts          # Firebase Auth + Realtime config
│   ├── mmkv.ts              # MMKV offline queue utilities
│   └── notifications.ts    # Push notification setup
├── graphql/
│   ├── queries/             # .graphql query files
│   ├── mutations/           # .graphql mutation files
│   └── generated/           # @graphql-codegen output (TS types + hooks)
├── constants/               # Theme, config values
└── assets/                  # Images, fonts
```

- IMPORTANT: Place Gluestack UI base components in `components/ui/` (managed by Gluestack CLI)
- Place composed/domain-specific components in `components/{domain}/` (e.g., `components/market/`, `components/vendor/`)
- Route screens go in `app/` directory following Expo Router file-based routing
- Custom hooks go in `hooks/` with `use` prefix (e.g., `useVendorStatus.ts`)

## Styling Rules

### NativeWind + Gluestack Approach

- IMPORTANT: Use NativeWind v4 Tailwind CSS utility classes for all styling — no inline `style` objects unless platform-specific
- Design tokens are defined in `components/gluestack-ui-provider/config.ts` as CSS variables
- Reference tokens in `tailwind.config.js` via `var(--token-name)` to keep Tailwind and Gluestack in sync
- IMPORTANT: Never hardcode colors — always use Gluestack design tokens or Tailwind theme tokens
- Spacing uses Tailwind's default 4px scale (e.g., `p-4` = 16px)
- Typography follows Gluestack's type scale; extend in `tailwind.config.js` if needed
- Use `className` prop for styling Gluestack components — they support NativeWind out of the box

### Design Token Structure

Tokens are defined as CSS variables in `config.ts`:
```typescript
export const config = {
  light: vars({
    '--color-primary-500': '...', // Main brand color
    '--color-background-0': '...', // Base background
    // etc.
  }),
  dark: vars({
    '--color-primary-500': '...',
    '--color-background-0': '...',
  }),
};
```

Map tokens to Tailwind in `tailwind.config.js`:
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

### Responsive Design

- Mobile-first approach (React Native is the primary target)
- Use NativeWind responsive modifiers (`sm:`, `md:`, `lg:`) for React Native for Web breakpoints
- Touch targets: minimum 44x44pt for primary actions per platform guidelines
- Outdoor-use readability: ensure sufficient contrast and font sizing for bright-light conditions
- IMPORTANT: Filter chip rows must always use `flex-wrap: wrap` — never horizontal scroll. Chips that overflow the width must wrap to the next line so all options are visible without scrolling.

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Components | `PascalCase` file + export | `VendorCard.tsx`, `MarketList.tsx` |
| Hooks | `camelCase` with `use` prefix | `useVendorStatus.ts`, `useMarketSearch.ts` |
| Utilities/lib | `camelCase` files | `apollo.ts`, `firebase.ts` |
| GraphQL files | `camelCase.graphql` | `getMarket.graphql`, `checkIn.graphql` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_URL` |

## Accessibility Requirements

- IMPORTANT: All interactive elements must have accessible labels (use `accessibilityLabel` or `aria-label`)
- Color contrast must meet WCAG 2.1 AA standards
- Critical action states and errors must be conveyed through non-color-dependent cues
- All critical flows must be operable with VoiceOver (iOS) and TalkBack (Android)
- Use Gluestack's built-in accessibility props — they are pre-configured for a11y compliance

## Mobile UX Constraints

- One-tap vendor actions (check-in/status) must be reachable without deep navigation
- Skeleton screens for initial loads (not spinners)
- Optimistic UI for mutations — immediate feedback, error state only on failure
- Pull-to-refresh on list screens via Apollo's `refetch`
- User-facing error messages: short, action-oriented ("Check-in failed. Tap to retry.")
- No raw error messages shown to users

## Test-Driven Development

TDD rules are defined in the [org AGENTS.md](https://github.com/petry-projects/.github/blob/main/AGENTS.md). Markets-specific test framework configuration, mocking strategy, coverage thresholds, and per-layer test guidance are in `_bmad-output/planning-artifacts/coding-standards.md`.

- **Go backend:** `*_test.go` co-located with source; `//go:build integration` for integration tests
- **React Native frontend:** `*.test.tsx` co-located or `__tests__/`; Jest + React Native Testing Library
- **GraphQL resolvers:** Integration tests for the full resolver → database → response path
- **Acceptance criteria drive tests:** Each story's Given/When/Then maps directly to test cases

## Event-Driven Architecture

- **Audit logging** is handled by PostgreSQL triggers on all domain tables — do NOT manually insert audit_log rows from Go code
- **Domain events** are published by resolvers after successful writes via `internal/events/` package
- Event handlers in `internal/realtime/` and `internal/notify/` subscribe to domain events and dispatch to Firebase Realtime and FCM respectively
- Go auth middleware sets PostgreSQL session variables (`SET LOCAL app.actor_id`, `SET LOCAL app.actor_role`) per request so triggers can capture actor identity
- IMPORTANT: Every new domain table migration MUST attach the reusable audit trigger function
- IMPORTANT: Every mutation resolver MUST publish a domain event after successful write — this is what triggers real-time updates and push notifications

## Anti-Patterns (Explicitly Forbidden)

- Redux, Zustand, or MobX for state management (use Apollo Client cache + React Context)
- `any` type in TypeScript (use proper types from @graphql-codegen)
- Inline `style` objects when NativeWind classes work
- Hardcoded color hex values — always use design tokens
- Creating custom HTTP endpoints alongside GraphQL (all data access through GraphQL)
- Adding new icon libraries — use `lucide-react-native` or Figma-provided assets
- Raw `<View>`, `<Text>` from react-native when Gluestack equivalents exist
- Manually inserting audit_log rows from application code — PostgreSQL triggers handle this
- Publishing events without a preceding successful database write
