---
stepsCompleted: [1, 2, 3, 4, 5, 6]
inputDocuments:
  - "/home/donpetry/markets/_bmad-output/planning-artifacts/prd.md"
  - "/home/donpetry/markets/_bmad-output/planning-artifacts/product-brief-markets-2026-03-16.md"
  - "/home/donpetry/markets/_bmad-output/planning-artifacts/research/technical-react-graphql-supabase-research-2026-03-15.md"
  - "/home/donpetry/markets/_bmad-output/planning-artifacts/research/feature-priority-matrix-market-app-2026-03-15.md"
  - "/home/donpetry/markets/_bmad-output/planning-artifacts/research/market-farmer-and-art-market-app-research-2026-03-15.md"
workflowType: 'architecture'
project_name: 'markets'
user_name: 'Human'
date: '2026-03-21'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

52 functional requirements across 7 categories:

| Category | FRs | Architectural Implication |
|---|---|---|
| Identity, Roles, Access Control | FR1-FR7 (7) | Three-role auth model with market-scoped permissions; multi-manager shared state |
| Market and Vendor Administration | FR8-FR13 (6) | CRUD for market profiles, vendor profiles, product catalogs, roster management |
| Market-Day Operations | FR14-FR20d (11) | Check-in/checkout lifecycle, auto-checkout scheduling, manager-on-behalf actions with attribution, conflict warnings |
| Discovery, Follow, Engagement | FR21-FR28 (8) | Full-text + radius search, follow relationships, alternative/fallback suggestions |
| Notifications and Activity | FR29-FR32c (6) | Push via FCM, per-role activity feeds, follower notification on check-in/checkout |
| Trust, Integrity, Audit | FR33-FR39 (7) | Freshness timestamps, append-only audit log, recovery workflows |
| Account Control, Privacy | FR40-FR44 (7) | Soft-delete only, 2-manager minimum, notification preferences, role-based visibility |

**Non-Functional Requirements:**

25 NFRs across 6 domains:

| Domain | NFRs | Key Constraints |
|---|---|---|
| Performance | NFR1-4 | 10s vendor actions, 60s propagation, 2s search, 3s dashboard |
| Reliability | NFR5-8 | 99.5% monthly / 99.9% Saturday 6am-2pm, 50 concurrent vendor/manager + 200 customer sessions in 1-hour peak |
| Security | NFR9-14 | TLS, encryption at rest, Go resolver authorization, append-only audit, no payment credentials |
| Scalability | NFR15-17 | 10x from pilot baseline (5 markets, 40 vendors, 250 customers), horizontal scaling for notifications/realtime |
| Accessibility | NFR18-20 | WCAG 2.1 AA intent for critical flows, VoiceOver/TalkBack |
| Observability | NFR21-25 | Full audit logging, 12-month retention, queryable, recovery support, delivery monitoring |

**Scale & Complexity:**

- Primary domain: Full-stack mobile + backend API (React Native/Expo + Go/GCP)
- Complexity level: Medium-High
- Estimated architectural components: 8-10 (mobile app, web app via RN Web, Go API service, GraphQL schema, Cloud SQL database, Firebase Auth, Firebase Realtime, FCM push, audit subsystem, scheduled jobs)

### Technical Constraints & Dependencies

| Constraint | Source | Impact |
|---|---|---|
| React Native/Expo managed workflow | Stack decision | Limits native module usage to Expo-supported modules |
| React Native for Web | Stack decision | Shared codebase must handle platform divergence (push, navigation, secure storage) |
| Go on Cloud Run | Stack decision | Stateless container; no in-memory state between requests; cold start considerations |
| Cloud SQL PostgreSQL | Stack decision | Connection pooling required (Cloud SQL Auth Proxy); managed HA and backups |
| Firebase Auth JWT | Stack decision | Go middleware validates Firebase JWT; custom claims for role/market-scope |
| Firebase Realtime | Stack decision | Real-time sync for status propagation; client SDK in React Native |
| 10-second vendor action SLO | NFR1 | End-to-end latency budget: RN UI + network + Go resolver + Cloud SQL + Firebase Realtime fanout |
| 60-second propagation SLO | NFR2 | Status changes must reach all subscribed clients within 60s |
| Outdoor/low-signal environment | Domain | Optimistic UI mandatory; background sync; MMKV local cache |
| Saturday 6-10am peak | NFR8 | Cloud Run autoscaling must handle burst; Cloud SQL connection pool sized for peak |
| Soft-delete everywhere | Edge case decisions | All queries must exclude soft-deleted records; audit references must survive deletion |
| Append-only audit | NFR12, NFR21 | Go service enforces insert-only on audit table; no UPDATE/DELETE permitted |

### Cross-Cutting Concerns Identified

| Concern | Scope | Implementation Pattern |
|---|---|---|
| **Authorization** | Every GraphQL resolver | Go middleware extracts Firebase JWT → resolves role + market-scope → resolver-level enforcement |
| **Audit logging** | Every write operation | PostgreSQL triggers on domain tables automatically insert audit_log rows — guaranteed, cannot be bypassed by application code |
| **Domain event bus** | Every write operation | Go in-process event bus: resolvers publish domain events after successful writes → event handlers dispatch to Firebase Realtime, FCM, and any future consumers |
| **Real-time propagation** | Status changes, check-ins, exceptions | Domain event handler writes to Firebase Realtime → clients receive update |
| **Push notification dispatch** | Check-in, checkout, exception, broadcast | Domain event handler dispatches FCM send to follower device tokens |
| **Soft-delete filtering** | Every read query | SQL queries and GraphQL resolvers must include `WHERE deleted_at IS NULL` |
| **Optimistic UI** | Vendor check-in, status updates | React Native Apollo Client optimisticResponse + MMKV queue for offline retry |
| **Freshness timestamps** | All customer-facing status | Every status record includes `updated_at`; UI computes and displays relative time |
| **Market-scope isolation** | Manager operations | Managers can only read/write data for markets they are assigned to |

## Starter Template Evaluation

### Primary Technology Domains

This project has two codebases:
1. **Frontend (React Native/Expo)** — Mobile app (iOS, Android) + Web via React Native for Web
2. **Backend (Go)** — GraphQL API service on GCP Cloud Run

### Frontend Starter: Expo with Tabs Template

**Initialization Command:**

```bash
npx create-expo-app@latest markets-app --template tabs
```

**Version context:** Expo SDK 55 (latest as of 2026-03-21), React Native 0.83, New Architecture enabled by default.

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** TypeScript, Hermes JS engine
- **Navigation:** Expo Router (file-based routing with tab layout)
- **Build Tooling:** Metro bundler, EAS Build for cloud builds
- **Project Structure:** File-based routing in `app/` directory
- **Development Experience:** Expo Go for rapid development, hot reload, TypeScript strict mode

**Additional Libraries to Install:**

| Library | Purpose | Version |
|---|---|---|
| Apollo Client 4.x | GraphQL client, normalized cache, optimistic UI | Latest stable |
| @graphql-codegen | TypeScript type generation from GraphQL schema | Latest stable |
| NativeWind v4 (stable) | Tailwind CSS styling for React Native | 4.x stable (evaluate v5 pre-release) |
| expo-notifications | Push notification handling (FCM/APNs) | Bundled with Expo SDK |
| react-native-mmkv | Fast key-value storage for offline cache | Latest stable |
| expo-secure-store | Secure token storage (Keychain/Keystore) | Bundled with Expo SDK |
| react-native-web | Web target from React Native codebase | Bundled with Expo |

### Backend Starter: gqlgen Official Scaffold

**Initialization Commands:**

```bash
mkdir markets-api && cd markets-api
go mod init github.com/petry-projects/markets-api
go get github.com/99designs/gqlgen@latest
go run github.com/99designs/gqlgen init
```

**Version context:** gqlgen latest (2026-03-09 release), Go 1.26+.

**Architectural Decisions Provided by Starter:**

- **Language & Runtime:** Go 1.26+
- **GraphQL:** Schema-first with code generation (gqlgen)
- **Project Structure:** `graph/` directory with schema, resolvers, generated code
- **Development Experience:** `go generate ./...` to regenerate from schema changes

**Additional Libraries to Install:**

| Library | Purpose |
|---|---|
| firebase-admin-go | Firebase Auth JWT validation, FCM push dispatch |
| pgx v5 | PostgreSQL driver for Cloud SQL |
| golang-migrate | Database migration management |
| chi or gorilla/mux | HTTP router (gqlgen handler mounting) |
| zap or slog | Structured logging |
| viper | Configuration management |

**Production Project Structure:**

```
markets-api/
├── cmd/api/main.go              # Entry point, server setup
├── internal/
│   ├── auth/                    # Firebase JWT middleware, role resolution
│   ├── graph/                   # gqlgen: schema, resolvers, generated code
│   │   ├── schema/              # .graphqls schema files (split by domain)
│   │   ├── model/               # Generated + custom Go models
│   │   ├── resolver.go          # Root resolver with dependencies
│   │   └── *.resolvers.go       # Generated resolver stubs (per schema file)
│   ├── audit/                   # Audit logging (PostgreSQL trigger definitions + query helpers)
│   ├── events/                  # Domain event bus: publish/subscribe, event types, handler registry
│   ├── notify/                  # FCM push notification client (event handler)
│   ├── realtime/                # Firebase Realtime Database write client (event handler)
│   ├── db/                      # Cloud SQL connection pool, query helpers
│   └── middleware/              # HTTP middleware chain (auth, logging, CORS)
├── migrations/                  # SQL migration files
├── Dockerfile                   # Cloud Run container
├── gqlgen.yml                   # gqlgen configuration
├── go.mod / go.sum
└── .github/workflows/           # CI/CD pipeline
```

### Rationale for Selections

**Expo tabs template** chosen because:
- Provides Expo Router with file-based navigation matching the app's role-based tab structure
- Minimal opinions on styling, state management, or API layer — lets us add our choices
- Official template, maintained by Expo team, always compatible with latest SDK

**gqlgen init** chosen over full-stack templates because:
- Official scaffold ensures compatibility with latest gqlgen
- Avoids unwanted ORM opinions (GORM) — we use pgx for direct PostgreSQL control
- Clean starting point for adding Firebase Auth, Cloud SQL, and audit middleware
- Schema-first approach aligns with GraphQL best practices for mobile API consumers

**Note:** Project initialization using these commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Social-only authentication (Google + Apple + Facebook Sign-In) via Firebase Auth
- Role stored as Firebase custom claim; market-scope resolved from Cloud SQL at runtime
- GraphQL schema split by domain (6 schema files)
- Firebase Realtime for status propagation (not GraphQL subscriptions)
- Apollo Client as sole server-state manager; React Context for local UI state
- Three-environment strategy (dev/staging/production)

**Important Decisions (Shape Architecture):**
- Optimistic UI with MMKV offline queue for vendor actions
- Structured error codes in GraphQL extensions
- Cloud Scheduler for auto-checkout jobs
- Cloud Run min-instances=1 to avoid Saturday cold starts

**Deferred Decisions (Post-MVP):**
- Server-side caching (Redis/Memorystore) — not needed at pilot scale
- Application-level rate limiting — log for future enhancement
- Advanced offline-first database — MVP handles low-signal, not full offline
- GraphQL persisted queries — optimization for post-MVP

### Data Architecture

| Decision | Choice | Rationale |
|---|---|---|
| **Database** | Cloud SQL PostgreSQL 15+ | GCP-native, managed HA, backups, connection pooling via Auth Proxy |
| **Driver** | pgx v5 | Direct PostgreSQL driver; no ORM overhead; full SQL control |
| **Migrations** | golang-migrate | Simple, file-based SQL migrations; widely used with Go |
| **Data modeling** | Domain-driven relational tables mapping to GraphQL types | Market, Vendor, Customer, MarketDay, CheckIn, Product, Follow, AuditEntry as core tables. Junction tables for vendor↔market roster and manager↔market assignment |
| **Soft-delete** | `deleted_at TIMESTAMPTZ NULL` on all user-facing tables | All queries filter `WHERE deleted_at IS NULL`; audit references survive deletion |
| **Validation** | Go resolver validation (go-playground/validator) + DB constraints | Validate in application layer; DB constraints (NOT NULL, UNIQUE, FK, CHECK) as safety net |
| **Client-side cache** | Apollo Client normalized cache (in-memory) | Primary data store for all server state on mobile |
| **Offline persistence** | MMKV for queued actions and last-known status | Fast KV store; not a full query cache; stores retry queue and critical offline data |
| **Server-side cache** | None for MVP | Cloud SQL query performance sufficient at pilot scale; add Redis/Memorystore post-MVP if needed |

**Core Domain Tables:**

```
markets              # Market profile, location, hours, schedule
market_managers      # Manager↔market assignment (junction, market-scoped)
vendors              # Vendor profile, contact
vendor_products      # Product catalog per vendor
market_vendors       # Vendor↔market roster (junction, with approval status)
check_ins            # Market-day vendor check-in/checkout records
vendor_statuses      # Exception statuses (running late, sold out, not attending)
customers            # Customer profile
follows              # Customer→vendor and customer→market follow relationships
notification_prefs   # Per-user, per-type notification preferences
device_tokens        # FCM device tokens per user
audit_log            # Append-only audit entries (immutable)
```

### Authentication & Security

| Decision | Choice | Rationale |
|---|---|---|
| **Auth provider** | Firebase Authentication | GCP-native; social providers; JWT-based |
| **Auth methods** | Google Sign-In + Apple Sign-In + Facebook Login | No passwords. Simplifies auth flow, eliminates password reset/credential storage. Apple Sign-In required for iOS App Store compliance when offering social login. Facebook Login broadens sign-in options across all platforms (FR45) |
| **Role storage** | Firebase custom claim (`role: "customer" \| "vendor" \| "manager"`) | Set via Firebase Admin SDK in Go when role is assigned; read from JWT in middleware |
| **Market-scope** | Resolved from Cloud SQL at runtime (not in JWT) | Market assignments are dynamic and potentially numerous; querying DB avoids stale JWT claims |
| **Auth middleware** | Go HTTP middleware validates Firebase JWT on every request | Extracts user ID + role from token; attaches to request context for resolver access |
| **Token storage (mobile)** | expo-secure-store (iOS Keychain / Android Keystore) | Secure, encrypted, platform-native token storage |
| **API security** | Cloud Armor for DDoS at edge; CORS restricted to web domain | Mobile apps don't use CORS; web origin locked down |
| **Rate limiting** | Deferred to post-MVP | Log mutation frequency for analysis; implement limits when usage patterns are known |

**Auth Flow:**

```
1. User taps "Sign in with Google", "Sign in with Apple", or "Sign in with Facebook"
2. Firebase Auth SDK handles OAuth flow → returns Firebase JWT
3. JWT stored in expo-secure-store
4. Apollo Client attaches JWT as Authorization: Bearer header on all requests
5. Go middleware validates JWT via Firebase Admin SDK
6. Middleware extracts uid + role custom claim → attaches to context
7. Resolvers read role + uid from context; query market_managers table for scope
8. On first login: Go creates user record in Cloud SQL, sets role custom claim
```

### API & Communication Patterns

| Decision | Choice | Rationale |
|---|---|---|
| **API protocol** | GraphQL via gqlgen (Go) | Schema-first; code-generated resolvers; typed contract for mobile client |
| **GraphQL client** | Apollo Client 4.x | Normalized cache, optimistic UI, subscription support |
| **Schema organization** | Split by domain (6 files) | `auth.graphqls`, `market.graphqls`, `vendor.graphqls`, `customer.graphqls`, `notification.graphqls`, `audit.graphqls` |
| **Type generation** | @graphql-codegen for TypeScript types | Auto-generates TS types + Apollo hooks from schema |
| **Error handling** | Error codes in GraphQL extensions | `UNAUTHENTICATED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `INTERNAL` |
| **Real-time pattern** | Go writes → Firebase Realtime Database → RN client subscriptions | Not GraphQL subscriptions; Firebase handles scaling and reconnection |
| **Real-time paths** | `/markets/{marketId}/vendors/{vendorId}/status` | Clients subscribe to market-level or vendor-level paths based on follows |

**Real-Time Data Flow:**

```
1. Vendor taps "Check In" in app
2. Apollo Client sends GraphQL mutation with optimisticResponse
3. Go resolver: validates, writes to Cloud SQL
4. PostgreSQL trigger automatically inserts audit_log row (guaranteed CDC)
5. Go resolver publishes domain event: VendorCheckedIn{vendorId, marketId, timestamp}
6. Event handler: writes status to Firebase Realtime → propagates to subscribed clients (<60s SLO)
7. Event handler: dispatches FCM push notification to vendor's followers' device tokens
8. Customer's app receives Firebase Realtime update → Apollo cache updated
9. Customer's device receives push notification → app foregrounds if tapped
```

**Domain Event Bus Architecture:**

```
Resolver (write to Cloud SQL)
    │
    ├── PostgreSQL trigger → audit_log (DB-level, guaranteed)
    │
    └── events.Publish(ctx, DomainEvent)
            │
            ├── realtime.Handler → Firebase Realtime Database write
            ├── notify.Handler → FCM push notification dispatch
            └── (future handlers: analytics, webhooks, etc.)
```

- Events are processed in-request (synchronous) on Cloud Run — no external message broker needed at pilot scale
- Each handler is independently testable and can fail without blocking other handlers
- Failed event handlers log errors via slog and can be retried (NFR7)
- Audit logging is NOT an event handler — it is guaranteed at the database level via PostgreSQL triggers

### Frontend Architecture

| Decision | Choice | Rationale |
|---|---|---|
| **State management** | Apollo Client cache (server state) + React Context (local UI state) | No Redux/Zustand; Apollo cache handles all server data; Context for session/preferences |
| **Navigation** | Expo Router (file-based) | Tab layout with role-based tab switching; deep linking support built-in |
| **Styling** | NativeWind v4 (stable) | Tailwind CSS utility classes in React Native; evaluate v5 when stable |
| **Offline sync** | Optimistic UI + MMKV retry queue | `optimisticResponse` for mutations; failed mutations queued in MMKV; replayed on reconnect via NetInfo listener |
| **Component structure** | Feature-based folders under `app/` | Route groups: `(auth)/`, `(customer)/`, `(vendor)/`, `(manager)/` |
| **Image handling** | expo-image | Modern image component with caching; replaces FastImage |
| **List virtualization** | FlashList | Better performance than FlatList for vendor/market lists |

**Frontend Project Structure:**

```
markets-app/
├── app/
│   ├── (auth)/              # Login, role selection
│   ├── (customer)/          # Customer tabs: discover, following, profile
│   ├── (vendor)/            # Vendor tabs: markets, status, profile
│   ├── (manager)/           # Manager tabs: dashboard, vendors, profile
│   ├── _layout.tsx          # Root layout: auth gate + role-based routing
│   └── +not-found.tsx
├── components/              # Shared UI components
├── lib/
│   ├── apollo.ts            # Apollo Client configuration
│   ├── firebase.ts          # Firebase Auth + Realtime config
│   ├── mmkv.ts              # MMKV offline queue utilities
│   └── notifications.ts    # Push notification setup
├── graphql/
│   ├── queries/             # .graphql query files
│   ├── mutations/           # .graphql mutation files
│   └── generated/           # @graphql-codegen output (TS types + hooks)
├── hooks/                   # Custom React hooks
├── constants/               # Theme, config values
└── assets/                  # Images, fonts
```

### Infrastructure & Deployment

| Decision | Choice | Rationale |
|---|---|---|
| **Environments** | dev / staging / production | Separate Firebase projects + Cloud SQL instances + Cloud Run services per environment |
| **Backend CI/CD** | GitHub Actions → Docker → Artifact Registry → Cloud Run | lint → test → build → push → deploy |
| **Frontend CI/CD** | GitHub Actions → EAS Build → EAS Submit | lint → test → build (on tag) → TestFlight / Internal Testing |
| **Schema sharing** | Go repo is schema source of truth | GraphQL schema files committed in Go repo; codegen runs in frontend repo pulling schema; schema validation runs as CI/PR check |
| **Monitoring** | Cloud Logging + Cloud Error Reporting + Cloud Trace | Automatic from Cloud Run; structured JSON logs from Go via slog |
| **Analytics** | Firebase Analytics (Google Analytics 4) | Unified analytics across iOS, Android, and Web — Firebase SDK sends to GA4 dashboard |
| **Cloud Run config** | min=1, max=10, concurrency=80, 512MB, 1 CPU | Min=1 avoids Saturday cold starts; pilot-scale limits |
| **Auto-checkout jobs** | Cloud Scheduler → Cloud Run endpoint | Runs every 15 minutes; checks for markets past closing time; auto-checks-out remaining vendors; dispatches notifications |
| **Connection pooling** | Cloud SQL Auth Proxy (sidecar in Cloud Run) | Handles SSL, IAM auth, connection pooling to Cloud SQL |

**Deployment Architecture:**

```
┌─────────────────────────────────────────────────────────────────┐
│                        Google Cloud Platform                     │
│                                                                   │
│  ┌─────────────┐    ┌──────────────────┐    ┌────────────────┐  │
│  │ Cloud Run   │───▶│ Cloud SQL        │    │ Firebase       │  │
│  │ (Go API)    │    │ (PostgreSQL)     │    │ ┌────────────┐ │  │
│  │             │───▶│                  │    │ │ Auth       │ │  │
│  │ + Auth Proxy│    └──────────────────┘    │ │ Realtime   │ │  │
│  └──────┬──────┘                            │ │ FCM        │ │  │
│         │           ┌──────────────────┐    │ │ Analytics  │ │  │
│         │           │ Cloud Scheduler  │    │ └────────────┘ │  │
│         │           │ (auto-checkout)  │    └────────────────┘  │
│         │           └──────────────────┘              │          │
└─────────┼─────────────────────────────────────────────┼──────────┘
          │                                             │
          ▼                                             ▼
┌──────────────────┐                         ┌──────────────────┐
│ React Native App │◀────────────────────────│ Firebase SDK     │
│ (iOS/Android/Web)│    GraphQL (HTTPS)      │ (Auth, Realtime, │
│ Apollo Client    │                          │  FCM, Analytics) │
└──────────────────┘                         └──────────────────┘
```

### Decision Impact Analysis

**Implementation Sequence:**
1. Firebase project setup (Auth, Realtime, FCM) — unblocks both codebases
2. Cloud SQL instance + initial schema migration — unblocks backend
3. Go API scaffold (gqlgen init + auth middleware) — unblocks frontend integration
4. Expo app scaffold (create-expo-app + Apollo Client + Firebase SDK) — parallel with #3
5. Core domain resolvers (market, vendor, customer CRUD) — sequential after #3
6. Real-time integration (Firebase Realtime writes from Go, subscriptions in RN) — after #5
7. Push notifications (FCM dispatch from Go, expo-notifications in RN) — after #5
8. Audit logging interceptor — can be added incrementally alongside #5-7
9. Auto-checkout Cloud Scheduler job — after #5

**Cross-Component Dependencies:**
- Firebase Auth config must be shared between Go (Admin SDK) and RN (client SDK)
- GraphQL schema is the contract between Go and RN codebases — schema changes require coordinated codegen
- Firebase Realtime path structure must be agreed upon by both codebases
- FCM device token registration (RN) must align with token storage schema (Cloud SQL) and dispatch logic (Go)

## Implementation Patterns & Consistency Rules

### Naming Patterns

**Database (PostgreSQL):**

| Element | Convention | Example |
|---|---|---|
| Tables | `snake_case`, plural | `markets`, `vendors`, `check_ins`, `audit_log` |
| Columns | `snake_case` | `vendor_id`, `created_at`, `deleted_at` |
| Foreign keys | `{referenced_table_singular}_id` | `market_id`, `vendor_id` |
| Indexes | `idx_{table}_{columns}` | `idx_vendors_name`, `idx_check_ins_market_id_date` |
| Constraints | `{table}_{type}_{columns}` | `markets_pk_id`, `vendors_uq_email` |

**Go Backend:**

| Element | Convention | Example |
|---|---|---|
| Packages | `lowercase` single word | `auth`, `graph`, `audit`, `notify` |
| Exported functions | `PascalCase` | `CreateMarket`, `ValidateCheckIn` |
| Unexported functions | `camelCase` | `validateInput`, `buildQuery` |
| Variables | `camelCase` | `marketID`, `vendorStatus` |
| Files | `snake_case.go` | `market_resolver.go`, `auth_middleware.go` |
| Struct fields | `PascalCase` with `json:"snake_case"` tags | `MarketID json:"market_id"` |

**TypeScript / React Native:**

| Element | Convention | Example |
|---|---|---|
| Components | `PascalCase` file + export | `VendorCard.tsx`, `MarketList.tsx` |
| Hooks | `camelCase` with `use` prefix | `useVendorStatus.ts`, `useMarketSearch.ts` |
| Utilities/lib | `camelCase` files | `apollo.ts`, `firebase.ts` |
| GraphQL files | `camelCase.graphql` | `getMarket.graphql`, `checkIn.graphql` |
| Constants | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `API_URL` |
| Config values | `camelCase` | `defaultRadius`, `peakWindowStart` |

**GraphQL Schema:**

| Element | Convention | Example |
|---|---|---|
| Types | `PascalCase` | `Market`, `Vendor`, `CheckIn`, `AuditEntry` |
| Fields | `camelCase` | `vendorId`, `createdAt`, `marketDay` |
| Mutations | `camelCase` verb-first | `createMarket`, `checkInVendor`, `updateVendorStatus` |
| Queries | `camelCase` noun-first | `market`, `markets`, `vendorsByMarket` |
| Enums | `UPPER_SNAKE_CASE` values | `CHECKED_IN`, `RUNNING_LATE`, `NOT_ATTENDING` |
| Input types | `PascalCase` with `Input` suffix | `CreateMarketInput`, `CheckInInput` |

### Structure Patterns

**Go Backend:**
- Tests: co-located `_test.go` files (`market_resolver_test.go` next to `market_resolver.go`)
- Integration tests: separate build tag `//go:build integration`
- Config: `config/` directory with environment-specific YAML files
- Migrations: `migrations/` at repo root, numbered (`001_create_markets.up.sql`, `001_create_markets.down.sql`)

**React Native:**
- Tests: co-located `__tests__/` directories or `.test.tsx` files
- E2E tests: `e2e/` at repo root (Detox)
- Assets: `assets/` at repo root (images, fonts)
- Environment: `app.config.ts` with EAS environment variables (no `.env` files committed)

### Format Patterns

**GraphQL Error Format:**

```json
{
  "errors": [{
    "message": "Vendor not found",
    "extensions": {
      "code": "NOT_FOUND",
      "field": "vendorId"
    }
  }]
}
```

**Error Code Set (exhaustive — no custom codes without updating this document):**

| Code | Meaning | HTTP Analogue |
|---|---|---|
| `UNAUTHENTICATED` | No or invalid JWT | 401 |
| `FORBIDDEN` | Valid JWT but wrong role/scope | 403 |
| `NOT_FOUND` | Entity doesn't exist or soft-deleted | 404 |
| `VALIDATION_ERROR` | Input validation failure (field-level detail in extensions) | 400 |
| `CONFLICT` | Business rule conflict (e.g., already checked in elsewhere) | 409 |
| `INTERNAL` | Unexpected server error (logged, never exposed) | 500 |

**Date/Time:** ISO 8601 strings everywhere (`2026-03-21T07:30:00Z`). PostgreSQL `TIMESTAMPTZ` columns. Frontend computes relative display ("14 min ago") from `updatedAt`.

**JSON field naming:** `camelCase` in GraphQL responses (gqlgen default). `snake_case` in PostgreSQL. gqlgen struct tags handle mapping.

**Null handling:** GraphQL nullable fields return `null`, not omitted. Empty arrays return `[]`, not `null`.

### Communication Patterns

**Firebase Realtime Database Paths:**

```
/markets/{marketId}/status                    → market-level status object
/markets/{marketId}/vendors/{vendorId}        → vendor check-in/status at this market
```

- Values are flat JSON objects, not nested trees
- Go writes complete objects (not partial updates) to ensure consistency
- Clients subscribe at market level to receive all vendor updates for followed markets

**Audit Log Entry Format:**

```json
{
  "actor_id": "firebase-uid",
  "actor_role": "vendor",
  "action": "check_in",
  "target_type": "check_in",
  "target_id": "uuid",
  "market_id": "uuid",
  "timestamp": "2026-03-21T07:30:00Z",
  "payload": { "market_id": "...", "vendor_id": "..." }
}
```

- Action names: `snake_case` verb (`check_in`, `update_status`, `create_market`, `soft_delete_account`)
- Audit rows are inserted automatically by PostgreSQL triggers on domain tables — resolvers do NOT call audit manually
- Triggers capture: the table name (target_type), row ID (target_id), operation (INSERT/UPDATE/DELETE), old and new row data (payload), and the `app.actor_id` / `app.actor_role` session variables set by Go middleware via `SET LOCAL`
- Go auth middleware sets PostgreSQL session variables before each request: `SET LOCAL app.actor_id = '{uid}'; SET LOCAL app.actor_role = '{role}';`

### Process Patterns

**Error Handling (Go):**
- Resolvers return gqlgen errors with extensions
- Never expose internal errors to client — log with `slog.Error`, return generic `INTERNAL` code
- Validation errors include field-level detail in extensions

**Error Handling (React Native):**
- Apollo Client `onError` link logs errors globally
- Component-level error handling via Apollo's `error` return from hooks
- User-facing error messages: short, action-oriented ("Check-in failed. Tap to retry.")
- No raw error messages shown to users

**Loading States (React Native):**
- Apollo's `loading` boolean from hooks — no custom loading state management
- Skeleton screens for initial loads (not spinners)
- Optimistic UI for mutations — immediate feedback, error state only on failure
- Pull-to-refresh on list screens via Apollo's `refetch`

**Offline Retry Pattern:**
- Failed mutations stored in MMKV: `{ id, mutation, variables, timestamp, retryCount }`
- On reconnect (NetInfo `addEventListener`), replay queued mutations in FIFO order
- Max 3 retries per mutation; after 3 failures, surface error to user
- Queued state shown in UI: "Check-in pending..." with cancel option

### Enforcement Guidelines

**All AI Agents MUST:**
- Follow naming conventions exactly as specified — no creative alternatives
- Use the project structure defined in Starter Template and Core Decisions sections — no new top-level directories without explicit approval
- Publish domain events after every mutation resolver write — no exceptions
- Never manually insert audit_log rows from application code — PostgreSQL triggers handle this automatically
- Always set PostgreSQL session variables (`app.actor_id`, `app.actor_role`) in auth middleware before resolver execution
- Return GraphQL errors with extension codes from the defined set only
- Use Apollo Client for all server data — no direct `fetch()` calls to the GraphQL API
- Use Firebase Realtime for all real-time data — no polling unless as explicit degradation fallback
- Co-locate tests with source files — no separate `__tests__` directory at repo root
- Use `slog` for all Go logging — structured JSON output, no `fmt.Println` or `log.Println`

**Anti-Patterns (Explicitly Forbidden):**
- Redux, Zustand, or MobX for state management (use Apollo Client cache + React Context)
- Direct SQL string concatenation (use parameterized queries via pgx)
- Storing secrets in code or committed config files (use environment variables / Secret Manager)
- `any` type in TypeScript (use proper types from @graphql-codegen)
- Hard-deleting user data (always soft-delete with `deleted_at`)
- Creating custom HTTP endpoints alongside GraphQL (all data access through GraphQL)

## Project Structure & Boundaries

### Requirements to Structure Mapping

**FR Category: Identity, Roles, Access Control (FR1-FR7)**
- Backend: `internal/auth/`, `internal/graph/schema/auth.graphqls`, `internal/graph/auth.resolvers.go`
- Frontend: `app/(auth)/`, `lib/firebase.ts`, `hooks/useAuth.ts`
- Database: `migrations/001_create_users.up.sql`, `migrations/002_create_market_managers.up.sql`

**FR Category: Market and Vendor Administration (FR8-FR13)**
- Backend: `internal/graph/schema/market.graphqls`, `internal/graph/schema/vendor.graphqls`, `internal/graph/market.resolvers.go`, `internal/graph/vendor.resolvers.go`
- Frontend: `app/(manager)/markets/`, `app/(vendor)/profile/`, `components/market/`, `components/vendor/`
- Database: `migrations/003_create_markets.up.sql`, `migrations/004_create_vendors.up.sql`, `migrations/005_create_vendor_products.up.sql`, `migrations/006_create_market_vendors.up.sql`

**FR Category: Market-Day Operations (FR14-FR20d)**
- Backend: `internal/graph/schema/vendor.graphqls` (check-in mutations), `internal/realtime/`, `internal/scheduler/`
- Frontend: `app/(vendor)/checkin/`, `app/(manager)/dashboard/`, `components/checkin/`, `hooks/useCheckIn.ts`
- Database: `migrations/007_create_check_ins.up.sql`, `migrations/008_create_vendor_statuses.up.sql`

**FR Category: Discovery, Follow, Engagement (FR21-FR28)**
- Backend: `internal/graph/schema/customer.graphqls`, `internal/search/`
- Frontend: `app/(customer)/discover/`, `app/(customer)/following/`, `components/search/`, `hooks/useSearch.ts`
- Database: `migrations/009_create_follows.up.sql`

**FR Category: Notifications and Activity (FR29-FR32c)**
- Backend: `internal/notify/`, `internal/graph/schema/notification.graphqls`
- Frontend: `lib/notifications.ts`, `components/activity/`, `hooks/useActivityFeed.ts`
- Database: `migrations/010_create_notification_prefs.up.sql`, `migrations/011_create_device_tokens.up.sql`

**FR Category: Trust, Data Integrity, Audit (FR33-FR39)**
- Backend: `internal/audit/`, `internal/graph/schema/audit.graphqls`, `internal/graph/audit.resolvers.go`
- Frontend: `components/freshness/`, `app/(manager)/audit.tsx`
- Database: `migrations/012_create_audit_log.up.sql`

**FR Category: Account Control, Privacy, Governance (FR40-FR44)**
- Backend: `internal/graph/auth.resolvers.go` (account deletion), resolver-level soft-delete enforcement
- Frontend: `app/(auth)/profile/`, `components/settings/`

**Cross-Cutting Concerns Mapping:**

| Concern | Backend Location | Frontend Location |
|---|---|---|
| Authorization | `internal/auth/middleware.go` → resolver context | `app/_layout.tsx` (role gate) |
| Audit logging | PostgreSQL triggers on domain tables (DB-level) + `internal/audit/` (trigger DDL, query helpers) | — (server-only) |
| Domain event bus | `internal/events/` (publish/subscribe, handler registry) | — (server-only) |
| Real-time propagation | `internal/realtime/writer.go` (event handler) | `hooks/useRealtimeStatus.ts` |
| Push notifications | `internal/notify/` (event handler) | `lib/notifications.ts` |
| Soft-delete filtering | `internal/db/queries.go` (shared WHERE clause) | — (server-enforced) |
| Optimistic UI | — (server-only) | `hooks/useCheckIn.ts`, `lib/mmkv.ts` |
| Freshness timestamps | GraphQL `updatedAt` fields | `components/freshness/FreshnessTimestamp.tsx` |

### Complete Project Directory Structure

**Monorepo Root:**

```
markets/
├── README.md
├── .github/
│   └── workflows/
│       ├── api-ci.yml               # Go: lint, test, build, deploy
│       ├── app-ci.yml               # RN: lint, test, type-check
│       ├── app-build.yml            # EAS Build on tag
│       └── schema-check.yml         # GraphQL schema validation PR check
├── api/                             # Go backend
│   └── (see backend tree below)
├── app/                             # React Native frontend
│   └── (see frontend tree below)
└── schema/                          # Shared GraphQL schema (source of truth)
    ├── auth.graphqls
    ├── market.graphqls
    ├── vendor.graphqls
    ├── customer.graphqls
    ├── notification.graphqls
    └── audit.graphqls
```

**Backend (`api/`):**

```
api/
├── cmd/
│   └── api/
│       └── main.go                  # Entry point: server, middleware chain, DI
├── internal/
│   ├── auth/
│   │   ├── middleware.go            # Firebase JWT validation, context injection
│   │   ├── middleware_test.go
│   │   ├── claims.go               # Custom claim parsing (role extraction)
│   │   └── claims_test.go
│   ├── graph/
│   │   ├── schema/                  # Symlink or copy of /schema/*.graphqls
│   │   ├── model/
│   │   │   ├── models_gen.go        # gqlgen generated models
│   │   │   └── custom.go           # Custom model extensions
│   │   ├── generated.go            # gqlgen generated runtime
│   │   ├── resolver.go             # Root resolver struct (DB pool, Firebase clients)
│   │   ├── auth.resolvers.go       # Auth mutations: role assignment, account deletion
│   │   ├── auth.resolvers_test.go
│   │   ├── market.resolvers.go     # Market CRUD, manager assignment
│   │   ├── market.resolvers_test.go
│   │   ├── vendor.resolvers.go     # Vendor CRUD, check-in/checkout, status
│   │   ├── vendor.resolvers_test.go
│   │   ├── customer.resolvers.go   # Search, follow, discovery
│   │   ├── customer.resolvers_test.go
│   │   ├── notification.resolvers.go  # Notification preferences, feed queries
│   │   ├── notification.resolvers_test.go
│   │   ├── audit.resolvers.go      # Audit log queries (manager access)
│   │   └── audit.resolvers_test.go
│   ├── audit/
│   │   ├── logger.go               # Audit entry creation (append-only insert)
│   │   └── logger_test.go
│   ├── notify/
│   │   ├── fcm.go                  # FCM push dispatch client
│   │   ├── fcm_test.go
│   │   ├── dispatcher.go           # Follower resolution + batch send
│   │   └── dispatcher_test.go
│   ├── realtime/
│   │   ├── writer.go               # Firebase Realtime Database write client
│   │   └── writer_test.go
│   ├── search/
│   │   ├── index.go                # Search query builder (full-text + radius)
│   │   └── index_test.go
│   ├── scheduler/
│   │   ├── autocheckout.go         # Auto-checkout handler (Cloud Scheduler target)
│   │   └── autocheckout_test.go
│   ├── db/
│   │   ├── pool.go                 # pgx connection pool setup (Cloud SQL Auth Proxy)
│   │   ├── queries.go              # Shared query helpers, soft-delete filter
│   │   └── queries_test.go
│   ├── middleware/
│   │   ├── logging.go              # Request logging (slog)
│   │   ├── cors.go                 # CORS configuration
│   │   └── recovery.go             # Panic recovery
│   └── config/
│       ├── config.go               # Viper configuration loading
│       ├── dev.yaml
│       ├── staging.yaml
│       └── production.yaml
├── migrations/
│   ├── 001_create_users.up.sql
│   ├── 001_create_users.down.sql
│   ├── 002_create_market_managers.up.sql
│   ├── 002_create_market_managers.down.sql
│   ├── 003_create_markets.up.sql
│   ├── 003_create_markets.down.sql
│   ├── 004_create_vendors.up.sql
│   ├── 004_create_vendors.down.sql
│   ├── 005_create_vendor_products.up.sql
│   ├── 005_create_vendor_products.down.sql
│   ├── 006_create_market_vendors.up.sql
│   ├── 006_create_market_vendors.down.sql
│   ├── 007_create_check_ins.up.sql
│   ├── 007_create_check_ins.down.sql
│   ├── 008_create_vendor_statuses.up.sql
│   ├── 008_create_vendor_statuses.down.sql
│   ├── 009_create_follows.up.sql
│   ├── 009_create_follows.down.sql
│   ├── 010_create_notification_prefs.up.sql
│   ├── 010_create_notification_prefs.down.sql
│   ├── 011_create_device_tokens.up.sql
│   ├── 011_create_device_tokens.down.sql
│   └── 012_create_audit_log.up.sql  # No down migration — append-only
├── Dockerfile
├── .dockerignore
├── gqlgen.yml
├── go.mod
├── go.sum
└── Makefile                         # generate, migrate, test, lint, run
```

**Frontend (`app/`):**

```
app/
├── app/
│   ├── _layout.tsx                  # Root layout: auth gate, role router
│   ├── +not-found.tsx
│   ├── (auth)/
│   │   ├── _layout.tsx
│   │   ├── login.tsx                # Social login (Google + Apple + Facebook)
│   │   └── role-select.tsx          # First-login role selection
│   ├── (customer)/
│   │   ├── _layout.tsx              # Customer tab bar
│   │   ├── (tabs)/
│   │   │   ├── discover.tsx         # Search markets/vendors/products
│   │   │   ├── following.tsx        # Followed vendors/markets feed
│   │   │   └── profile.tsx          # Customer profile + settings
│   │   ├── market/[id].tsx          # Market detail
│   │   └── vendor/[id].tsx          # Vendor detail + follow action
│   ├── (vendor)/
│   │   ├── _layout.tsx              # Vendor tab bar
│   │   ├── (tabs)/
│   │   │   ├── markets.tsx          # Vendor's rostered markets
│   │   │   ├── status.tsx           # Check-in/status/exception updates
│   │   │   └── profile.tsx          # Vendor profile + product catalog
│   │   ├── checkin/[marketId].tsx   # Check-in flow for specific market
│   │   └── products/edit.tsx        # Product catalog editor
│   └── (manager)/
│       ├── _layout.tsx              # Manager tab bar
│       ├── (tabs)/
│       │   ├── dashboard.tsx        # Market-day overview: vendor statuses
│       │   ├── vendors.tsx          # Roster management, check-in on behalf
│       │   └── profile.tsx          # Manager profile + market settings
│       ├── market/[id]/
│       │   ├── index.tsx            # Market detail / edit
│       │   └── roster.tsx           # Vendor roster management
│       └── audit.tsx                # Audit log viewer
├── components/
│   ├── ui/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Skeleton.tsx             # Skeleton loading component
│   │   └── ErrorBanner.tsx          # User-facing error display
│   ├── market/
│   │   ├── MarketCard.tsx
│   │   ├── MarketDetail.tsx
│   │   └── MarketStatusBar.tsx
│   ├── vendor/
│   │   ├── VendorCard.tsx
│   │   ├── VendorDetail.tsx
│   │   ├── VendorStatusBadge.tsx
│   │   └── ProductList.tsx
│   ├── checkin/
│   │   ├── CheckInButton.tsx
│   │   ├── StatusSelector.tsx
│   │   ├── ConflictWarning.tsx      # Multi-market conflict modal
│   │   └── PendingIndicator.tsx     # Offline queue pending state
│   ├── search/
│   │   ├── SearchBar.tsx
│   │   ├── SearchResults.tsx
│   │   └── RadiusFilter.tsx
│   ├── activity/
│   │   ├── ActivityFeed.tsx
│   │   └── ActivityItem.tsx
│   ├── freshness/
│   │   └── FreshnessTimestamp.tsx    # Relative time display
│   └── settings/
│       ├── NotificationPrefs.tsx
│       └── FollowManager.tsx
├── lib/
│   ├── apollo.ts                    # Apollo Client: cache, auth link, error link, MMKV persist
│   ├── firebase.ts                  # Firebase Auth + Realtime init
│   ├── mmkv.ts                      # MMKV store: offline queue, last-known status
│   ├── notifications.ts            # expo-notifications: registration, token management
│   └── platform.ts                  # Platform-specific utilities (web vs native)
├── graphql/
│   ├── queries/
│   │   ├── getMarket.graphql
│   │   ├── getMarkets.graphql
│   │   ├── getVendor.graphql
│   │   ├── getVendorsByMarket.graphql
│   │   ├── searchMarkets.graphql
│   │   ├── getFollowing.graphql
│   │   ├── getActivityFeed.graphql
│   │   └── getAuditLog.graphql
│   ├── mutations/
│   │   ├── checkIn.graphql
│   │   ├── checkOut.graphql
│   │   ├── updateVendorStatus.graphql
│   │   ├── followVendor.graphql
│   │   ├── followMarket.graphql
│   │   ├── createMarket.graphql
│   │   ├── updateProfile.graphql
│   │   ├── updateNotificationPrefs.graphql
│   │   └── softDeleteAccount.graphql
│   └── generated/
│       ├── graphql.ts               # @graphql-codegen output: types
│       └── hooks.ts                 # @graphql-codegen output: Apollo hooks
├── hooks/
│   ├── useAuth.ts                   # Auth state, role, login/logout
│   ├── useCheckIn.ts                # Check-in mutation with optimistic UI
│   ├── useSearch.ts                 # Search with debounce + radius
│   ├── useActivityFeed.ts           # Activity feed with role-based filtering
│   ├── useRealtimeStatus.ts         # Firebase Realtime subscription
│   ├── useOfflineQueue.ts           # MMKV queue management + retry
│   └── useFollows.ts                # Follow/unfollow mutations
├── constants/
│   ├── theme.ts                     # NativeWind theme extensions
│   ├── config.ts                    # API URL, Firebase config, feature flags
│   └── roles.ts                     # Role enum, permission helpers
├── assets/
│   ├── images/
│   └── fonts/
├── e2e/                             # Detox E2E tests
│   ├── login.test.ts
│   ├── checkin.test.ts
│   └── search.test.ts
├── app.config.ts                    # Expo config (EAS env vars)
├── nativewind-env.d.ts
├── tailwind.config.ts
├── codegen.ts                       # @graphql-codegen config
├── tsconfig.json
├── package.json
└── babel.config.js
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Interface | Enforced By |
|---|---|---|
| Client → API | GraphQL over HTTPS (single `/graphql` endpoint) | Cloud Run ingress, TLS |
| API → Database | pgx v5 parameterized queries via Cloud SQL Auth Proxy | Auth Proxy sidecar, IAM |
| API → Firebase Realtime | Firebase Admin SDK REST writes | Service account credentials |
| API → FCM | Firebase Admin SDK push dispatch | Service account credentials |
| Client → Firebase Auth | Firebase client SDK (OAuth flows) | Firebase project config |
| Client → Firebase Realtime | Firebase client SDK (subscriptions) | Firebase security rules |
| Cloud Scheduler → API | HTTPS POST to `/internal/auto-checkout` | IAM service account, not exposed via GraphQL |

**Component Boundaries (Frontend):**

| Boundary | Rule |
|---|---|
| Route groups `(auth)`, `(customer)`, `(vendor)`, `(manager)` | Isolated by role — root `_layout.tsx` gates access based on auth state and role |
| `components/` | Shared across route groups; no business logic; presentation only |
| `hooks/` | Business logic + data fetching; consume Apollo/Firebase; return formatted data to components |
| `lib/` | Infrastructure setup; called once at app init; no business logic |
| `graphql/` | Schema artifacts only; no runtime code |

**Data Boundaries:**

| Boundary | Rule |
|---|---|
| Cloud SQL | All relational data; single source of truth for all domain state |
| Firebase Realtime | Derived status data only; written by Go, read by clients; not authoritative (Cloud SQL is) |
| Apollo Cache | Client-side normalized cache of GraphQL responses; invalidated by mutations + Realtime updates |
| MMKV | Offline retry queue + last-known status snapshots; ephemeral; rebuilt from server on sync |
| Audit Log table | Write-only from application perspective; no UPDATE/DELETE; query-only for managers |

### Integration Points

**Internal Communication:**
- Frontend → Backend: All via Apollo Client GraphQL mutations/queries
- Backend → Firebase Realtime: Server-side write after Cloud SQL commit
- Backend → FCM: Server-side push dispatch after Cloud SQL commit
- Backend → Audit: In-process call within resolver after successful mutation
- Cloud Scheduler → Backend: HTTPS POST to internal endpoint

**External Integrations:**
- Firebase Auth: OAuth provider (Google, Apple, Facebook) — client SDK for flow, Admin SDK for JWT validation
- Google Maps / Location: `expo-location` for radius search coordinates (client-side)
- App Store / Play Store: EAS Submit for distribution

**Data Flow (Check-In — representative end-to-end flow):**

```
Vendor taps Check In
  → Apollo optimisticResponse updates cache immediately
  → GraphQL mutation hits Go resolver
    → Validates: role=vendor, not already checked in elsewhere (or warn)
    → INSERT into check_ins (Cloud SQL)
    → INSERT into audit_log (Cloud SQL)
    → Write status to /markets/{id}/vendors/{vid} (Firebase Realtime)
    → Send FCM to follower device tokens
  → Firebase Realtime update reaches all subscribed customer apps
  → FCM push reaches follower devices
```

### File Organization Patterns

**Configuration Files:**
- Go backend: `internal/config/` with environment-specific YAML (`dev.yaml`, `staging.yaml`, `production.yaml`) loaded by Viper
- React Native: `app.config.ts` with EAS environment variables; no `.env` files committed
- Shared: GraphQL schema in monorepo `schema/` directory

**Source Organization:**
- Go: `cmd/` for entry points, `internal/` for all application code (enforced by Go visibility rules)
- React Native: `app/` for routes (Expo Router), `components/` for UI, `hooks/` for logic, `lib/` for infra, `graphql/` for schema artifacts

**Test Organization:**
- Go: co-located `_test.go` files; integration tests via `//go:build integration` tag
- React Native: co-located `__tests__/` or `.test.tsx`; E2E tests in `e2e/` (Detox)

**Asset Organization:**
- Static assets (images, fonts): `app/assets/`
- Generated code (GraphQL types, Apollo hooks): `app/graphql/generated/`
- Generated Go code: `api/internal/graph/generated.go`, `api/internal/graph/model/models_gen.go`

### Development Workflow Integration

**Local Development:**
- Frontend: `npx expo start` — Expo Go for iOS/Android, Metro for web (`--web`)
- Backend: `go run cmd/api/main.go` — local server; uses dev Firebase project + Cloud SQL via Auth Proxy or local PostgreSQL
- Schema workflow: Edit `.graphqls` in `schema/` → `go generate ./...` in `api/` → `npm run codegen` in `app/`

**CI/CD Pipeline:**
- `schema-check.yml`: On PR, validate schema files parse correctly, run codegen, check for drift
- `api-ci.yml`: On push to main, lint (`golangci-lint`) → test → build Docker → push to Artifact Registry → deploy to Cloud Run
- `app-ci.yml`: On push to main, lint (ESLint) → type-check (tsc) → test (Jest)
- `app-build.yml`: On git tag (`v*`), EAS Build → EAS Submit to TestFlight / Internal Testing

**Environment Strategy:**
- `dev`: Personal development; local or shared dev Firebase project + Cloud SQL
- `staging`: Pre-production; separate Firebase project + Cloud SQL instance; deployed on every merge to main
- `production`: Live; separate Firebase project + Cloud SQL instance; deployed manually or on release tag
