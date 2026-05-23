# Copilot Instructions — markets

> **Note:** This file applies to the `petry-projects/markets` repository only. Org-wide rules are in [`petry-projects/.github/copilot-instructions.md`](https://github.com/petry-projects/.github/blob/main/.github/copilot-instructions.md). This file covers only what is specific to markets.

## About

Markets is a real-time coordination platform for local farmers markets — a mobile-first (iOS/Android/web) app with three user roles (Customer, Vendor, Market Manager), built with Expo + Go and using Firebase for auth and real-time updates.

## Tech Stack

- **Runtime:** Node.js (mobile/frontend) · Go on GCP Cloud Run (backend)
- **Framework:** React Native / Expo SDK 55 · TypeScript · Expo Router (file-based) · Gluestack UI v3 · NativeWind v4
- **Backend:** Go · gqlgen (GraphQL) · Cloud SQL PostgreSQL · Firebase Auth · Firebase Realtime Database
- **Testing:** Jest (jest-expo preset) · `go test ./...`
- **Linting:** ESLint + Prettier (mobile) · `golangci-lint` (Go)
- **Key libraries:** Apollo Client 4.x · `@graphql-codegen` · MMKV (offline queue) · `expo-notifications` (FCM) · `expo-image`

## Project Structure

```text
app/
  (auth)/              # Login, role selection
  (customer)/          # Customer tabs: discover, following, profile
  (vendor)/            # Vendor tabs: markets, status, profile
  (manager)/           # Manager tabs: dashboard, vendors, profile
  _layout.tsx          # Root layout: auth gate + role-based routing
components/
  gluestack-ui-provider/  # Gluestack theme provider + config.ts (design tokens)
  ui/                     # Gluestack UI base components (added via CLI — do not hand-edit)
  market/   vendor/   checkin/   search/   activity/   freshness/   settings/
hooks/                 # Custom hooks (use prefix, e.g. useVendorStatus.ts)
lib/
  apollo.ts            # Apollo Client configuration
  firebase.ts          # Firebase Auth + Realtime config
  mmkv.ts              # MMKV offline queue utilities
graphql/
  queries/   mutations/   # .graphql source files
  generated/               # @graphql-codegen output — never edit manually
constants/             # Theme tokens, config values
assets/                # Images, fonts
```

## Local Dev Commands

- Install:      `npm install`
- Mobile dev:   `npx expo start`
- Test:         `npm test`
- Lint:         `npm run lint`
- Typecheck:    `npx tsc --noEmit`
- Codegen:      `npm run codegen` (regenerates `graphql/generated/`)

## Required Environment Variables

- `FIREBASE_API_KEY`: Firebase web API key
- `FIREBASE_AUTH_DOMAIN`: Firebase auth domain
- `FIREBASE_PROJECT_ID`: GCP project ID
- `FIREBASE_REALTIME_DB_URL`: Firebase Realtime Database URL
- `GRAPHQL_URL`: GraphQL API endpoint (GCP Cloud Run URL)

## Testing Framework

- Mobile runner: Jest with jest-expo preset
- Backend runner: `go test ./...` with `golangci-lint run`
- Coverage thresholds: see `_bmad-output/planning-artifacts/coding-standards.md`
- Mutation testing: not configured

## Repo-Specific Overrides

**Figma-driven UI development:** Use Figma MCP (file key `LMawgHcglco0TG32UAQUhE`) for all UI work — run `get_design_context` before coding, validate against `get_screenshot` after. Translate Figma Tailwind/HTML output to Gluestack UI v3 + NativeWind equivalents (e.g. `<div>` → `<Box>`, `<button>` → `<Button>+<ButtonText>`).

**Never hardcode colors** — always use design tokens from `components/gluestack-ui-provider/config.ts` referenced via `tailwind.config.js`.

**Generated code** — never edit `graphql/generated/` directly; run `npm run codegen` to regenerate.

**Role-based routing** — customer screens in `app/(customer)/`, vendor in `app/(vendor)/`, manager in `app/(manager)/`.

## Org Standards

See [petry-projects/.github — AGENTS.md](https://github.com/petry-projects/.github/blob/main/AGENTS.md) for org-wide development standards.

**Language-specific instructions** (applied automatically by Copilot when you open matching file types):

- [TypeScript / TSX](./instructions/typescript.instructions.md) — strict config, branded types, DDD/CQRS patterns, React Native, pino logging
- [JavaScript](./instructions/javascript.instructions.md) — style, JSDoc type annotations, error handling
- [Go](./instructions/go.instructions.md) — naming, gofmt, slog logging, error wrapping, concurrency, testing
- [Shell](./instructions/shell.instructions.md) — safety flags, ShellCheck, quoting, error handling
