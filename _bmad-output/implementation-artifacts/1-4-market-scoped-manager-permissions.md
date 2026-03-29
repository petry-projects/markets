# Story 1.4: Market-Scoped Manager Permissions

> **Epic:** 1 - Authentication & Role-Based Access
> **Sprint:** 1
> **Story Points:** (estimated by team)
> **Priority:** High
> **Status:** Ready for Dev

---

## User Story

**As a** system administrator,
**I want** manager permissions scoped to specific markets,
**So that** managers can only administer markets they are assigned to.

---

## Acceptance Criteria

**Given** a market_managers junction table (manager_id, market_id, created_at)
**When** a manager attempts to access a market's data via GraphQL
**Then** the Go resolver queries market_managers to verify the manager is assigned to that market
**And** returns FORBIDDEN if not authorized

**Given** a manager assigned to Market A but not Market B
**When** they query Market B vendor roster
**Then** the request is rejected with FORBIDDEN error code

**Given** a market with two assigned managers
**When** either manager queries the market dashboard
**Then** both see the same shared state (vendor statuses, attendance counts)

**Given** an attempt to reduce a market below 2 managers
**When** a remove-manager mutation is called
**Then** the system rejects the request if it would leave fewer than 2 managers (FR41a)

---

## Tasks / Subtasks

### Task 1: market_managers Junction Table Migration

- [ ] Create migration file in `migrations/` for `market_managers` table
  - Columns: `id` (PK), `manager_id` (FK to users), `market_id` (FK to markets), `created_at` (timestamptz, default now())
  - Unique constraint on `(manager_id, market_id)` to prevent duplicate assignments
  - Foreign key constraints with appropriate ON DELETE behavior
- [ ] Create corresponding down migration for rollback safety
- [ ] Write integration test: migrate up, verify schema, migrate down cleanly

### Task 2: Audit Trigger on market_managers

- [ ] Attach the shared audit trigger function to the `market_managers` table
  - Reuse the existing PostgreSQL audit trigger (single trigger function, attached per table)
  - Trigger fires on INSERT and DELETE operations
- [ ] Write integration test: insert into market_managers, verify audit_log entry with action_type, actor_id, target_type="market_managers", target_id

### Task 3: Go Scope-Check Helper

- [ ] Create scope-check function in the market repository adapter (`internal/db/market_repo.go`):
  ```go
  func (r *PgMarketRepository) IsManagerAssigned(ctx context.Context, managerID UserID, marketID MarketID) (bool, error)
  ```
  - Queries `market_managers` table: `SELECT EXISTS(SELECT 1 FROM market_managers WHERE manager_id = $1 AND market_id = $2)`
  - Uses parameterized queries (no string interpolation)
- [ ] Define interface method on `MarketRepository` port (`internal/market/repository.go`):
  ```go
  IsManagerAssigned(ctx context.Context, managerID UserID, marketID MarketID) (bool, error)
  ```
- [ ] Write unit test (1.4.7): mock repository, verify scope check queries with correct manager_id
- [ ] Write integration test (1.4.1, 1.4.2): assigned manager returns true, unassigned returns false

### Task 4: Resolver-Level Scope Enforcement

- [ ] Add scope-check call to every manager-only resolver that operates on market data
  - Extract user ID and role from context (reuse `internal/auth/` context helpers)
  - If role == "manager", call `IsManagerAssigned(ctx, managerID, marketID)`
  - If not assigned, return `gqlError(ctx, "FORBIDDEN", "not authorized for this market")`
- [ ] Write unit test (1.4.2): unassigned manager receives FORBIDDEN
- [ ] Write integration test (1.4.1): assigned manager accesses market data successfully
- [ ] Write integration test (1.4.3): two managers assigned to same market see identical shared state

### Task 5: 2-Manager Minimum Validation (FR41a)

- [ ] Implement invariant in Market aggregate root (`internal/market/market.go`):
  ```go
  func (m *Market) RemoveManager(managerID UserID) error {
      if len(m.Managers) <= 2 {
          return ErrMinimumManagersRequired
      }
      // ... remove logic
  }
  ```
- [ ] Resolver for `removeManager` mutation:
  - Load Market aggregate (including managers list)
  - Call `m.RemoveManager(managerID)` -- aggregate enforces invariant
  - Translate `ErrMinimumManagersRequired` to `gqlError(ctx, "CONFLICT", "Market requires minimum 2 managers")`
- [ ] Write integration test (1.4.4): market with exactly 2 managers, remove attempt returns CONFLICT
- [ ] Write integration test (1.4.5): market with 3 managers, remove succeeds, 2 remain

### Task 6: Domain Events (ManagerAssigned, ManagerRemoved)

- [ ] Define domain events in `internal/events/`:
  ```go
  type ManagerAssigned struct { ManagerID UserID; MarketID MarketID }
  type ManagerRemoved struct { ManagerID UserID; MarketID MarketID }
  ```
- [ ] Publish `ManagerAssigned` after successful insert into market_managers
- [ ] Publish `ManagerRemoved` after successful delete from market_managers
- [ ] Events published only after successful DB write (never before, never on failure)
- [ ] Write unit test: verify event published with correct data after successful write
- [ ] Write unit test: verify event NOT published if DB write fails
- [ ] Write unit test: verify handler failure does not roll back DB write

---

## Dev Notes

### Junction Table Design

The `market_managers` table is a many-to-many junction between `users` (where role="manager") and `markets`. Key design decisions:

- **No soft-delete on junction table** -- manager assignments are added or removed, not soft-deleted. The audit trigger captures the full history.
- **created_at only** -- no `updated_at` needed since rows are immutable (insert or delete, never update).
- **Unique constraint** on `(manager_id, market_id)` prevents duplicate assignments at the database level.

### Scope Check Pattern for Resolvers

Every resolver that accesses market-specific data for a manager must follow this pattern:

```go
func (r *Resolver) SomeManagerQuery(ctx context.Context, marketID MarketID) (*Result, error) {
    user := auth.UserFromContext(ctx)
    if user.Role == "manager" {
        assigned, err := r.marketRepo.IsManagerAssigned(ctx, user.ID, marketID)
        if err != nil {
            return nil, gqlError(ctx, "INTERNAL", "failed to verify market access")
        }
        if !assigned {
            return nil, gqlError(ctx, "FORBIDDEN", "not authorized for this market")
        }
    }
    // ... proceed with query
}
```

This scope check is separate from the role-based access check (Story 1.5). Role check verifies "is this user a manager?" while scope check verifies "is this manager assigned to this specific market?"

### 2-Manager Invariant (Market Aggregate Root)

Per DDD coding standards, the Market aggregate root enforces the 2-manager minimum invariant. The resolver does NOT contain this business rule -- it delegates to the aggregate:

- `Market.Managers` is a slice of `ManagerAssignment` with invariant `len >= 2`
- `Market.RemoveManager()` returns `ErrMinimumManagersRequired` if removal would violate the invariant
- The resolver translates domain errors to GraphQL error codes
- Factory function `NewMarket()` should also enforce that a market is created with at least 2 managers

### Market-Scope Resolution at Runtime

Per architecture decision: market scope is resolved from Cloud SQL at runtime, NOT stored in JWT claims. This avoids stale JWT claims when manager assignments change dynamically. The JWT contains only `uid` and `role`; the `market_managers` table is queried on each request.

### Test Cases (from epic-1-test-strategy.md)

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.4.1 | Assigned manager can access market | Integration | Manager assigned to Market A | Query Market A data | Data returned successfully |
| 1.4.2 | Unassigned manager blocked | Integration | Manager NOT assigned to Market B | Query Market B data | FORBIDDEN error returned |
| 1.4.3 | Two managers see same shared state | Integration | Manager1 and Manager2 both assigned to Market A | Both query dashboard | Same vendor statuses and counts returned |
| 1.4.4 | Cannot reduce below 2 managers | Integration | Market A has exactly 2 managers | Remove one manager | CONFLICT error: "Market requires minimum 2 managers" |
| 1.4.5 | Can remove manager if 3+ remain | Integration | Market A has 3 managers | Remove one manager | Success; 2 managers remain |
| 1.4.6 | market_managers junction table integrity | Integration | Manager assigned | Query junction table | Correct manager_id, market_id, created_at |
| 1.4.7 | Scope check queries market_managers | Unit | Manager with role in context | Resolver checks scope | SQL query hits market_managers table with correct manager_id |

### Audit Logging Verification

Per cross-cutting test requirements, every write operation must generate an audit log entry:

| Mutation | Expected Audit Entry |
|----------|---------------------|
| `assignManager` | action_type="manager_assigned", target_type="market_managers" |
| `removeManager` | action_type="manager_removed", target_type="market_managers" |

### Domain Event Verification

| Mutation | Expected Event |
|----------|---------------|
| `assignManager` | `ManagerAssigned{managerId, marketId}` |
| `removeManager` | `ManagerRemoved{managerId, marketId}` |

Each event must be tested for: published after successful DB write, NOT published on failure, handler failure does not roll back DB write.

---

## Project Structure Notes

### Files to Create/Modify

```
markets-api/
  migrations/
    NNNNNN_create_market_managers.up.sql      # Junction table + audit trigger attachment
    NNNNNN_create_market_managers.down.sql     # Rollback
  internal/
    market/
      market.go                                # Market aggregate (add RemoveManager, Managers field)
      repository.go                            # Add IsManagerAssigned to port interface
    db/
      market_repo.go                           # Add IsManagerAssigned implementation (adapter)
    graph/
      market.resolvers.go                      # Add scope checks to manager-only resolvers
    events/
      market_events.go                         # ManagerAssigned, ManagerRemoved event types
```

### Bounded Context Ownership

- **Market context** (`internal/market/`): Owns the Market aggregate root, junction table repository interface, scope-check logic
- **DB context** (`internal/db/`): Implements `PgMarketRepository` adapter including `IsManagerAssigned`
- **Graph context** (`internal/graph/`): Orchestrates scope checks in resolvers, translates domain errors to GraphQL error codes
- **Events context** (`internal/events/`): Defines and dispatches ManagerAssigned/ManagerRemoved events

---

## References

- **Epics:** `_bmad-output/planning-artifacts/epics.md` (Story 1.4, lines 298-321)
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md` (Auth & Security, lines 251-275; Cross-cutting concerns, lines 75-86)
- **Coding Standards:** `_bmad-output/planning-artifacts/coding-standards.md` (DDD section: aggregate roots lines 217-265, repository interfaces lines 301-334)
- **Test Strategy:** `_bmad-output/test-artifacts/epic-1-test-strategy.md` (Section 5: Story 1.4, lines 126-139; Section 7: Cross-cutting, lines 168-199)
- **Requirement:** FR41a (2-manager minimum per market)

---

## Dependencies

- **Requires Story 1.3 complete:** User records and role assignment must exist before manager scope can be enforced. The `users` table (with role column) and Firebase custom claims must be in place.
- **Requires Story 1.1b complete:** Migration infrastructure, audit trigger function, and event bus must exist.

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| **Assigned To** | (unassigned) |
| **Worktree Branch** | `story/1.4-market-scoped-manager-permissions` |
| **Started** | -- |
| **Completed** | -- |
| **Tests Passing** | -- |
| **Notes** | -- |
