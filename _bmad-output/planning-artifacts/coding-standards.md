# Markets — Project Coding Standards

> Authored by Winston (Architect) during Epic 1 Sprint Planning.
> This document defines how the Markets project applies the organization-wide engineering standards to its Go + React Native/Expo stack.

---

## Organization Standards (Required Reading)

All development in this repository follows the **[petry-projects organization AGENTS.md](https://github.com/petry-projects/.github/blob/main/AGENTS.md)**. That document is the authoritative source for:

- **TDD** — Red-Green-Refactor workflow, coverage enforcement, no `.skip()`, no coverage-ignore comments
- **SOLID** — SRP, OCP, LSP, ISP, DIP definitions and general guidance
- **CLEAN Code** — Meaningful names, small functions, minimal arguments, no side-effect surprises, error handling
- **DRY** — Knowledge deduplication, premature abstraction warnings
- **DDD** — Ubiquitous language, bounded contexts, aggregate roots, value objects, repository pattern
- **KISS / YAGNI** — Simplest solution, no speculative features
- **Defensive coding** — Validate at boundaries, trust internal code, fail fast
- **Separation of concerns** — Layered architecture, inward dependencies, no framework bleed
- **Code organization** — Co-located tests, no barrel files, consistent naming
- **Pre-commit checks** — Format, lint, type check, tests before every commit
- **CI quality gates** — CodeQL, SonarCloud, CodeRabbit, Copilot review, tests, coverage
- **BMAD Method** — Spec-driven development, planning artifacts, story-based implementation
- **Multi-agent isolation** — Git worktrees, one agent per story, no overlapping file ownership
- **Security** — No committed secrets, environment variables for credentials

**This document does not restate those principles.** It specifies only how they are applied in the Markets codebase.

If a rule here conflicts with the org AGENTS.md, **this document takes precedence** (per org policy).

---

## 1. TDD — Markets Application

### Testing Framework & Configuration

| Layer | Framework | Location | Environment |
|-------|-----------|----------|-------------|
| Go unit tests | `go test` | `*_test.go` co-located with source | Go test runner |
| Go integration tests | `go test -tags=integration` | `*_test.go` with `//go:build integration` | Real Cloud SQL (test instance) |
| React Native unit/component | Jest + React Native Testing Library | `*.test.tsx` co-located or `__tests__/` | jsdom via Jest |
| GraphQL resolver integration | `go test -tags=integration` | `internal/graph/*_test.go` | Full resolver → DB → response |
| E2E | Maestro or Detox | `e2e/` directory | Real app on simulator |

### What to Test (by Layer)

| Layer | What to Test | How |
|-------|-------------|-----|
| **Go resolvers** (`internal/graph/`) | Input validation, authorization, business logic, error codes | Unit test with mocked DB; integration test with real DB |
| **Go middleware** (`internal/auth/`) | JWT validation, role extraction, context population, rejection of invalid tokens | Unit test with crafted JWTs |
| **Go event bus** (`internal/events/`) | Event publishing, handler registration, handler dispatch, failure isolation | Unit test with mock handlers |
| **Go DB queries** (`internal/db/`) | CRUD operations, soft-delete filtering, constraint enforcement | Integration test with test database |
| **PostgreSQL migrations** (`migrations/`) | Schema creation, audit trigger attachment, rollback safety | Integration test: migrate up, verify schema, migrate down |
| **React Native components** (`components/`) | User interactions, conditional rendering, accessibility labels | React Native Testing Library with user-event |
| **React Native hooks** (`hooks/`) | State transitions, Apollo cache interactions, return values | `renderHook()` from React Testing Library |
| **Apollo Client** (`lib/apollo.ts`) | Cache policies, optimistic responses, error handling | Mock Apollo Provider in tests |
| **GraphQL codegen output** (`graphql/generated/`) | Type correctness (compile-time only) | TypeScript compiler (`tsc --noEmit`) |

### Mocking Strategy

- **Go backend:** Use interfaces for all dependencies (DB, Firebase, event bus). Create `mock_*` or `fake_*` implementations for unit tests. Use real Cloud SQL test instance for integration tests.
- **React Native:** Mock Apollo Client with `MockedProvider`. Mock `expo-secure-store`, `expo-notifications`, and Firebase SDK. Never import Go backend code in frontend tests.

### Coverage Thresholds

| Metric | Minimum | Target |
|--------|---------|--------|
| Go line coverage | 80% | 90% |
| Go branch coverage | 75% | 85% |
| React Native line coverage | 80% | 90% |
| React Native branch coverage | 75% | 85% |

---

## 2. SOLID — Markets Application

### Single Responsibility

**Go backend:**
- One resolver file per GraphQL schema domain (`auth.resolvers.go`, `market.resolvers.go`, etc.)
- Business logic in domain packages, not in resolvers directly
- Event handlers are separate from event publishers

```
GOOD: internal/auth/middleware.go (JWT validation), internal/auth/claims.go (claim extraction)
BAD:  internal/auth/auth.go (validates JWT + queries DB + publishes events + sets headers)
```

**React Native:**
- One component per file (except small internal helpers)
- Hooks encapsulate one concern (`useVendorStatus`, `useMarketSearch`)
- Domain components in `components/{domain}/`, not mixed

### Open/Closed — Extension Points

- Go event bus: add new handlers without modifying the publisher or existing handlers
- GraphQL schema: new types/fields don't break existing queries
- React Native: new Gluestack component variants via `tva()` without modifying base components
- Audit triggers: attach to new tables without modifying the trigger function

### Interface Segregation

**Go:**
```go
// GOOD: Focused interfaces
type SessionStore interface {
    GetSession(ctx context.Context, id string) (*Session, error)
    SaveSession(ctx context.Context, s *Session) error
}

type AuditQuerier interface {
    QueryAuditLog(ctx context.Context, filter AuditFilter) ([]AuditEntry, error)
}

// BAD: God interface
type Database interface {
    GetSession(...) (*Session, error)
    SaveSession(...) error
    QueryAuditLog(...) ([]AuditEntry, error)
    GetMarket(...) (*Market, error)
    // ... 30 more methods
}
```

**GraphQL schema:** Split by domain (6 schema files), not one monolithic schema.

### Dependency Inversion

**Go:** Constructor injection in `cmd/api/main.go` (composition root). No DI frameworks.

```go
// cmd/api/main.go — composition root
db := connectDB(cfg.DatabaseURL)
authMiddleware := auth.NewMiddleware(firebaseApp)
eventBus := events.NewBus()
realtimeHandler := realtime.NewHandler(firebaseDB)
notifyHandler := notify.NewHandler(fcmClient)
eventBus.Subscribe(realtimeHandler)
eventBus.Subscribe(notifyHandler)
resolver := graph.NewResolver(db, eventBus)
```

**React Native:** React Context for dependency injection. Apollo Provider, Auth Context, and Theme Provider wrap the app at the root.

---

## 3. DRY — Markets Application

### Go Backend

- **Reusable query helpers** in `internal/db/` for common patterns (soft-delete filtering, pagination, market-scope checks)
- **Single audit trigger function** attached to all domain tables — never duplicate trigger logic
- **Shared error formatting** — one function to create GraphQL error responses with proper codes
- **Auth context extraction** — one helper to get user ID + role from context, used by all resolvers

### React Native

- **Gluestack UI components** from `components/ui/` are the single source for base UI elements — never recreate buttons, inputs, text
- **Domain components** in `components/{domain}/` are composed from base UI — reuse across screens
- **Custom hooks** encapsulate reusable logic (e.g., `useOptimisticMutation` wraps Apollo mutation + MMKV queue)
- **Design tokens** in `config.ts` — never hardcode colors, spacing, or typography values
- **GraphQL codegen** — never manually type API response shapes

---

## 4. CLEAN Code — Markets Application

### Error Handling

**Go:**
```go
// GOOD: Handle every error explicitly
user, err := r.db.GetUser(ctx, userID)
if err != nil {
    return nil, gqlError(ctx, "INTERNAL", "failed to fetch user")
}
if user == nil {
    return nil, gqlError(ctx, "NOT_FOUND", "user not found")
}

// BAD: Swallowing errors
user, _ := r.db.GetUser(ctx, userID)
```

**React Native:**
- Apollo `onError` for network/GraphQL errors — show user-friendly messages
- Never show raw error messages, stack traces, or error codes to users
- Error messages are short and action-oriented: "Check-in failed. Tap to retry."

### No Side Effects in Unexpected Places

- Go resolvers: write to DB, then publish events. Never publish events without a successful write.
- React components: side effects only in `useEffect` or event handlers, never during render
- GraphQL queries: never mutate state; mutations: always return updated state

---

## 5. DDD — Markets Application

### Bounded Contexts

Each `internal/` package maps to one bounded context with clear responsibilities and ownership.

| Context | Package | Responsibility | Aggregate Root |
|---------|---------|---------------|----------------|
| **Auth** | `internal/auth/` | JWT validation, role extraction, session variable injection | — (stateless middleware) |
| **Graph** | `internal/graph/` | GraphQL resolver orchestration, input validation, response shaping | — (delegates to domain) |
| **Market** | `internal/market/` | Market lifecycle, schedule, roster, 2-manager invariant | `Market` |
| **Vendor** | `internal/vendor/` | Vendor profile, product catalog, check-in lifecycle, exception status | `Vendor`, `CheckIn` |
| **Customer** | `internal/customer/` | Customer profile, follows, preferences, discovery | `Customer` |
| **Notification** | `internal/notify/` | FCM dispatch, notification preferences, device token management | — (infrastructure) |
| **Realtime** | `internal/realtime/` | Firebase Realtime Database writes for status propagation | — (infrastructure) |
| **Events** | `internal/events/` | Domain event bus: publish/subscribe, handler registration | — (infrastructure) |
| **Audit** | `internal/audit/` | Audit query helpers (writes are PostgreSQL triggers — not application code) | `AuditEntry` (read-only) |
| **DB** | `internal/db/` | Connection pool, migration runner, shared query utilities | — (infrastructure) |

### Aggregate Roots

Aggregates enforce business invariants. External code accesses children only through the root.

```go
// internal/market/market.go
type Market struct {
    ID          MarketID
    Name        string
    Location    Location
    Schedule    Schedule
    Managers    []ManagerAssignment  // invariant: len >= 2
    deletedAt   *time.Time
}

// Enforces 2-manager minimum (FR41a)
func (m *Market) RemoveManager(managerID UserID) error {
    if len(m.Managers) <= 2 {
        return ErrMinimumManagersRequired
    }
    // ... remove logic
    return nil
}

// internal/vendor/checkin.go
type CheckIn struct {
    ID        CheckInID
    VendorID  VendorID
    MarketID  MarketID
    Status    CheckInStatus  // checked-in, checked-out
    CheckedAt time.Time
    CheckedBy Attribution    // self or manager-on-behalf
}

// Enforces conflict detection (FR14)
func NewCheckIn(vendorID VendorID, marketID MarketID, existingCheckIns []CheckIn) (*CheckIn, error) {
    for _, ci := range existingCheckIns {
        if ci.Status == StatusCheckedIn && ci.MarketID != marketID {
            return nil, ErrAlreadyCheckedInElsewhere{MarketID: ci.MarketID}
        }
    }
    // ... create logic
}
```

**Rules:**
- Aggregates validate their own invariants — resolvers do not contain business rules
- Aggregates are created via factory functions (`NewMarket`, `NewCheckIn`) that enforce invariants from birth
- Aggregates return domain errors (not HTTP/GraphQL errors) — resolvers translate to GraphQL error codes

### Value Objects (Typed IDs)

Distinct types for IDs prevent accidental swapping at compile time.

```go
// internal/domain/ids.go
type UserID string
type MarketID string
type VendorID string
type CheckInID string
type AuditEntryID string

// Constructor functions validate format
func NewUserID(raw string) (UserID, error) {
    if raw == "" {
        return "", ErrEmptyID
    }
    return UserID(raw), nil
}
```

```go
// Compiler catches misuse:
func GetVendor(id VendorID) (*Vendor, error) { ... }

marketID := MarketID("abc")
GetVendor(marketID)  // ← compile error: cannot use MarketID as VendorID
```

**Other value objects:**
- `Location` — lat/lng pair, validated range
- `Schedule` — operating days + hours, validated consistency
- `Attribution` — actor ID + role + source (self vs manager-on-behalf)

### Repository Interfaces (Ports)

Domain code defines repository interfaces. Infrastructure implements them. Domain code never imports `pgx` or any database driver.

```go
// internal/market/repository.go (port — lives with domain code)
type MarketRepository interface {
    FindByID(ctx context.Context, id MarketID) (*Market, error)
    Save(ctx context.Context, m *Market) error
    FindByManager(ctx context.Context, managerID UserID) ([]*Market, error)
    SearchByLocation(ctx context.Context, lat, lng float64, radiusKm float64) ([]*Market, error)
}

// internal/vendor/repository.go
type VendorRepository interface {
    FindByID(ctx context.Context, id VendorID) (*Vendor, error)
    Save(ctx context.Context, v *Vendor) error
    FindActiveCheckIns(ctx context.Context, vendorID VendorID) ([]CheckIn, error)
}

// internal/db/market_repo.go (adapter — lives in infrastructure layer)
type PgMarketRepository struct {
    pool *pgxpool.Pool
}

func (r *PgMarketRepository) FindByID(ctx context.Context, id MarketID) (*Market, error) {
    // pgx query with WHERE deleted_at IS NULL
}
```

**Rules:**
- Port interfaces live alongside the domain code they serve (`internal/market/repository.go`)
- Adapter implementations live in `internal/db/` (infrastructure layer)
- Unit tests use fake/mock implementations; integration tests use real `Pg*Repository`
- Repositories always filter `WHERE deleted_at IS NULL` — callers never need to remember this

### Domain Events

Events decouple bounded contexts. Cross-domain communication is via events, not direct imports.

```go
// internal/events/types.go
type Event interface {
    EventType() string
}

type VendorCheckedIn struct {
    VendorID  VendorID
    MarketID  MarketID
    Timestamp time.Time
}
func (e VendorCheckedIn) EventType() string { return "vendor.checked_in" }

type UserCreated struct {
    UserID UserID
    Role   string
}
func (e UserCreated) EventType() string { return "user.created" }

type ManagerAssigned struct {
    ManagerID UserID
    MarketID  MarketID
}
func (e ManagerAssigned) EventType() string { return "manager.assigned" }
```

```go
// internal/events/bus.go
type Handler interface {
    Handle(ctx context.Context, event Event) error
}

type Bus struct {
    handlers []Handler
}

func (b *Bus) Publish(ctx context.Context, event Event) {
    for _, h := range b.handlers {
        if err := h.Handle(ctx, event); err != nil {
            slog.Error("event handler failed",
                "event", event.EventType(),
                "error", err,
            )
            // Handler failure logged but does NOT roll back the DB write
        }
    }
}
```

**Rules:**
- Events are published AFTER successful database writes — never before, never speculatively
- Events are NOT published if the DB write fails
- Each handler is independently testable and can fail without blocking other handlers
- Audit logging is NOT a domain event handler — it is guaranteed at the database level via PostgreSQL triggers
- Handler failure is logged but never rolls back the originating write (NFR7)

### Dependency Direction (Import Rules)

```
                    ┌─────────────────────────┐
                    │   cmd/api/main.go        │  ← Composition root (wires everything)
                    └────────────┬────────────┘
                                 │ imports
                    ┌────────────▼────────────┐
                    │   internal/graph/        │  ← Resolver layer (orchestration)
                    └────────────┬────────────┘
                                 │ imports
          ┌──────────────────────┼──────────────────────┐
          │                      │                      │
┌─────────▼────────┐  ┌─────────▼────────┐  ┌─────────▼────────┐
│ internal/market/  │  │ internal/vendor/ │  │ internal/customer/│  ← Domain layer
│ (aggregates +     │  │ (aggregates +    │  │ (aggregates +     │
│  repository port) │  │  repository port)│  │  repository port) │
└──────────────────┘  └──────────────────┘  └──────────────────┘
          ▲                      ▲                      ▲
          │ implements           │ implements           │ implements
┌─────────┴────────┐  ┌─────────┴────────┐  ┌─────────┴────────┐
│ internal/db/      │  │ internal/notify/ │  │ internal/realtime/│  ← Infrastructure
│ (Pg*Repository)   │  │ (FCM handler)   │  │ (Firebase handler)│
└──────────────────┘  └──────────────────┘  └──────────────────┘
```

**Hard rules:**
- Domain packages (`market/`, `vendor/`, `customer/`) import NOTHING from infrastructure (`db/`, `notify/`, `realtime/`)
- Domain packages never import each other — cross-domain communication is via domain events
- `internal/graph/` (resolvers) may import domain packages but not infrastructure directly
- Only `cmd/api/main.go` knows about all packages — it is the only place where concrete types are wired to interfaces
- Only `internal/db/` imports `pgx`
- Only `internal/auth/` imports `firebase-admin-go` for JWT validation
- Only `internal/notify/` imports `firebase-admin-go` for FCM dispatch
- Only `internal/realtime/` imports Firebase Realtime Database client

### Anti-Corruption Layer

External SDK types (Firebase, pgx, gqlgen models) must not leak into domain code. Map external types to domain types at the boundary.

```go
// internal/auth/middleware.go — maps Firebase JWT claims → domain context
func (m *Middleware) extractUser(token *auth.Token) (UserID, string, error) {
    uid, err := NewUserID(token.UID)          // Firebase string → domain UserID
    role := token.Claims["role"].(string)      // Firebase claim → plain string
    return uid, role, err
}

// internal/db/market_repo.go — maps pgx rows → domain Market
func (r *PgMarketRepository) FindByID(ctx context.Context, id MarketID) (*Market, error) {
    row := r.pool.QueryRow(ctx, "SELECT ...", string(id))
    // Map SQL columns → domain Market struct
    // This is the ONLY place that knows about the DB schema for markets
}
```

**Rules:**
- gqlgen-generated model types (`internal/graph/model/`) are API types, not domain types — map between them in resolvers
- Domain types own validation and invariants; API types are DTOs
- If the mapping is trivial (same fields), still keep the types separate — they change for different reasons

---

## 6. Pre-Commit Quality Checks — Markets Configuration

### Go Backend

```bash
# .githooks/pre-commit (Go)
golangci-lint run ./...
go test ./... -short -count=1
```

### React Native Frontend

```bash
# .husky/pre-commit (TypeScript)
npx lint-staged && npx tsc --noEmit
```

**lint-staged configuration** (in `package.json`):

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

### Per-Commit Checks

| Check | Tool | Target | Purpose |
|-------|------|--------|---------|
| Go lint | golangci-lint | Backend | Catch bugs, style issues, performance problems |
| Go tests (short) | go test -short | Backend | Fast unit tests only |
| TS lint + autofix | ESLint | Frontend | Catch floating promises, unused code |
| TS format | Prettier | Frontend | Consistent formatting |
| TS type check | tsc --noEmit | Frontend | Catch type errors |

---

## 7. CI Quality Gates — Markets Configuration

### Backend CI

| Gate | Command | Blocks PR? | Purpose |
|------|---------|-----------|---------|
| Lint | `golangci-lint run ./...` | Yes | Code quality |
| Unit tests | `go test ./... -short` | Yes | Regressions |
| Integration tests | `go test -tags=integration ./...` | Yes | Full-path validation |
| Coverage | `go test -coverprofile=coverage.out` | Yes (80% line) | Adequate test coverage |
| Build | `go build ./cmd/api/` | Yes | Compilation |
| Schema validation | `go run github.com/99designs/gqlgen validate` | Yes | GraphQL schema consistency |

### Frontend CI

| Gate | Command | Blocks PR? | Purpose |
|------|---------|-----------|---------|
| Type check | `tsc --noEmit` | Yes | Type errors are bugs |
| Lint | `eslint . --max-warnings 0` | Yes | Code quality |
| Format | `prettier --check .` | Yes | Formatting consistency |
| Unit + component tests | `jest --ci` | Yes | Regressions |
| Coverage | `jest --coverage` | Yes (80% branch/line) | Adequate test coverage |
| Codegen | `graphql-codegen --check` | Yes | Types match schema |

These are in addition to the org-level gates (CodeQL, SonarCloud, CodeRabbit, Copilot review).

---

## 8. Go-Specific Standards

### Error Types

Use structured GraphQL error codes consistently:

| Code | HTTP Analog | When |
|------|------------|------|
| `UNAUTHENTICATED` | 401 | No or invalid JWT |
| `FORBIDDEN` | 403 | Valid JWT but insufficient role/scope |
| `NOT_FOUND` | 404 | Resource doesn't exist or is soft-deleted |
| `VALIDATION_ERROR` | 400 | Input fails validation |
| `CONFLICT` | 409 | Duplicate check-in, 2-manager minimum violation |
| `INTERNAL` | 500 | Unexpected server error |

### Package Layout Rules

- `cmd/api/main.go` is the composition root — wires dependencies, starts server
- `internal/` packages are never imported by external code
- Each `internal/` package exposes an interface and a constructor
- No circular imports — dependency direction: `graph → {auth, db, events}`, never reverse

### Structured Logging

```go
// Use slog everywhere
slog.Info("vendor checked in",
    "vendor_id", vendorID,
    "market_id", marketID,
    "duration_ms", elapsed.Milliseconds(),
)

// NEVER use fmt.Println or log.Printf in production code
```

### Database Patterns

- All queries use `pgx` directly — no ORM
- All queries include `WHERE deleted_at IS NULL` for user-facing data
- All new domain tables MUST have the audit trigger attached in the migration
- Use `pgx.Pool` for connection management — never open individual connections
- Use `pgxpool.QueryRow` / `pgxpool.Query` with context for cancellation support

---

## 9. React Native / TypeScript Standards

### ESLint Rules (Enforced)

| Rule | Why |
|------|-----|
| `@typescript-eslint/no-floating-promises` | Forgotten `await` is the #1 async bug |
| `@typescript-eslint/strict-boolean-expressions` | Prevents truthy/falsy surprises |
| `@typescript-eslint/no-unused-vars` | Dead code removal |
| React hooks rules | Enforce rules of hooks and exhaustive deps |
| No `any` type | Use proper types from `@graphql-codegen` |

### TypeScript Configuration

- `strict: true` — enables all strict checks
- `noUncheckedIndexedAccess: true` — forces null checks on array/object indexing

### Component Patterns

```typescript
// GOOD: Gluestack components with NativeWind
import { Box, Text, Button, ButtonText } from '@/components/ui';

export function VendorCard({ vendor }: VendorCardProps) {
  return (
    <Box className="p-4 rounded-lg bg-background-50">
      <Text className="text-lg font-semibold">{vendor.name}</Text>
      <Button onPress={handleFollow}>
        <ButtonText>Follow</ButtonText>
      </Button>
    </Box>
  );
}

// BAD: Raw React Native components with inline styles
import { View, Text, TouchableOpacity } from 'react-native';

export function VendorCard({ vendor }) {
  return (
    <View style={{ padding: 16, backgroundColor: '#f0f0f0' }}>
      <Text style={{ fontSize: 18 }}>{vendor.name}</Text>
    </View>
  );
}
```

---

## 10. Story Implementation Protocol

When implementing any story, follow this exact sequence:

1. **Read the story** from epics document
2. **Read referenced FRs** from the PRD for full context
3. **Read architecture decisions** relevant to the story
4. **Read UX design specs** for any UI components
5. **Write failing tests** for each acceptance criterion (Red)
6. **Implement minimum code** to pass each test (Green)
7. **Refactor** while keeping tests green
8. **Verify pre-commit passes** before committing
9. **Run full test suite** to catch regressions

### Story Completion Checklist

Before marking a story as done:

- [ ] All acceptance criteria have corresponding tests
- [ ] All tests pass (unit + integration)
- [ ] Pre-commit hook passes (lint + format + type check + tests)
- [ ] Coverage meets minimum thresholds
- [ ] No `any` types introduced (TypeScript)
- [ ] No swallowed errors (Go)
- [ ] Audit trigger attached to any new domain tables
- [ ] Domain events published for any new mutations
- [ ] Soft-delete filtering applied to any new queries
- [ ] Accessibility labels on all interactive elements
- [ ] Error messages are user-friendly, not raw
- [ ] Design tokens used for all colors/spacing (no hardcoded values)

---

## 11. Naming Conventions

### Go Backend

| Category | Convention | Example |
|----------|-----------|---------|
| Packages | lowercase, single word | `auth`, `events`, `notify` |
| Files | snake_case | `auth_middleware.go`, `event_bus.go` |
| Types/interfaces | PascalCase | `EventHandler`, `MarketResolver` |
| Functions | PascalCase (exported), camelCase (unexported) | `NewResolver()`, `validateInput()` |
| Constants | PascalCase (exported) | `MaxRetryCount`, `DefaultTimeout` |
| Test files | `*_test.go` co-located | `middleware_test.go` |
| Integration tests | `//go:build integration` tag | Tagged build constraint |
| GraphQL schema | snake_case fields, PascalCase types | `vendor_status`, `MarketProfile` |
| DB tables | snake_case, plural | `market_vendors`, `audit_log` |
| DB columns | snake_case | `created_at`, `vendor_id` |
| Migrations | `NNNNNN_description.up.sql` / `.down.sql` | `000001_create_users.up.sql` |

### React Native Frontend

| Category | Convention | Example |
|----------|-----------|---------|
| Components | PascalCase file + export | `VendorCard.tsx`, `MarketList.tsx` |
| Hooks | camelCase with `use` prefix | `useVendorStatus.ts` |
| Utilities/lib | camelCase files | `apollo.ts`, `firebase.ts` |
| GraphQL files | camelCase.graphql | `getMarket.graphql`, `checkIn.graphql` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT`, `API_URL` |
| Test files | `*.test.tsx` co-located | `VendorCard.test.tsx` |
| Design tokens | `--color-{name}-{scale}` | `--color-primary-500` |

---

## References

- **[petry-projects Org AGENTS.md](https://github.com/petry-projects/.github/blob/main/AGENTS.md)** — Organization-wide engineering standards (TDD, SOLID, CLEAN, DRY, DDD, KISS, YAGNI, CI gates, BMAD)
- **Agents.md** — Project-level coding standards (component organization, styling, accessibility, anti-patterns)
- **Architecture** — `_bmad-output/planning-artifacts/architecture.md`
- **PRD** — `_bmad-output/planning-artifacts/prd.md`
- **UX Design** — `_bmad-output/planning-artifacts/ux-design-specification.md`
