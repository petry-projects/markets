# Story 1.5: Role-Based Access Enforcement Middleware

> **Epic:** 1 - Authentication & Role-Based Access
> **Sprint:** 1
> **Story Points:** (estimated by team)
> **Priority:** High
> **Status:** Ready for Dev

---

## User Story

**As the** system,
**I want to** enforce role-based permissions at the GraphQL resolver level,
**So that** customers cannot access vendor/manager data and vice versa.

---

## Acceptance Criteria

**Given** a customer-role JWT
**When** the user attempts a vendor-only mutation (e.g., checkInVendor)
**Then** the resolver returns FORBIDDEN

**Given** a vendor-role JWT
**When** the user attempts a manager-only query (e.g., marketDashboard)
**Then** the resolver returns FORBIDDEN

**Given** any authenticated user
**When** they query data that includes soft-deleted records
**Then** soft-deleted records are excluded from results (FR42)

---

## Tasks / Subtasks

### Task 1: Role-Based Resolver Directives or Middleware

- [ ] Create a reusable authorization helper in `internal/auth/`:
  ```go
  // internal/auth/authorize.go
  func RequireRole(ctx context.Context, allowedRoles ...string) error
  ```
  - Reads role from request context (populated by JWT middleware from Story 1.2)
  - Returns `nil` if the user's role is in `allowedRoles`
  - Returns a FORBIDDEN GraphQL error if not authorized
- [ ] Alternatively, implement as a gqlgen directive (`@hasRole`) if the team prefers schema-level enforcement:
  ```graphql
  directive @hasRole(roles: [Role!]!) on FIELD_DEFINITION
  ```
- [ ] Document the chosen approach (helper function vs directive) for consistency across all resolvers
- [ ] Write unit test: helper returns nil for allowed role
- [ ] Write unit test: helper returns FORBIDDEN for disallowed role

### Task 2: Per-Resolver Role Checks

- [ ] Add role enforcement to every resolver, mapping each query/mutation to its allowed roles:

  | Operation Type | Example | Allowed Roles |
  |---------------|---------|---------------|
  | Customer queries | `searchMarkets`, `myFollowedVendors` | customer |
  | Vendor queries | `myVendorProfile`, `myCheckInStatus` | vendor |
  | Vendor mutations | `checkInVendor`, `updateVendorProfile` | vendor, manager (on-behalf) |
  | Manager queries | `marketDashboard`, `vendorRoster` | manager |
  | Manager mutations | `approveJoinRequest`, `removeManager` | manager |
  | Shared queries | `marketDetail`, `vendorDetail` | customer, vendor, manager |

- [ ] Write unit test (1.5.1): customer JWT calling `checkInVendor` returns FORBIDDEN
- [ ] Write unit test (1.5.2): customer JWT calling `marketDashboard` returns FORBIDDEN
- [ ] Write unit test (1.5.3): vendor JWT calling `approveJoinRequest` returns FORBIDDEN
- [ ] Write unit test (1.5.4): vendor JWT calling `myVendorProfile` returns data
- [ ] Write unit test (1.5.5): manager JWT calling `marketDashboard` returns data (with scope check from 1.4)
- [ ] Write unit test (1.5.6): customer JWT calling `searchMarkets` returns data
- [ ] Write unit test (1.5.8): every mutation/query resolver has a role check (structural verification)

### Task 3: Soft-Delete Filtering (WHERE deleted_at IS NULL)

- [ ] Ensure every read query in `internal/db/` includes `WHERE deleted_at IS NULL`
  - Apply to all repository adapter methods that return domain entities
  - Create a shared query helper or builder that automatically appends the soft-delete filter:
    ```go
    // internal/db/query_helpers.go
    const SoftDeleteFilter = " AND deleted_at IS NULL"
    ```
- [ ] Verify soft-delete filter is present on: user queries, market queries, vendor queries, product queries
- [ ] Write integration test (1.5.7): insert a user record with `deleted_at` set, query users, verify soft-deleted user is excluded from results
- [ ] Ensure `DELETE` operations set `deleted_at = NOW()` rather than physically deleting rows

### Task 4: FORBIDDEN Error Responses

- [ ] Standardize FORBIDDEN error response format using the shared error formatting helper:
  ```go
  // internal/graph/errors.go
  func gqlError(ctx context.Context, code string, message string) error {
      return &gqlerror.Error{
          Message: message,
          Extensions: map[string]interface{}{
              "code": code,
          },
      }
  }
  ```
- [ ] FORBIDDEN responses must NOT leak information about why access was denied (no "you need manager role" messages that reveal the required role)
- [ ] Use consistent error code: `"FORBIDDEN"` (not `"UNAUTHORIZED"`, `"ACCESS_DENIED"`, etc.)
- [ ] Write unit test: FORBIDDEN error has correct GraphQL error extension code

### Task 5: Security Edge Cases

- [ ] **Tampered JWT (1.5.9):** JWT with modified role claim after signing
  - Firebase JWT middleware (Story 1.2) validates signature -- tampered tokens fail signature verification
  - Write unit test: tampered JWT returns UNAUTHENTICATED (signature invalid)
- [ ] **Empty role string (1.5.10):** JWT with role=""
  - Auth middleware must reject empty role as invalid
  - Write unit test: empty role returns UNAUTHENTICATED or FORBIDDEN
- [ ] **Multiple roles (1.5.11):** JWT with role="customer,vendor"
  - Auth middleware must reject compound role strings -- system supports exactly one role per user
  - Write unit test: compound role returns VALIDATION_ERROR or FORBIDDEN
- [ ] **SQL injection in user ID (1.5.12):** JWT uid containing SQL injection payload
  - All queries use parameterized queries (`$1`, `$2` placeholders) via pgx -- never string interpolation
  - Write integration test: uid containing `'; DROP TABLE users; --` is safely parameterized, no data leak, no schema damage

---

## Dev Notes

### GraphQL Error Codes

The system uses a consistent set of GraphQL error codes in the `extensions.code` field:

| Code | Meaning | HTTP Analogue |
|------|---------|---------------|
| `UNAUTHENTICATED` | No valid JWT or expired JWT | 401 |
| `FORBIDDEN` | Valid JWT but insufficient role/scope | 403 |
| `NOT_FOUND` | Resource does not exist | 404 |
| `CONFLICT` | Business rule violation (e.g., 2-manager minimum) | 409 |
| `VALIDATION_ERROR` | Invalid input | 422 |
| `INTERNAL` | Unexpected server error | 500 |

### Resolver Authorization Pattern

Authorization checks happen in this order at the resolver level:

1. **Authentication** (Story 1.2 middleware): JWT validated, uid + role extracted to context
2. **Role check** (this story): `RequireRole(ctx, "manager")` verifies the user has the correct role
3. **Scope check** (Story 1.4): `IsManagerAssigned(ctx, managerID, marketID)` verifies market-level access
4. **Business logic**: Proceeds only after both checks pass

```go
func (r *Resolver) MarketDashboard(ctx context.Context, marketID MarketID) (*Dashboard, error) {
    // Step 2: Role check
    if err := auth.RequireRole(ctx, "manager"); err != nil {
        return nil, err  // FORBIDDEN
    }
    // Step 3: Scope check (from Story 1.4)
    user := auth.UserFromContext(ctx)
    assigned, err := r.marketRepo.IsManagerAssigned(ctx, user.ID, marketID)
    if err != nil {
        return nil, gqlError(ctx, "INTERNAL", "failed to verify market access")
    }
    if !assigned {
        return nil, gqlError(ctx, "FORBIDDEN", "not authorized for this market")
    }
    // Step 4: Business logic
    return r.marketRepo.GetDashboard(ctx, marketID)
}
```

### Soft-Delete Query Pattern

Every query that returns domain entities must filter out soft-deleted records. This is a cross-cutting concern applied at the repository adapter layer (`internal/db/`):

```go
// internal/db/market_repo.go
func (r *PgMarketRepository) FindByID(ctx context.Context, id MarketID) (*Market, error) {
    row := r.pool.QueryRow(ctx,
        `SELECT id, name, location, schedule, created_at
         FROM markets
         WHERE id = $1 AND deleted_at IS NULL`,
        id,
    )
    // ... scan result
}
```

Never use `DELETE FROM` for domain entities. Always `UPDATE ... SET deleted_at = NOW()`.

### Parameterized Queries for SQL Injection Prevention

All database queries use pgx parameterized queries. This is non-negotiable:

```go
// GOOD: Parameterized
r.pool.QueryRow(ctx, "SELECT * FROM users WHERE id = $1", userID)

// BAD: String interpolation (NEVER do this)
r.pool.QueryRow(ctx, fmt.Sprintf("SELECT * FROM users WHERE id = '%s'", userID))
```

The integration test for SQL injection (1.5.12) verifies this by passing a malicious uid through the full request pipeline and confirming no data is leaked or schema damaged.

### Test Cases (from epic-1-test-strategy.md)

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.5.1 | Customer blocked from vendor mutation | Unit | JWT with role="customer" | `checkInVendor` mutation | FORBIDDEN |
| 1.5.2 | Customer blocked from manager query | Unit | JWT with role="customer" | `marketDashboard` query | FORBIDDEN |
| 1.5.3 | Vendor blocked from manager mutation | Unit | JWT with role="vendor" | `approveJoinRequest` mutation | FORBIDDEN |
| 1.5.4 | Vendor can access own vendor queries | Unit | JWT with role="vendor" | `myVendorProfile` query | Data returned |
| 1.5.5 | Manager can access dashboard | Unit | JWT with role="manager" | `marketDashboard` query | Data returned (with scope check) |
| 1.5.6 | Customer can access customer queries | Unit | JWT with role="customer" | `searchMarkets` query | Data returned |
| 1.5.7 | Soft-deleted records excluded | Integration | User record with deleted_at set | Any query returning users | Soft-deleted user excluded from results |
| 1.5.8 | Role enforcement at resolver level | Unit | Each resolver | Inspect role check | Every mutation/query resolver checks role before proceeding |

### Security Edge Case Tests

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.5.9 | Tampered role claim rejected | Unit | JWT with role modified after signing | Request hits middleware | UNAUTHENTICATED (signature invalid) |
| 1.5.10 | Role=empty string rejected | Unit | JWT with role="" | Request hits middleware | UNAUTHENTICATED or FORBIDDEN |
| 1.5.11 | Multiple roles not supported | Unit | JWT with role="customer,vendor" | Request hits middleware | VALIDATION_ERROR or FORBIDDEN |
| 1.5.12 | SQL injection in user ID blocked | Integration | JWT uid contains SQL injection | Query executed | Parameterized query prevents injection; no data leak |

---

## Project Structure Notes

### Files to Create/Modify

```
markets-api/
  internal/
    auth/
      authorize.go                             # RequireRole helper function (NEW)
      authorize_test.go                        # Unit tests for role checks
    db/
      query_helpers.go                         # Soft-delete filter constant/helper (NEW or extend existing)
      market_repo.go                           # Ensure WHERE deleted_at IS NULL on all queries
      user_repo.go                             # Ensure WHERE deleted_at IS NULL on all queries
      vendor_repo.go                           # Ensure WHERE deleted_at IS NULL on all queries
    graph/
      errors.go                                # Standardized gqlError helper (NEW or extend existing)
      market.resolvers.go                      # Add RequireRole("manager") to manager resolvers
      vendor.resolvers.go                      # Add RequireRole("vendor") to vendor resolvers
      customer.resolvers.go                    # Add RequireRole("customer") to customer resolvers
      auth.resolvers.go                        # Role checks where applicable
```

### Bounded Context Ownership

- **Auth context** (`internal/auth/`): Owns the `RequireRole` authorization helper, role validation logic
- **DB context** (`internal/db/`): Owns soft-delete filtering in all query adapters, parameterized query enforcement
- **Graph context** (`internal/graph/`): Applies role checks at the start of every resolver, standardized error formatting

---

## References

- **Epics:** `_bmad-output/planning-artifacts/epics.md` (Story 1.5, lines 323-342)
- **Architecture:** `_bmad-output/planning-artifacts/architecture.md` (Auth & Security, lines 251-275; Cross-cutting concerns, lines 75-86)
- **Coding Standards:** `_bmad-output/planning-artifacts/coding-standards.md` (Error handling, lines 170-188; DDD repository interfaces, lines 301-334)
- **Test Strategy:** `_bmad-output/test-artifacts/epic-1-test-strategy.md` (Section 6: Story 1.5, lines 142-165; Section 7: Cross-cutting, lines 168-199)
- **Requirement:** FR42 (soft-delete filtering)

---

## Dependencies

- **Requires Story 1.3 complete:** Role selection and user record creation must exist so that JWTs contain valid role claims.
- **Requires Story 1.4 complete:** Market-scoped permissions must be in place so that manager resolvers can chain role check + scope check in the correct order.
- **Requires Story 1.2 complete:** JWT validation middleware must populate the request context with uid and role.

---

## Dev Agent Record

| Field | Value |
|-------|-------|
| **Assigned To** | (unassigned) |
| **Worktree Branch** | `story/1.5-role-based-access-enforcement-middleware` |
| **Started** | -- |
| **Completed** | -- |
| **Tests Passing** | -- |
| **Notes** | -- |
