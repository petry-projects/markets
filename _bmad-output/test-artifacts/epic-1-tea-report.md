# TEA Report: Epic 1 — Authentication & Role-Based Access

> **Author:** Murat (TEA — Test Architect)
> **Date:** 2026-03-28
> **Sprint:** 1 (Epic 1)
> **Status:** Story Creation Complete — Ready for Dev

---

## 1. Executive Summary

All 6 stories in Epic 1 have been prepared with comprehensive test coverage requirements. The test strategy (`epic-1-test-strategy.md`) defines **54 test cases** across unit, integration, component, and security categories. Each story context file references its specific test cases and quality gates.

| Metric | Value |
|--------|-------|
| Stories prepared | 6 of 6 |
| Total test cases defined | 54 |
| Unit test cases | 28 |
| Integration test cases | 16 |
| Component test cases | 7 |
| Security edge cases | 4 |
| Coverage threshold (line) | 80% minimum |
| Coverage threshold (branch) | 75% minimum |

---

## 2. Test Coverage Matrix

### Story-to-Test-Case Mapping

| Story | Test Cases | Count | Risk Level |
|-------|-----------|-------|------------|
| 1.1a Frontend Scaffolding | Smoke test, CI verification | 5 checks | LOW |
| 1.1b Backend Scaffolding | Smoke test, migration verify, audit trigger, event bus | 7 checks | MEDIUM |
| 1.2 Google & Apple Sign-In | 1.2.1 – 1.2.13 | 13 | HIGH |
| 1.3 Role Selection & User Creation | 1.3.1 – 1.3.13 | 13 | HIGH |
| 1.4 Market-Scoped Manager Permissions | 1.4.1 – 1.4.7 | 7 | HIGH |
| 1.5 Role-Based Access Enforcement | 1.5.1 – 1.5.12 | 12 | CRITICAL |

### Risk Assessment Rationale

- **1.1a/1.1b (LOW/MEDIUM):** Scaffolding stories — risk is misconfiguration, not logic bugs. Verification is structural.
- **1.2 (HIGH):** Authentication is a security boundary. Incorrect JWT handling = unauthorized access.
- **1.3 (HIGH):** User creation sets role claims that propagate through the entire system. Wrong role = wrong access.
- **1.4 (HIGH):** Market-scope enforcement prevents unauthorized cross-market access. The 2-manager minimum is a business-critical invariant.
- **1.5 (CRITICAL):** RBAC middleware is the last line of defense. Every resolver depends on it. Security edge cases (JWT tampering, SQL injection) are included.

---

## 3. Test Type Distribution

### By Layer

| Layer | Test Type | Framework | Stories Covered |
|-------|-----------|-----------|-----------------|
| Go middleware | Unit | go test | 1.2, 1.5 |
| Go resolvers | Unit + Integration | go test + integration tag | 1.3, 1.4, 1.5 |
| Go DB/migrations | Integration | go test + real PostgreSQL | 1.1b, 1.3, 1.4 |
| Go event bus | Unit | go test | 1.1b, 1.3, 1.4 |
| React Native components | Component | Jest + RNTL | 1.2, 1.3 |
| React Native hooks | Unit (renderHook) | Jest | 1.2, 1.3 |
| Apollo Client | Unit | MockedProvider | 1.2, 1.3 |
| TypeScript types | Compile-time | tsc --noEmit | 1.1a (all stories) |

### By Priority

| Priority | Test Cases | Rationale |
|----------|-----------|-----------|
| P0 — Must pass before merge | 1.2.1-1.2.6, 1.3.1-1.3.5, 1.4.4, 1.5.1-1.5.8 | Auth/RBAC correctness |
| P0 — Security | 1.5.9-1.5.12 | JWT tampering, SQL injection, empty role, invalid role |
| P1 — Must pass before epic done | 1.2.7, 1.3.6-1.3.7, 1.4.1-1.4.3, 1.4.5-1.4.7 | Integration correctness |
| P2 — Should pass | 1.2.8-1.2.13, 1.3.8-1.3.13 | UI component rendering |

---

## 4. Cross-Cutting Test Requirements

### Audit Logging Verification

Every write mutation in Epic 1 must generate an audit log entry via PostgreSQL triggers. Verified in integration tests.

| Mutation | Audit Entry | Verified In |
|----------|------------|-------------|
| `createUser` | action_type="user_created", actor_id=uid | Story 1.3 (TC 1.3.6) |
| `assignManager` | action_type="manager_assigned" | Story 1.4 (TC 1.4.6) |
| `removeManager` | action_type="manager_removed" | Story 1.4 (TC 1.4.4-1.4.5) |

### Domain Event Verification

Every write mutation must publish a typed domain event. Handler failure must not roll back the write.

| Mutation | Event | Verified In |
|----------|-------|-------------|
| `createUser` | `UserCreated{userId, role}` | Story 1.3 |
| `assignManager` | `ManagerAssigned{managerId, marketId}` | Story 1.4 |
| `removeManager` | `ManagerRemoved{managerId, marketId}` | Story 1.4 |

### PostgreSQL Session Variables

Auth middleware must set `app.actor_id` and `app.actor_role` via `SET LOCAL` for every authenticated request. Verified in Story 1.2 (TC 1.2.7).

### Soft-Delete Filtering

All user-facing queries must include `WHERE deleted_at IS NULL`. Verified in Story 1.5 (TC 1.5.7).

---

## 5. Story Dependency & Test Execution Order

```
1.1a (Frontend Scaffolding) ──┐
                               ├── 1.2 (Authentication) ── 1.3 (Role Selection) ──┐
1.1b (Backend Scaffolding)  ──┘                                                    │
                                                                                    ├── 1.5 (RBAC Middleware)
                                                              1.4 (Manager Scope) ──┘
```

**Recommended execution order:**
1. 1.1a and 1.1b in parallel (no dependencies)
2. 1.2 after both scaffolding stories pass all verification checks
3. 1.3 after 1.2 (auth must work for role assignment)
4. 1.4 after 1.3 (needs user records)
5. 1.5 after 1.3 + 1.4 (enforces all roles and scopes)

**Integration test sweep:** After 1.5 is complete, run the full integration test suite to verify the complete auth flow: sign-in → role selection → permission check → scope enforcement.

---

## 6. Quality Gates

### Per-Story Quality Gate (blocks merge)

| Gate | Tool | Threshold |
|------|------|-----------|
| Go lint | golangci-lint | Zero issues |
| Go unit tests | go test -short | All pass |
| Go integration tests | go test -tags=integration | All pass |
| Go coverage | go tool cover | >= 80% line, >= 75% branch |
| TS type check | tsc --noEmit | Zero errors |
| TS lint | eslint --max-warnings 0 | Zero warnings |
| TS format | prettier --check | All pass |
| TS unit/component tests | jest --ci | All pass |
| TS coverage | jest --coverage | >= 80% line, >= 75% branch |

### Epic 1 Completion Gate (blocks epic-1 → done)

- [ ] All 6 stories at `done` status
- [ ] Full auth flow integration test passes (sign-in → role → permission → scope)
- [ ] All 4 security edge cases pass (1.5.9-1.5.12)
- [ ] Audit logging verified for every write mutation
- [ ] Domain events verified for every write mutation
- [ ] Zero `any` types in TypeScript
- [ ] All interactive elements have accessibility labels
- [ ] Skeleton screens (not spinners) for loading states
- [ ] Error messages are user-friendly, not raw

---

## 7. Test Infrastructure Recommendations

| Tool | Purpose | Add In Story |
|------|---------|-------------|
| `testcontainers-go` | PostgreSQL in Docker for integration tests | 1.1b |
| Firebase Admin SDK test helpers | Create test JWTs | 1.2 |
| `MockedProvider` from Apollo | Mock GraphQL in React Native tests | 1.2 |
| Coverage reporting in CI | `go tool cover` + `jest --coverage` with thresholds | 1.1a/1.1b |
| `golangci-lint` | Static analysis for Go | 1.1b |
| Husky + lint-staged | Pre-commit hooks for frontend | 1.1a |

---

## 8. Traceability Matrix

| Functional Requirement | Story | Test Cases | Acceptance Criteria |
|----------------------|-------|-----------|-------------------|
| FR1: Google Sign-In | 1.2 | 1.2.1, 1.2.8, 1.2.10 | AC-1 |
| FR2: Apple Sign-In | 1.2 | 1.2.2, 1.2.9, 1.2.10 | AC-2 |
| FR3: JWT Authentication | 1.2 | 1.2.3-1.2.6, 1.2.11 | AC-3 |
| FR4: Role Selection | 1.3 | 1.3.1-1.3.3, 1.3.8-1.3.11 | AC-1, AC-2 |
| FR5: User Record Creation | 1.3 | 1.3.4-1.3.7 | AC-3, AC-4 |
| FR6: Returning User Routing | 1.3 | 1.3.12 | AC-5 |
| FR40: Market-Scoped Permissions | 1.4 | 1.4.1-1.4.3, 1.4.6-1.4.7 | AC-1, AC-2 |
| FR41a: 2-Manager Minimum | 1.4 | 1.4.4-1.4.5 | AC-3 |
| FR42: Role-Based Access | 1.5 | 1.5.1-1.5.8 | AC-1, AC-2 |
| FR43: Soft-Delete Filtering | 1.5 | 1.5.7 | AC-3 |
| NFR-SEC: JWT Tampering | 1.5 | 1.5.9-1.5.12 | Security |
| NFR7: Event Handler Isolation | 1.3, 1.4 | Domain event tests | Resilience |
| NFR-AUDIT: Audit Logging | 1.1b, 1.3, 1.4 | 1.3.6, 1.4.6 | Compliance |

---

## 9. TEA Verdict

**APPROVED FOR DEVELOPMENT.** All 6 stories have:

1. Comprehensive test cases defined in `epic-1-test-strategy.md`
2. Test case references embedded in each story context file
3. Clear quality gates at story and epic levels
4. Traceability from functional requirements → stories → test cases → acceptance criteria
5. Security edge cases explicitly defined for the RBAC boundary
6. Cross-cutting concerns (audit, events, session vars, soft-delete) verified across stories

**Risk Items to Monitor:**
- Integration test database setup (testcontainers-go) must be configured in 1.1b — if this is delayed, integration tests for subsequent stories will be blocked
- Firebase test JWT creation needs a clean helper in 1.2 — reused by 1.3, 1.4, 1.5
- The 2-manager minimum (1.4) is a subtle invariant — ensure the integration test covers the exact boundary (2 → 1 rejected, 3 → 2 allowed)

---

*Report generated by Murat (TEA) as part of Epic 1 Sprint Planning, 2026-03-28.*
