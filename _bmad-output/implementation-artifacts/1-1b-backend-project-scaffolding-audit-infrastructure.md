# Story 1.1b: Backend Project Scaffolding & Audit Infrastructure

Status: ready-for-dev

## Story

As a developer,
I want the Go backend and cloud infrastructure initialized with audit logging from day one,
So that backend development can begin and all write operations are logged from the start.

## Acceptance Criteria

**Given** a fresh development environment
**When** the backend setup is run
**Then** the Go backend is scaffolded with gqlgen init, pgx v5, firebase-admin-go, chi router, slog, and golang-migrate
**And** Cloud SQL PostgreSQL instance is provisioned with auth proxy configured
**And** Firebase project is created with Auth (Google + Apple providers), Realtime Database, FCM, and Analytics enabled
**And** GraphQL schema files are created for the 6 domain schemas (auth, market, vendor, customer, notification, audit)
**And** the audit_log table is created via migration (id, actor_id, actor_role, action_type, target_type, target_id, market_id, timestamp, payload) with append-only enforcement -- no UPDATE or DELETE permitted (FR35, FR36, NFR12)
**And** a reusable PostgreSQL audit trigger function is created that automatically inserts audit_log rows on INSERT/UPDATE/DELETE for any domain table it is attached to, capturing actor identity from session variables (`app.actor_id`, `app.actor_role`)
**And** Go auth middleware sets PostgreSQL session variables (`SET LOCAL app.actor_id`, `SET LOCAL app.actor_role`) from the Firebase JWT on each request
**And** a Go domain event bus (`internal/events/`) is implemented with publish/subscribe pattern, event type definitions, and handler registration
**And** event handlers are created for Firebase Realtime writes (`internal/realtime/`) and FCM push dispatch (`internal/notify/`) that subscribe to domain events
**And** CI workflow exists for backend (lint, test, build)
**And** a test runner is configured (Go test) and a smoke test passes

## Tasks / Subtasks

### Task 1: Go Module Initialization

- [ ] 1.1 Create `markets-api/` directory at project root
- [ ] 1.2 Run `go mod init github.com/petry-projects/markets-api`
- [ ] 1.3 Run `go get github.com/99designs/gqlgen@latest`
- [ ] 1.4 Run `go run github.com/99designs/gqlgen init` to scaffold the `graph/` directory
- [ ] 1.5 Move `graph/` contents into `internal/graph/` to match production project structure
- [ ] 1.6 Update `gqlgen.yml` to reflect `internal/graph/` paths

### Task 2: Install Dependencies

- [ ] 2.1 `go get github.com/jackc/pgx/v5` -- PostgreSQL driver
- [ ] 2.2 `go get firebase.google.com/go/v4` -- Firebase Admin SDK (auth, FCM, Realtime)
- [ ] 2.3 `go get github.com/go-chi/chi/v5` -- HTTP router for mounting gqlgen handler
- [ ] 2.4 `go get github.com/golang-migrate/migrate/v4` -- database migration management
- [ ] 2.5 `go get github.com/go-playground/validator/v10` -- struct/input validation
- [ ] 2.6 `go get github.com/spf13/viper` -- configuration management
- [ ] 2.7 Verify `go mod tidy` produces a clean `go.sum`

### Task 3: Create Production Project Structure

- [ ] 3.1 Create `cmd/api/main.go` -- entry point and composition root
- [ ] 3.2 Create `internal/auth/` -- Firebase JWT middleware, role resolution
- [ ] 3.3 Create `internal/graph/schema/` -- split GraphQL schema files by domain
- [ ] 3.4 Create `internal/graph/model/` -- generated + custom Go models
- [ ] 3.5 Create `internal/graph/resolver.go` -- root resolver with injected dependencies
- [ ] 3.6 Create `internal/audit/` -- audit query helpers (reads only; writes are DB triggers)
- [ ] 3.7 Create `internal/events/` -- domain event bus
- [ ] 3.8 Create `internal/notify/` -- FCM push notification handler
- [ ] 3.9 Create `internal/realtime/` -- Firebase Realtime Database write handler
- [ ] 3.10 Create `internal/db/` -- Cloud SQL connection pool, query helpers
- [ ] 3.11 Create `internal/middleware/` -- HTTP middleware chain (auth, logging, CORS)
- [ ] 3.12 Create `internal/domain/` -- shared value objects (typed IDs)
- [ ] 3.13 Create `migrations/` -- SQL migration files directory

### Task 4: Create 6 Domain GraphQL Schema Files

- [ ] 4.1 Create `internal/graph/schema/auth.graphqls` -- authentication types, login/signup mutations
- [ ] 4.2 Create `internal/graph/schema/market.graphqls` -- market profile, schedule, roster types and queries/mutations
- [ ] 4.3 Create `internal/graph/schema/vendor.graphqls` -- vendor profile, product catalog, check-in types and queries/mutations
- [ ] 4.4 Create `internal/graph/schema/customer.graphqls` -- customer profile, follows, discovery queries
- [ ] 4.5 Create `internal/graph/schema/notification.graphqls` -- notification preferences, device token types
- [ ] 4.6 Create `internal/graph/schema/audit.graphqls` -- audit log query types (read-only, no mutations)
- [ ] 4.7 Run `go run github.com/99designs/gqlgen generate` and verify schema validity
- [ ] 4.8 Run `go run github.com/99designs/gqlgen validate` to confirm schema consistency

### Task 5: Cloud SQL PostgreSQL Setup

- [ ] 5.1 Document Cloud SQL instance configuration (PostgreSQL 15+, dev tier)
- [ ] 5.2 Document Cloud SQL Auth Proxy configuration for local development
- [ ] 5.3 Create `internal/db/pool.go` with `pgxpool.Pool` initialization using connection string from environment/config
- [ ] 5.4 Create `internal/db/helpers.go` with shared query utilities (soft-delete filtering, pagination)

### Task 6: Create Migration -- audit_log Table (Append-Only)

- [ ] 6.1 Create `migrations/000001_create_audit_log.up.sql`:
  - Table: `audit_log` with columns: `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`, `actor_id TEXT NOT NULL`, `actor_role TEXT NOT NULL`, `action_type TEXT NOT NULL`, `target_type TEXT NOT NULL`, `target_id TEXT NOT NULL`, `market_id TEXT`, `timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()`, `payload JSONB`
  - Revoke UPDATE and DELETE on `audit_log` to enforce append-only
  - Create index on `(target_type, target_id)` and `(actor_id)` and `(market_id)`
- [ ] 6.2 Create `migrations/000001_create_audit_log.down.sql` (drop table)

### Task 7: Create Reusable PostgreSQL Audit Trigger Function

- [ ] 7.1 Create `migrations/000002_create_audit_trigger_function.up.sql`:
  - Function `audit_trigger_func()` that reads `current_setting('app.actor_id', true)` and `current_setting('app.actor_role', true)` from session variables
  - On INSERT: inserts audit row with action_type='INSERT', payload=NEW row as JSONB
  - On UPDATE: inserts audit row with action_type='UPDATE', payload=jsonb_build_object('old', OLD, 'new', NEW)
  - On DELETE: inserts audit row with action_type='DELETE', payload=OLD row as JSONB
  - Sets target_type from TG_TABLE_NAME, target_id from NEW.id or OLD.id
- [ ] 7.2 Create `migrations/000002_create_audit_trigger_function.down.sql` (drop function)

### Task 8: Create Go Auth Middleware

- [ ] 8.1 Create `internal/auth/middleware.go`:
  - HTTP middleware that extracts `Authorization: Bearer <token>` header
  - Validates token via Firebase Admin SDK `auth.Client.VerifyIDToken()`
  - Extracts `uid` and `role` custom claim from verified token
  - Stores uid and role in request context for resolver access
- [ ] 8.2 Create `internal/auth/context.go`:
  - Context key types and helper functions: `UserIDFromContext(ctx)`, `RoleFromContext(ctx)`
- [ ] 8.3 Create `internal/auth/session.go`:
  - Function to set PostgreSQL session variables within a transaction:
    ```
    SET LOCAL app.actor_id = '<uid>';
    SET LOCAL app.actor_role = '<role>';
    ```
  - This must be called at the start of every database transaction so the audit trigger can read the values
- [ ] 8.4 Create `internal/auth/middleware_test.go`:
  - Test: valid JWT populates context
  - Test: expired JWT returns UNAUTHENTICATED
  - Test: missing Authorization header returns UNAUTHENTICATED
  - Test: malformed token returns UNAUTHENTICATED

### Task 9: Create Domain Event Bus

- [ ] 9.1 Create `internal/events/types.go`:
  - `Event` interface with `EventType() string` method
  - Initial event type structs: `VendorCheckedIn`, `UserCreated`, `ManagerAssigned`
  - Each struct implements `EventType()` returning a dotted string (e.g., `"vendor.checked_in"`)
- [ ] 9.2 Create `internal/events/bus.go`:
  - `Handler` interface with `Handle(ctx context.Context, event Event) error`
  - `Bus` struct with `handlers []Handler`
  - `NewBus() *Bus` constructor
  - `Subscribe(handler Handler)` method to register handlers
  - `Publish(ctx context.Context, event Event)` method that iterates all handlers:
    - Handler failures are logged via `slog.Error` but do NOT roll back the originating DB write
    - Events are processed synchronously (in-request) -- no external message broker at pilot scale
- [ ] 9.3 Create `internal/events/bus_test.go`:
  - Test: published event is received by subscribed handler
  - Test: multiple handlers all receive the same event
  - Test: handler failure does not affect other handlers
  - Test: handler failure is logged

### Task 10: Create Firebase Realtime Handler

- [ ] 10.1 Create `internal/realtime/handler.go`:
  - Struct implementing `events.Handler` interface
  - `NewHandler(firebaseDB)` constructor accepting Firebase Realtime Database client
  - `Handle()` method writes vendor status to Firebase Realtime path: `/markets/{marketId}/vendors/{vendorId}/status`
  - Handles relevant event types (e.g., `VendorCheckedIn`)
- [ ] 10.2 Create `internal/realtime/handler_test.go`:
  - Test with mock Firebase client: correct path written for VendorCheckedIn event
  - Test: irrelevant event types are ignored gracefully

### Task 11: Create FCM Push Handler

- [ ] 11.1 Create `internal/notify/handler.go`:
  - Struct implementing `events.Handler` interface
  - `NewHandler(fcmClient)` constructor accepting Firebase Cloud Messaging client
  - `Handle()` method dispatches push notifications for relevant event types
- [ ] 11.2 Create `internal/notify/handler_test.go`:
  - Test with mock FCM client: notification dispatched for relevant events
  - Test: irrelevant event types are ignored gracefully

### Task 12: Set Up CI Workflow

- [ ] 12.1 Create `.github/workflows/backend-ci.yml`:
  - Trigger: push and PR to main for `markets-api/**` paths
  - Jobs: lint, test, build
  - Lint step: `golangci-lint run ./...`
  - Test step: `go test ./... -short -count=1 -coverprofile=coverage.out`
  - Build step: `go build ./cmd/api/`
  - Schema validation step: `go run github.com/99designs/gqlgen validate`
  - Coverage threshold: 80% line coverage

### Task 13: Configure golangci-lint

- [ ] 13.1 Create `markets-api/.golangci.yml`:
  - Enable linters: `errcheck`, `govet`, `staticcheck`, `unused`, `gosimple`, `ineffassign`, `typecheck`, `misspell`, `gofmt`, `goimports`
  - Set timeout appropriate for CI
  - Exclude generated files (`internal/graph/generated/`)

### Task 14: Set Up Pre-Commit Hooks

- [ ] 14.1 Create `markets-api/.githooks/pre-commit`:
  - Run `golangci-lint run ./...`
  - Run `go test ./... -short -count=1`
- [ ] 14.2 Document `git config core.hooksPath .githooks` in README or setup script

### Task 15: Write Smoke Test

- [ ] 15.1 Create `cmd/api/main_test.go` (or `internal/graph/smoke_test.go`):
  - Test: HTTP server starts and responds to health check endpoint (`GET /healthz` returns 200)
  - Test: GraphQL endpoint is mounted and responds (POST to `/query` with introspection query)
- [ ] 15.2 Verify `go test ./...` passes with all tests green
- [ ] 15.3 Verify `gqlgen validate` passes

## Dev Notes

### Exact Initialization Commands

```bash
# From project root
mkdir -p markets-api && cd markets-api

# Initialize Go module
go mod init github.com/petry-projects/markets-api

# Install gqlgen and initialize
go get github.com/99designs/gqlgen@latest
go run github.com/99designs/gqlgen init

# Move generated graph/ to internal/graph/
mkdir -p internal
mv graph internal/graph

# Install all dependencies
go get github.com/jackc/pgx/v5
go get github.com/jackc/pgx/v5/pgxpool
go get firebase.google.com/go/v4
go get github.com/go-chi/chi/v5
go get github.com/golang-migrate/migrate/v4
go get github.com/go-playground/validator/v10
go get github.com/spf13/viper

go mod tidy
```

### Package Layout (DDD Bounded Contexts)

Each `internal/` package maps to one bounded context. The full structure:

```
markets-api/
├── cmd/api/main.go              # Entry point, composition root (wires all dependencies)
├── internal/
│   ├── auth/                    # Bounded context: Auth
│   │   ├── middleware.go        # Firebase JWT validation HTTP middleware
│   │   ├── context.go           # Context helpers: UserIDFromContext(), RoleFromContext()
│   │   ├── session.go           # SET LOCAL session variables for PostgreSQL audit
│   │   ├── claims.go            # Firebase claim extraction and mapping
│   │   └── middleware_test.go
│   ├── graph/                   # Bounded context: Graph (resolver orchestration)
│   │   ├── schema/
│   │   │   ├── auth.graphqls
│   │   │   ├── market.graphqls
│   │   │   ├── vendor.graphqls
│   │   │   ├── customer.graphqls
│   │   │   ├── notification.graphqls
│   │   │   └── audit.graphqls
│   │   ├── model/               # Generated + custom Go models
│   │   ├── generated/           # gqlgen generated code (DO NOT EDIT)
│   │   ├── resolver.go          # Root resolver struct with dependency injection
│   │   └── *.resolvers.go       # Generated resolver stubs (one per schema file)
│   ├── domain/                  # Shared value objects
│   │   └── ids.go               # Typed IDs: UserID, MarketID, VendorID, CheckInID, etc.
│   ├── audit/                   # Bounded context: Audit (read-only query helpers)
│   │   └── queries.go           # AuditQuerier interface, query audit_log table
│   ├── events/                  # Bounded context: Events (infrastructure)
│   │   ├── types.go             # Event interface + concrete event type structs
│   │   ├── bus.go               # Bus struct: Subscribe(), Publish()
│   │   └── bus_test.go
│   ├── notify/                  # Bounded context: Notification (infrastructure)
│   │   ├── handler.go           # FCM push dispatch, implements events.Handler
│   │   └── handler_test.go
│   ├── realtime/                # Bounded context: Realtime (infrastructure)
│   │   ├── handler.go           # Firebase Realtime DB writes, implements events.Handler
│   │   └── handler_test.go
│   ├── db/                      # Infrastructure: database
│   │   ├── pool.go              # pgxpool.Pool initialization
│   │   └── helpers.go           # Shared query utilities
│   └── middleware/              # HTTP middleware chain
│       └── chain.go             # Auth, logging, CORS middleware composition
├── migrations/
│   ├── 000001_create_audit_log.up.sql
│   ├── 000001_create_audit_log.down.sql
│   ├── 000002_create_audit_trigger_function.up.sql
│   └── 000002_create_audit_trigger_function.down.sql
├── gqlgen.yml                   # gqlgen configuration (paths point to internal/graph/)
├── .golangci.yml                # golangci-lint configuration
├── .githooks/pre-commit         # Pre-commit: lint + short tests
├── Dockerfile                   # Cloud Run container
├── go.mod
├── go.sum
└── .github/workflows/
    └── backend-ci.yml           # CI: lint, test, build, schema validate
```

### Dependency Direction Rules

These are hard rules from the coding standards -- violations must be caught in code review:

- **Domain packages** (`market/`, `vendor/`, `customer/`) import NOTHING from infrastructure (`db/`, `notify/`, `realtime/`)
- **Domain packages** never import each other -- cross-domain communication is via domain events only
- **`internal/graph/`** (resolvers) may import domain packages but NOT infrastructure directly
- **Only `cmd/api/main.go`** knows about all packages -- it is the sole composition root where concrete types are wired to interfaces
- **Only `internal/db/`** imports `pgx`
- **Only `internal/auth/`** imports `firebase-admin-go` for JWT validation
- **Only `internal/notify/`** imports `firebase-admin-go` for FCM dispatch
- **Only `internal/realtime/`** imports Firebase Realtime Database client

### Audit Trigger SQL

#### Migration 000001: audit_log table

```sql
-- 000001_create_audit_log.up.sql
CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    TEXT NOT NULL,
    actor_role  TEXT NOT NULL,
    action_type TEXT NOT NULL,        -- 'INSERT', 'UPDATE', 'DELETE'
    target_type TEXT NOT NULL,        -- table name (e.g., 'vendors', 'check_ins')
    target_id   TEXT NOT NULL,        -- primary key of affected row
    market_id   TEXT,                 -- nullable; set when action is market-scoped
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload     JSONB                 -- old/new row data as JSON
);

-- Append-only enforcement: revoke UPDATE and DELETE
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;

-- Indexes for common query patterns
CREATE INDEX idx_audit_log_target ON audit_log (target_type, target_id);
CREATE INDEX idx_audit_log_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_log_market ON audit_log (market_id) WHERE market_id IS NOT NULL;
CREATE INDEX idx_audit_log_timestamp ON audit_log (timestamp);
```

```sql
-- 000001_create_audit_log.down.sql
DROP TABLE IF EXISTS audit_log;
```

#### Migration 000002: Reusable audit trigger function

```sql
-- 000002_create_audit_trigger_function.up.sql
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id   TEXT;
    v_actor_role TEXT;
    v_target_id  TEXT;
    v_payload    JSONB;
    v_market_id  TEXT;
BEGIN
    -- Read session variables set by Go auth middleware (SET LOCAL)
    v_actor_id   := current_setting('app.actor_id', true);
    v_actor_role := current_setting('app.actor_role', true);

    -- Default to 'system' if session variables are not set (e.g., migrations, cron jobs)
    IF v_actor_id IS NULL OR v_actor_id = '' THEN
        v_actor_id := 'system';
    END IF;
    IF v_actor_role IS NULL OR v_actor_role = '' THEN
        v_actor_role := 'system';
    END IF;

    -- Determine target_id and payload based on operation
    IF TG_OP = 'INSERT' THEN
        v_target_id := NEW.id::TEXT;
        v_payload   := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_target_id := NEW.id::TEXT;
        v_payload   := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        v_target_id := OLD.id::TEXT;
        v_payload   := to_jsonb(OLD);
    END IF;

    -- Attempt to extract market_id if the column exists on the source table
    IF TG_OP = 'DELETE' THEN
        BEGIN
            EXECUTE format('SELECT ($1).%I::TEXT', 'market_id') USING OLD INTO v_market_id;
        EXCEPTION WHEN undefined_column THEN
            v_market_id := NULL;
        END;
    ELSE
        BEGIN
            EXECUTE format('SELECT ($1).%I::TEXT', 'market_id') USING NEW INTO v_market_id;
        EXCEPTION WHEN undefined_column THEN
            v_market_id := NULL;
        END;
    END IF;

    INSERT INTO audit_log (actor_id, actor_role, action_type, target_type, target_id, market_id, payload)
    VALUES (v_actor_id, v_actor_role, TG_OP, TG_TABLE_NAME, v_target_id, v_market_id, v_payload);

    -- Always return the appropriate row so the original operation proceeds
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
```

```sql
-- 000002_create_audit_trigger_function.down.sql
DROP FUNCTION IF EXISTS audit_trigger_func() CASCADE;
```

**Attaching the trigger to a domain table** (example for future migrations):

```sql
-- In any migration that creates a domain table:
CREATE TRIGGER audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON <table_name>
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

### Event Bus Implementation Pattern

Events are processed synchronously in-request on Cloud Run (no external message broker at pilot scale):

```go
// internal/events/types.go
type Event interface {
    EventType() string
}

type VendorCheckedIn struct {
    VendorID  string
    MarketID  string
    Timestamp time.Time
}
func (e VendorCheckedIn) EventType() string { return "vendor.checked_in" }

type UserCreated struct {
    UserID string
    Role   string
}
func (e UserCreated) EventType() string { return "user.created" }
```

```go
// internal/events/bus.go
type Handler interface {
    Handle(ctx context.Context, event Event) error
}

type Bus struct {
    handlers []Handler
}

func NewBus() *Bus {
    return &Bus{}
}

func (b *Bus) Subscribe(h Handler) {
    b.handlers = append(b.handlers, h)
}

func (b *Bus) Publish(ctx context.Context, event Event) {
    for _, h := range b.handlers {
        if err := h.Handle(ctx, event); err != nil {
            slog.Error("event handler failed",
                "event", event.EventType(),
                "error", err,
            )
            // Handler failure is logged but does NOT roll back the DB write
        }
    }
}
```

Key rules:
- Events are published AFTER successful database writes -- never before, never speculatively
- Events are NOT published if the DB write fails
- Each handler is independently testable and can fail without blocking other handlers
- Audit logging is NOT a domain event handler -- it is guaranteed at the database level via PostgreSQL triggers
- Handler failure is logged via slog but never rolls back the originating write (NFR7)

### Auth Middleware Pattern

```go
// internal/auth/middleware.go
func NewMiddleware(firebaseAuth *auth.Client) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            token := extractBearerToken(r)
            if token == "" {
                http.Error(w, `{"errors":[{"message":"missing authorization","extensions":{"code":"UNAUTHENTICATED"}}]}`, 401)
                return
            }

            verified, err := firebaseAuth.VerifyIDToken(r.Context(), token)
            if err != nil {
                http.Error(w, `{"errors":[{"message":"invalid token","extensions":{"code":"UNAUTHENTICATED"}}]}`, 401)
                return
            }

            uid := verified.UID
            role, _ := verified.Claims["role"].(string)

            ctx := context.WithValue(r.Context(), userIDKey, uid)
            ctx = context.WithValue(ctx, roleKey, role)

            next.ServeHTTP(w, r.WithContext(ctx))
        })
    }
}
```

### Session Variable Injection (for Audit Triggers)

```go
// internal/auth/session.go
func SetSessionVars(ctx context.Context, tx pgx.Tx, uid string, role string) error {
    _, err := tx.Exec(
        ctx,
        "select set_config('app.actor_id', $1, true), set_config('app.actor_role', $2, true)",
        uid,
        role,
    )
    return err
}
```

This must be called at the beginning of every database transaction so PostgreSQL triggers can read `app.actor_id` and `app.actor_role` via `current_setting()`.

### Structured Logging with slog

All logging uses the `log/slog` package (standard library in Go 1.21+). Never use `fmt.Println` or `log.Printf` in production code.

```go
// Contextual structured logging
slog.Info("vendor checked in",
    "vendor_id", vendorID,
    "market_id", marketID,
    "duration_ms", elapsed.Milliseconds(),
)

slog.Error("event handler failed",
    "event", event.EventType(),
    "error", err,
)

slog.Warn("session variable not set, defaulting to system",
    "setting", "app.actor_id",
)
```

### Database Patterns

- **Connection pool**: Use `pgxpool.Pool` -- never open individual connections
- **Soft-delete**: All user-facing tables include `deleted_at TIMESTAMPTZ NULL`; all queries filter `WHERE deleted_at IS NULL`
- **Audit triggers**: Every new domain table MUST have the audit trigger attached in its migration
- **Parameterized queries**: Always use parameterized queries via pgx (`$1`, `$2`) -- never string concatenation
- **Context propagation**: All queries use `ctx` parameter for cancellation support
- **No ORM**: All queries use `pgx` directly -- full SQL control, no GORM

### Composition Root Pattern (cmd/api/main.go)

```go
func main() {
    // Load config
    cfg := loadConfig()

    // Initialize infrastructure
    pool := db.NewPool(cfg.DatabaseURL)
    firebaseApp := initFirebase(cfg)
    authClient := firebaseApp.Auth(ctx)
    fcmClient := firebaseApp.Messaging(ctx)
    firebaseDB := firebaseApp.Database(ctx)

    // Create handlers
    eventBus := events.NewBus()
    realtimeHandler := realtime.NewHandler(firebaseDB)
    notifyHandler := notify.NewHandler(fcmClient)
    eventBus.Subscribe(realtimeHandler)
    eventBus.Subscribe(notifyHandler)

    // Create resolver with dependencies
    resolver := graph.NewResolver(pool, eventBus)

    // Wire HTTP server
    r := chi.NewRouter()
    r.Use(auth.NewMiddleware(authClient))
    r.Handle("/query", graphqlHandler(resolver))
    r.Get("/healthz", healthCheck)

    // Start server
    slog.Info("server starting", "port", cfg.Port)
    http.ListenAndServe(":"+cfg.Port, r)
}
```

### GraphQL Error Codes

| Code | HTTP Analog | When to Use |
|------|------------|-------------|
| `UNAUTHENTICATED` | 401 | No or invalid JWT |
| `FORBIDDEN` | 403 | Valid JWT but insufficient role/scope |
| `NOT_FOUND` | 404 | Resource does not exist or is soft-deleted |
| `VALIDATION_ERROR` | 400 | Input fails validation (go-playground/validator) |
| `CONFLICT` | 409 | Duplicate check-in, 2-manager minimum violation |
| `INTERNAL` | 500 | Unexpected server error |

Error response format:

```go
func gqlError(ctx context.Context, code string, message string) error {
    return &gqlerror.Error{
        Message: message,
        Extensions: map[string]interface{}{
            "code": code,
        },
    }
}
```

### Test Requirements (from Epic 1 Test Strategy)

Story 1.1b is DONE when:
- [ ] `go test ./...` passes with at least one test
- [ ] A smoke test starts the HTTP server and responds to health check
- [ ] `gqlgen validate` passes (schema is valid)
- [ ] `golangci-lint` passes
- [ ] Migrations run up and down cleanly
- [ ] Audit trigger function exists and fires on test table insert
- [ ] Event bus publishes and receives a test event

Recommended test tooling for this story:
- `testcontainers-go` for spinning up PostgreSQL in Docker for integration tests
- `httptest` for HTTP handler testing (middleware and GraphQL endpoint)
- Coverage reporting via `go tool cover` with 80% line coverage threshold

### Project Structure Notes

The backend project structure follows the architecture defined in architecture.md section "Production Project Structure":

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

### References

| Document | Location | Relevant Sections |
|----------|----------|-------------------|
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` | Lines 225-246: Story 1.1b acceptance criteria |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | Lines 125-180: Backend starter, project structure; Lines 196-320: Data architecture, auth, API patterns, event bus |
| Coding Standards | `_bmad-output/planning-artifacts/coding-standards.md` | Sections 2 (SOLID), 4 (CLEAN), 5 (DDD: bounded contexts, aggregates, repositories, events, dependency direction), 6 (pre-commit), 7 (CI), 8 (Go-specific) |
| Epic 1 Test Strategy | `_bmad-output/test-artifacts/epic-1-test-strategy.md` | Section 2: Test framework setup, scaffolding verification checklist; Section 7: Cross-cutting audit/event requirements |

## Dev Agent Record

### Agent Model Used

(To be filled by implementing agent)

### Debug Log References

(To be filled by implementing agent)

### Completion Notes List

(To be filled by implementing agent)

### File List

(To be filled by implementing agent -- list all files created or modified)
