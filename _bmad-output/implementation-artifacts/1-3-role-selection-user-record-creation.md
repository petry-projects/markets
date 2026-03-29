# Story 1.3: Role Selection & User Record Creation

Status: ready-for-dev

## Story

As a new user,
I want to select my role (customer, vendor, or market manager) after first sign-in,
so that the app presents the correct experience for my needs.

## Acceptance Criteria

1. **Given** a user who has just authenticated for the first time (no role custom claim) **When** they reach the role selection screen **Then** they see three options: Customer, Vendor, Market Manager **And** each option has a clear description of the role

2. **Given** a user selects a role **When** the selection is submitted **Then** a user record is created in Cloud SQL (users table with id, firebase_uid, role, name, email, created_at, deleted_at) **And** a Firebase custom claim `role` is set on the user's token via Firebase Admin SDK **And** the app navigates to the role-appropriate tab layout

3. **Given** a returning user with an existing role **When** they open the app **Then** they are routed directly to their role-specific tab layout without role selection

## Tasks / Subtasks

- [ ] Task 1: Users table migration (AC: #2)
  - [ ] 1.1 Create `migrations/000003_create_users.up.sql` with columns: `id` (UUID PK), `firebase_uid` (TEXT UNIQUE NOT NULL), `role` (TEXT NOT NULL CHECK (role IN ('customer', 'vendor', 'manager'))), `name` (TEXT NOT NULL), `email` (TEXT NOT NULL), `created_at` (TIMESTAMPTZ NOT NULL DEFAULT NOW()), `deleted_at` (TIMESTAMPTZ NULL)
  - [ ] 1.2 Create `migrations/000003_create_users.down.sql` (DROP TABLE users)
  - [ ] 1.3 Attach reusable audit trigger function to users table in the up migration
  - [ ] 1.4 Add index on `firebase_uid` for fast lookup

- [ ] Task 2: createUser GraphQL mutation (AC: #2)
  - [ ] 2.1 Define `createUser` mutation in `markets-api/internal/graph/schema/auth.graphqls` accepting role input
  - [ ] 2.2 Implement `createUser` resolver in `markets-api/internal/graph/auth.resolvers.go`
  - [ ] 2.3 Validate role input (must be one of: customer, vendor, manager) - return VALIDATION_ERROR for invalid roles
  - [ ] 2.4 Check for duplicate user (existing firebase_uid) - return CONFLICT error if user record already exists
  - [ ] 2.5 Insert user record into Cloud SQL users table via `internal/db/` repository
  - [ ] 2.6 Set Firebase custom claim `role` on the user's token via Firebase Admin SDK (`internal/auth/` or dedicated service)
  - [ ] 2.7 Publish `UserCreated{userId, role}` domain event after successful DB write via event bus

- [ ] Task 3: User repository (AC: #2)
  - [ ] 3.1 Define `UserRepository` interface in domain layer with `Create`, `FindByFirebaseUID` methods
  - [ ] 3.2 Implement `PgUserRepository` in `internal/db/` using pgx
  - [ ] 3.3 All queries must include `WHERE deleted_at IS NULL` filtering
  - [ ] 3.4 Map pgx rows to domain types at the boundary (anti-corruption layer)

- [ ] Task 4: Role selection screen UI (AC: #1)
  - [ ] 4.1 Create `app/(auth)/role-selection.tsx` screen
  - [ ] 4.2 Render three role options using Gluestack `<VStack>`, `<Box>`, `<Text>`, `<Heading>`, `<Button>`, `<ButtonText>`
  - [ ] 4.3 Each option displays role name and clear description of the role
  - [ ] 4.4 Add `accessibilityLabel` to all interactive elements
  - [ ] 4.5 Use design tokens from `config.ts` for all colors and spacing (no hardcoded hex)
  - [ ] 4.6 Add loading state during mutation submission
  - [ ] 4.7 Add user-friendly error message with retry option on mutation failure

- [ ] Task 5: Firebase custom claim setting (AC: #2)
  - [ ] 5.1 Use Firebase Admin SDK in Go backend to set custom claim `role` on the user's Firebase token
  - [ ] 5.2 Force token refresh on the client after claim is set so new JWT includes role claim
  - [ ] 5.3 Update expo-secure-store with refreshed JWT containing role claim

- [ ] Task 6: Role-based tab navigation routing (AC: #2, #3)
  - [ ] 6.1 Update `app/_layout.tsx` root layout with auth gate logic
  - [ ] 6.2 Read role from JWT custom claim (via `useAuth` hook)
  - [ ] 6.3 Route to `(customer)/` tab layout when role is "customer"
  - [ ] 6.4 Route to `(vendor)/` tab layout when role is "vendor"
  - [ ] 6.5 Route to `(manager)/` tab layout when role is "manager"
  - [ ] 6.6 Route to `(auth)/role-selection` when authenticated but no role claim (first-time user)

- [ ] Task 7: Returning user auto-routing (AC: #3)
  - [ ] 7.1 On app launch, check expo-secure-store for existing JWT
  - [ ] 7.2 If JWT exists and contains role claim, route directly to role-specific tabs
  - [ ] 7.3 If JWT exists but no role claim, route to role selection
  - [ ] 7.4 If no JWT, route to login screen

- [ ] Task 8: Tests (AC: #1, #2, #3)
  - [ ] 8.1 Write Go integration tests for createUser mutation (test cases 1.3.1, 1.3.2, 1.3.3)
  - [ ] 8.2 Write Go integration test for duplicate user rejection (test case 1.3.4)
  - [ ] 8.3 Write Go unit test for invalid role validation (test case 1.3.5)
  - [ ] 8.4 Write Go integration test for audit log entry creation (test case 1.3.6)
  - [ ] 8.5 Write Go integration test for required fields population (test case 1.3.7)
  - [ ] 8.6 Write React Native component test for role selection screen rendering (test case 1.3.8)
  - [ ] 8.7 Write React Native component tests for role-based navigation (test cases 1.3.9, 1.3.10, 1.3.11)
  - [ ] 8.8 Write React Native unit test for returning user bypass (test case 1.3.12)
  - [ ] 8.9 Write React Native component test for error with retry (test case 1.3.13)

## Dev Notes

### Users Table Schema

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE NOT NULL,
    role        TEXT NOT NULL CHECK (role IN ('customer', 'vendor', 'manager')),
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ NULL
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- Attach audit trigger (reusable function created in Story 1.1b)
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
```

All user-facing queries must filter `WHERE deleted_at IS NULL` per soft-delete pattern.

[Source: _bmad-output/planning-artifacts/epics.md#Story 1.3 - AC #2]
[Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture - Soft-delete]
[Source: _bmad-output/planning-artifacts/coding-standards.md#Database Patterns]

### Firebase Admin SDK Custom Claims

After creating the user record in Cloud SQL, the Go backend must set a custom claim on the user's Firebase token:

```go
// Set custom claim via Firebase Admin SDK
claims := map[string]interface{}{
    "role": role, // "customer" | "vendor" | "manager"
}
err := firebaseAuth.SetCustomUserClaims(ctx, firebaseUID, claims)
```

The client must force a token refresh after the claim is set so the new JWT includes the role. Store the refreshed JWT in expo-secure-store.

[Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security - Role storage]

### Domain Event: UserCreated

After successful DB write, publish the `UserCreated` domain event via the event bus:

```go
// internal/events/types.go
type UserCreated struct {
    UserID UserID
    Role   string
}
func (e UserCreated) EventType() string { return "user.created" }
```

Rules:
- Event published AFTER successful database write, never before
- Event NOT published if DB write fails
- Handler failure is logged but never rolls back the originating write

[Source: _bmad-output/planning-artifacts/coding-standards.md#Domain Events]

### Audit Trigger Verification

The audit trigger function (created in Story 1.1b) must be attached to the users table. On `createUser`, verify:
- `audit_log` entry exists with `action_type="user_created"`, `actor_id=uid`, `target_type="user"`, `target_id=new_user_id`
- PostgreSQL session variables `app.actor_id` and `app.actor_role` (set by auth middleware from Story 1.2) are captured by the trigger

[Source: _bmad-output/test-artifacts/epic-1-test-strategy.md#Section 7 - Audit Logging Verification]

### Role-Based Routing Architecture

The root layout (`app/_layout.tsx`) acts as an auth gate:

```
app/
├── (auth)/              # Login, role selection
├── (customer)/          # Customer tabs: discover, following, profile
├── (vendor)/            # Vendor tabs: markets, status, profile
├── (manager)/           # Manager tabs: dashboard, vendors, profile
└── _layout.tsx          # Root layout: auth gate + role-based routing
```

Routing logic:
1. No JWT -> `(auth)/login`
2. JWT without role claim -> `(auth)/role-selection`
3. JWT with role="customer" -> `(customer)/` tabs
4. JWT with role="vendor" -> `(vendor)/` tabs
5. JWT with role="manager" -> `(manager)/` tabs

[Source: Agents.md#Project Component Structure]

### GraphQL Error Codes for This Story

| Code | When |
|------|------|
| `VALIDATION_ERROR` | Invalid role value (not customer/vendor/manager) |
| `CONFLICT` | User record already exists for this firebase_uid |
| `INTERNAL` | Unexpected server error during creation |

[Source: _bmad-output/planning-artifacts/coding-standards.md#Error Types]

### Frontend Patterns

- Use Gluestack UI v3 components only - no raw React Native `<View>`, `<Text>`, `<TouchableOpacity>`
- All interactive elements must have `accessibilityLabel`
- Error messages: short, action-oriented with retry (e.g., "Role selection failed. Tap to retry.")
- Use design tokens from `config.ts` for colors/spacing
- Mock Apollo Client with `MockedProvider`, mock `expo-secure-store` and Firebase SDK in tests

[Source: Agents.md#Component Organization, #Accessibility Requirements, #Anti-Patterns]

### Repository Pattern

Define the user repository interface in the domain layer, implement in infrastructure:

```go
// Domain port (internal/auth/ or internal/user/)
type UserRepository interface {
    Create(ctx context.Context, user *User) error
    FindByFirebaseUID(ctx context.Context, firebaseUID string) (*User, error)
}

// Infrastructure adapter (internal/db/user_repo.go)
type PgUserRepository struct {
    pool *pgxpool.Pool
}
```

Domain code never imports `pgx`. Only `internal/db/` imports the database driver.

[Source: _bmad-output/planning-artifacts/coding-standards.md#Repository Interfaces (Ports)]

### Test Cases (from Epic 1 Test Strategy)

**Go Backend:**

| ID | Test Case | Type |
|----|-----------|------|
| 1.3.1 | Create user with customer role | Integration |
| 1.3.2 | Create user with vendor role | Integration |
| 1.3.3 | Create user with manager role | Integration |
| 1.3.4 | Reject duplicate user creation (CONFLICT) | Integration |
| 1.3.5 | Reject invalid role (VALIDATION_ERROR) | Unit |
| 1.3.6 | Audit log entry created after user creation | Integration |
| 1.3.7 | User record includes all required fields, deleted_at is NULL | Integration |

**React Native:**

| ID | Test Case | Type |
|----|-----------|------|
| 1.3.8 | Role selection screen renders three options with descriptions | Component |
| 1.3.9 | Selecting customer role navigates to (customer)/ tabs | Component |
| 1.3.10 | Selecting vendor role navigates to (vendor)/ tabs | Component |
| 1.3.11 | Selecting manager role navigates to (manager)/ tabs | Component |
| 1.3.12 | Returning user with role claim bypasses role selection | Unit (hook) |
| 1.3.13 | Role selection error shows retry option | Component |

[Source: _bmad-output/test-artifacts/epic-1-test-strategy.md#Section 4]

### Domain Event Verification

The `createUser` mutation must publish `UserCreated{userId, role}` after successful write. Tests must verify:
- Event is published after successful DB write
- Event is NOT published if DB write fails
- Event handlers receive the event with correct data
- Handler failure does not roll back the DB write

[Source: _bmad-output/test-artifacts/epic-1-test-strategy.md#Section 7 - Domain Event Publishing]

### Project Structure Notes

**Backend files to create/modify:**
- `migrations/000003_create_users.up.sql` - Users table DDL with audit trigger
- `migrations/000003_create_users.down.sql` - Drop users table
- `markets-api/internal/graph/auth.resolvers.go` - `createUser` mutation resolver
- `markets-api/internal/graph/auth.resolvers_test.go` - Resolver tests
- `markets-api/internal/db/user_repo.go` - `PgUserRepository` implementation
- `markets-api/internal/graph/schema/auth.graphqls` - `createUser` mutation definition

**Frontend files to create/modify:**
- `app/(auth)/role-selection.tsx` - Role selection screen
- `app/_layout.tsx` - Root layout with auth gate and role-based routing
- `hooks/useAuth.ts` - Extend with role detection and routing logic

**Alignment with architecture:** Paths follow the project structure defined in architecture.md. The users table is migration 001 per the architecture migration numbering. The `createUser` resolver lives in `auth.resolvers.go` per the Auth bounded context. Only `internal/db/` imports `pgx`, only `internal/auth/` imports Firebase Admin SDK.

[Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]

### Dependencies

- **Requires Story 1.2 complete:** Authentication must work (Firebase Auth, JWT storage, auth middleware, Apollo Client auth headers) before users can reach role selection

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3]
- [Source: _bmad-output/planning-artifacts/architecture.md#Authentication & Security - Role storage]
- [Source: _bmad-output/planning-artifacts/architecture.md#Data Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#Database Patterns]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#Domain Events]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#Repository Interfaces (Ports)]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#Error Types]
- [Source: _bmad-output/planning-artifacts/coding-standards.md#Anti-Corruption Layer]
- [Source: _bmad-output/test-artifacts/epic-1-test-strategy.md#Section 4 (Test Cases 1.3.1-1.3.13)]
- [Source: _bmad-output/test-artifacts/epic-1-test-strategy.md#Section 7 (Audit + Domain Events)]
- [Source: Agents.md#Project Component Structure]
- [Source: Agents.md#Accessibility Requirements]
- [Source: Agents.md#Anti-Patterns]

## Dev Agent Record

### Agent Model Used

<!-- To be filled by implementing agent -->

### Debug Log References

### Completion Notes List

### File List
