# Epic 1: Authentication & Role-Based Access — Test Strategy

> Authored by Murat (TEA - Test Architect) during Epic 1 Sprint Planning.
> Defines the test approach, test cases, and quality gates for all 6 stories in Epic 1.

---

## 1. Epic 1 Test Scope

Epic 1 establishes the foundation: project scaffolding, authentication, role assignment, market-scoped permissions, and role-based access enforcement. Every subsequent epic depends on this one working correctly.

**Stories:**
- 1.1a: Frontend Project Scaffolding
- 1.1b: Backend Project Scaffolding & Audit Infrastructure
- 1.2: Google & Apple Sign-In Authentication
- 1.3: Role Selection & User Record Creation
- 1.4: Market-Scoped Manager Permissions
- 1.5: Role-Based Access Enforcement Middleware

**Risk Assessment:** HIGH — Foundation errors cascade to all subsequent epics. Auth and RBAC bugs are security vulnerabilities.

---

## 2. Test Framework Setup (Stories 1.1a & 1.1b)

### Go Backend Test Infrastructure

| Tool | Purpose | Configuration |
|------|---------|---------------|
| `go test` | Unit + integration test runner | Standard Go tooling |
| `//go:build integration` | Tag for integration tests | Separate from unit tests in CI |
| `testcontainers-go` or local Cloud SQL | Test database | Real PostgreSQL for integration tests |
| `httptest` | HTTP handler testing | Test middleware and GraphQL endpoint |
| `golangci-lint` | Static analysis | Pre-commit + CI |

**Test Database Strategy:**
- Unit tests: mock DB interfaces (no real database)
- Integration tests: dedicated test PostgreSQL instance with migrations applied fresh per test suite
- Each integration test runs in a transaction that is rolled back after the test

### React Native Test Infrastructure

| Tool | Purpose | Configuration |
|------|---------|---------------|
| Jest | Test runner | Configured via `jest.config.js` |
| React Native Testing Library | Component testing | `@testing-library/react-native` |
| `@testing-library/jest-dom` | DOM assertions | Extended matchers |
| `MockedProvider` | Apollo Client mocking | From `@apollo/client/testing` |

**Test Verification for Scaffolding:**

```
Story 1.1a — Frontend scaffolding is DONE when:
  [ ] Jest runs and finds test files
  [ ] A smoke test renders the root layout without crashing
  [ ] TypeScript compiles with zero errors (tsc --noEmit)
  [ ] ESLint passes with zero warnings
  [ ] GraphQL codegen generates types successfully

Story 1.1b — Backend scaffolding is DONE when:
  [ ] go test ./... passes with at least one test
  [ ] A smoke test starts the HTTP server and responds to health check
  [ ] gqlgen validate passes (schema is valid)
  [ ] golangci-lint passes
  [ ] Migrations run up and down cleanly
  [ ] Audit trigger function exists and fires on test table insert
  [ ] Event bus publishes and receives a test event
```

---

## 3. Story 1.2: Google & Apple Sign-In Authentication

### Test Cases — Go Backend (Auth Middleware)

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.2.1 | Valid Google JWT accepted | Unit | Valid Firebase JWT with Google provider | Request hits auth middleware | Context populated with uid and role; request proceeds |
| 1.2.2 | Valid Apple JWT accepted | Unit | Valid Firebase JWT with Apple provider | Request hits auth middleware | Context populated with uid and role; request proceeds |
| 1.2.3 | Expired JWT rejected | Unit | Expired Firebase JWT | Request hits auth middleware | UNAUTHENTICATED error returned; request blocked |
| 1.2.4 | Malformed JWT rejected | Unit | Random string as Authorization header | Request hits auth middleware | UNAUTHENTICATED error returned |
| 1.2.5 | Missing Authorization header | Unit | No Authorization header | Request hits auth middleware | UNAUTHENTICATED error returned |
| 1.2.6 | JWT with wrong issuer | Unit | Valid JWT but not from Firebase | Request hits auth middleware | UNAUTHENTICATED error returned |
| 1.2.7 | Session variables set | Integration | Valid JWT with uid="user1", role="vendor" | Request processed by middleware | PostgreSQL session vars `app.actor_id`="user1", `app.actor_role`="vendor" set |

### Test Cases — React Native (Auth Flow)

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.2.8 | Google sign-in button renders | Component | Login screen mounted | Screen renders | "Sign in with Google" button visible with correct accessibility label |
| 1.2.9 | Apple sign-in button renders | Component | Login screen mounted | Screen renders | "Sign in with Apple" button visible with correct accessibility label |
| 1.2.10 | Successful Google sign-in stores token | Unit (hook) | Firebase returns valid JWT | Sign-in completes | JWT stored in expo-secure-store |
| 1.2.11 | Successful sign-in configures Apollo | Unit (hook) | JWT stored in secure store | Apollo Client initialized | Authorization Bearer header set on all requests |
| 1.2.12 | Auth error shows user-friendly message | Component | Firebase returns auth error | Sign-in fails | Error message displayed (not raw error) |
| 1.2.13 | Loading state during sign-in | Component | User taps sign-in | Auth flow in progress | Loading indicator shown, button disabled |

---

## 4. Story 1.3: Role Selection & User Record Creation

### Test Cases — Go Backend

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.3.1 | Create user with customer role | Integration | Authenticated user, no existing record | `createUser` mutation with role="customer" | User record created in DB; Firebase custom claim set; role returned |
| 1.3.2 | Create user with vendor role | Integration | Authenticated user, no existing record | `createUser` mutation with role="vendor" | User record created; custom claim set |
| 1.3.3 | Create user with manager role | Integration | Authenticated user, no existing record | `createUser` mutation with role="manager" | User record created; custom claim set; recovery contact required |
| 1.3.4 | Reject duplicate user creation | Integration | User record already exists | `createUser` mutation | CONFLICT error returned |
| 1.3.5 | Reject invalid role | Unit | Authenticated user | `createUser` with role="admin" | VALIDATION_ERROR returned |
| 1.3.6 | Audit log entry created | Integration | User created successfully | Check audit_log table | Entry exists with action="user_created", actor=uid |
| 1.3.7 | User record includes required fields | Integration | User created | Query users table | id, firebase_uid, role, name, email, created_at all populated; deleted_at is NULL |

### Test Cases — React Native

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.3.8 | Role selection screen renders three options | Component | New user (no role claim) | Screen mounts | Customer, Vendor, Manager options visible with descriptions |
| 1.3.9 | Selecting customer role navigates to customer tabs | Component | User selects Customer | Role mutation succeeds | App navigates to `(customer)/` tab layout |
| 1.3.10 | Selecting vendor role navigates to vendor tabs | Component | User selects Vendor | Role mutation succeeds | App navigates to `(vendor)/` tab layout |
| 1.3.11 | Selecting manager role navigates to manager tabs | Component | User selects Manager | Role mutation succeeds | App navigates to `(manager)/` tab layout |
| 1.3.12 | Returning user bypasses role selection | Unit (hook) | Existing user with role claim in JWT | App opens | Routed directly to role-specific tabs |
| 1.3.13 | Role selection error shows retry | Component | Network error on mutation | Role selection fails | Error message with retry option |

---

## 5. Story 1.4: Market-Scoped Manager Permissions

### Test Cases — Go Backend

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.4.1 | Assigned manager can access market | Integration | Manager assigned to Market A | Query Market A data | Data returned successfully |
| 1.4.2 | Unassigned manager blocked | Integration | Manager NOT assigned to Market B | Query Market B data | FORBIDDEN error returned |
| 1.4.3 | Two managers see same shared state | Integration | Manager1 and Manager2 both assigned to Market A | Both query dashboard | Same vendor statuses and counts returned |
| 1.4.4 | Cannot reduce below 2 managers | Integration | Market A has exactly 2 managers | Remove one manager | CONFLICT error: "Market requires minimum 2 managers" |
| 1.4.5 | Can remove manager if 3+ remain | Integration | Market A has 3 managers | Remove one manager | Success; 2 managers remain |
| 1.4.6 | market_managers junction table integrity | Integration | Manager assigned | Query junction table | Correct manager_id, market_id, created_at |
| 1.4.7 | Scope check queries market_managers | Unit | Manager with role in context | Resolver checks scope | SQL query hits market_managers table with correct manager_id |

---

## 6. Story 1.5: Role-Based Access Enforcement Middleware

### Test Cases — Go Backend

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

### Security Edge Cases

| ID | Test Case | Type | Given | When | Then |
|----|-----------|------|-------|------|------|
| 1.5.9 | Tampered role claim rejected | Unit | JWT with role modified after signing | Request hits middleware | UNAUTHENTICATED (signature invalid) |
| 1.5.10 | Role=empty string rejected | Unit | JWT with role="" | Request hits middleware | UNAUTHENTICATED or FORBIDDEN |
| 1.5.11 | Multiple roles not supported | Unit | JWT with role="customer,vendor" | Request hits middleware | VALIDATION_ERROR or FORBIDDEN |
| 1.5.12 | SQL injection in user ID blocked | Integration | JWT uid contains SQL injection | Query executed | Parameterized query prevents injection; no data leak |

---

## 7. Cross-Cutting Test Requirements for Epic 1

### Audit Logging Verification

Every write operation in Epic 1 must generate an audit log entry. Verify for each mutation:

| Mutation | Expected Audit Entry |
|----------|---------------------|
| `createUser` | action_type="user_created", actor_id=uid, target_type="user", target_id=new_user_id |
| `assignManager` | action_type="manager_assigned", target_type="market_managers" |
| `removeManager` | action_type="manager_removed", target_type="market_managers" |

### PostgreSQL Session Variables

For every authenticated request, verify:
- `app.actor_id` is set to the Firebase UID
- `app.actor_role` is set to the user's role
- These values are available to the audit trigger function

### Domain Event Publishing

| Mutation | Expected Event |
|----------|---------------|
| `createUser` | `UserCreated{userId, role}` |
| `assignManager` | `ManagerAssigned{managerId, marketId}` |
| `removeManager` | `ManagerRemoved{managerId, marketId}` |

Each event must be tested for:
- Event is published after successful DB write
- Event is NOT published if DB write fails
- Event handlers receive the event with correct data
- Handler failure does not roll back the DB write

---

## 8. Quality Gates for Epic 1

### Per-Story Gates

Before a story moves from `in-progress` to `review`:

- [ ] All test cases from this document are implemented and passing
- [ ] Go coverage >= 80% for changed files
- [ ] React Native coverage >= 80% for changed files
- [ ] Zero ESLint warnings, zero golangci-lint issues
- [ ] TypeScript compiles cleanly (`tsc --noEmit`)
- [ ] Pre-commit hooks pass

### Epic 1 Completion Gate

Before Epic 1 moves to `done`:

- [ ] All 6 stories are `done`
- [ ] Integration tests cover the full auth flow: sign-in → role selection → permission check → scope enforcement
- [ ] Security edge cases (1.5.9 - 1.5.12) all pass
- [ ] Audit logging verified for every write mutation
- [ ] Domain events verified for every write mutation
- [ ] No `any` types in TypeScript codebase
- [ ] All accessibility labels present on auth/role screens
- [ ] Skeleton screens (not spinners) for loading states

---

## 9. Test Execution Order

Stories should be implemented and tested in this order (dependencies flow downward):

```
1.1a (Frontend Scaffolding) ──┐
                               ├── 1.2 (Authentication) ── 1.3 (Role Selection) ──┐
1.1b (Backend Scaffolding)  ──┘                                                    │
                                                                                    ├── 1.5 (RBAC Middleware)
                                                              1.4 (Manager Scope) ──┘
```

- **1.1a and 1.1b** can be developed in parallel (no dependencies)
- **1.2** requires both scaffolding stories complete
- **1.3** requires 1.2 (authentication must work for role assignment)
- **1.4** can start after 1.3 (needs user records to exist)
- **1.5** requires 1.3 and 1.4 (enforces roles and scopes)

---

## 10. Recommended Test Tooling Additions

| Tool | Purpose | When to Add |
|------|---------|-------------|
| `testcontainers-go` | Spin up PostgreSQL in Docker for integration tests | Story 1.1b |
| `go-sqlmock` | Mock pgx for unit tests (if interfaces aren't sufficient) | Story 1.2 if needed |
| `firebase-admin-go` test helpers | Create test JWTs for middleware testing | Story 1.2 |
| `msw` (Mock Service Worker) | Mock GraphQL responses in React Native tests | Story 1.2 frontend |
| Coverage reporting | `go tool cover` + Jest `--coverage` with CI thresholds | Story 1.1a/1.1b |
