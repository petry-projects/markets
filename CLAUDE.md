# Markets — Design System & Figma Integration Rules

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

```
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

## Figma MCP Integration Rules

These rules define how to translate Figma inputs into code for this project and must be followed for every Figma-driven change.

### Figma File Reference

- **File key:** `LMawgHcglco0TG32UAQUhE`
- **File URL:** https://www.figma.com/design/LMawgHcglco0TG32UAQUhE/Markets

### Required Flow (do not skip)

1. Run `get_design_context` first to fetch the structured representation for the exact node(s)
2. If the response is too large or truncated, run `get_metadata` to get the high-level node map, then re-fetch only the required node(s) with `get_design_context`
3. Run `get_screenshot` for a visual reference of the node variant being implemented
4. Only after you have both `get_design_context` and `get_screenshot`, download any assets needed and start implementation
5. Translate the output (usually React + Tailwind) into this project's conventions: Gluestack UI v3 components + NativeWind styling + Expo Router navigation
6. Validate against Figma for 1:1 look and behavior before marking complete

### Implementation Rules

- Treat the Figma MCP output (React + Tailwind) as a representation of design and behavior, not as final code style
- IMPORTANT: Replace raw HTML elements with Gluestack UI v3 equivalents:
  - `<div>` → `<Box>` or `<VStack>`/`<HStack>`
  - `<button>` → `<Button>` + `<ButtonText>`
  - `<input>` → `<Input>` + `<InputField>`
  - `<text>` / `<p>` / `<span>` → `<Text>` or `<Heading>`
  - `<img>` → `<Image>` (from expo-image)
  - Lists → `<FlashList>` for performance
- Map Figma Tailwind classes to NativeWind-compatible classes (NativeWind supports most Tailwind utilities)
- IMPORTANT: Map Figma colors to design tokens in `config.ts`, not raw hex values
- Reuse existing components from `components/ui/` and `components/{domain}/` instead of duplicating
- Use Expo Router for navigation — no `<a>` tags or manual routing
- Respect role-based routing: customer screens in `(customer)/`, vendor in `(vendor)/`, manager in `(manager)/`
- Strive for 1:1 visual parity with the Figma design
- Validate the final UI against the Figma screenshot for both look and behavior

## Asset Handling

- The Figma MCP server provides an assets endpoint which can serve image and SVG assets
- IMPORTANT: If the Figma MCP server returns a localhost source for an image or SVG, use that source directly
- IMPORTANT: DO NOT import/add new icon packages — all assets should be in the Figma payload or use Gluestack's built-in icon set via `lucide-react-native`
- Store downloaded assets in `assets/` directory at project root
- Use `expo-image` (`<Image>`) for all image rendering — not React Native's built-in `<Image>`

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

- IMPORTANT: All development MUST follow test-driven development (TDD) practices
- Write failing tests BEFORE writing implementation code (Red → Green → Refactor)
- **Go backend:** Write Go test files (`_test.go`) co-located with source files before implementing resolvers, middleware, or services. Use `go test ./...` to verify.
- **React Native frontend:** Write tests using Jest + React Native Testing Library before implementing components and hooks. Test files co-located as `*.test.tsx` or in `__tests__/` directories.
- **GraphQL resolvers:** Write integration tests (tagged `//go:build integration`) that test the full resolver → database → response path
- **Acceptance criteria drive tests:** Each story's Given/When/Then acceptance criteria should map directly to test cases
- Every PR must include tests that cover the new or changed functionality
- Do not merge code without passing tests

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
