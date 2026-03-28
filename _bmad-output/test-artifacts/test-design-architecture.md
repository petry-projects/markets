---
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
lastSaved: '2026-03-28'
workflowType: 'testarch-test-design'
inputDocuments:
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad-output/planning-artifacts/ux-design-specification.md'
  - '_bmad-output/planning-artifacts/implementation-readiness-report-2026-03-21.md'
---

# Test Design for Architecture: Markets Platform

**Purpose:** Architectural concerns, testability gaps, and NFR requirements for review by the development team. Serves as a contract between QA and Engineering on what must be addressed before test development begins.

**Date:** 2026-03-28
**Author:** Murat (TEA Master Test Architect)
**Status:** Architecture Review Pending
**Project:** markets
**PRD Reference:** Requirements captured in architecture.md (52 FRs, 25 NFRs)
**ADR Reference:** architecture.md

---

## Executive Summary

**Scope:** Full-stack real-time coordination platform for local farmers markets. React Native/Expo mobile app + Go/gqlgen GraphQL API on GCP. Three user roles (Customer, Vendor, Manager) with market-scoped permissions, real-time status propagation, and immutable audit logging.

**Architecture:**

- Social-only auth (Google + Apple) via Firebase Auth with JWT custom claims
- GraphQL API (schema-first, gqlgen) on Cloud Run with Cloud SQL PostgreSQL
- Firebase Realtime Database for status propagation (<60s SLO)
- PostgreSQL audit triggers for guaranteed append-only logging
- In-process domain event bus for real-time and push notification dispatch

**Expected Scale:** Pilot: 5 markets, 40 vendors, 250 customers. Peak: 50 concurrent vendor/manager + 200 customer sessions Saturday 6-10am.

**Risk Summary:**

- **Total risks**: 12
- **High-priority (score >= 6)**: 5 risks requiring mitigation
- **Test effort**: ~62 tests (~57-100 hours for 1 developer)

---

## Quick Guide

### BLOCKERS - Team Must Decide

**Pre-Implementation Critical Path** - These MUST be completed before integration tests can be written:

1. **TC-1: Firebase Emulator Suite** - Configure Firebase Auth Emulator + Realtime Database Emulator for local and CI test environments. Without this, no authenticated test flow can execute. (recommended owner: Dev)
2. **TC-2: Test Database Strategy** - Establish per-test database isolation (transaction rollback or per-test schema) to prevent test state pollution. Audit_log rows cannot be deleted by design. (recommended owner: Dev)
3. **TC-3: Test Data Seeding** - Create Go test helper functions that seed data through GraphQL resolvers (exercising real business logic + audit triggers), not raw SQL inserts. (recommended owner: Dev)

**What we need from team:** Complete these 3 items during Story 1.1b (Backend Scaffolding) or test development is blocked.

---

### HIGH PRIORITY - Team Should Validate

1. **R-001: Check-in conflict detection** - Verify cross-market check-in conflict logic handles all edge cases (same-day, timezone boundaries, concurrent attempts). (implementation phase)
2. **R-006: Soft-delete query filtering** - Validate that ALL query paths include `WHERE deleted_at IS NULL`. Consider a database view or query helper to enforce this systematically. (implementation phase)
3. **R-003: Audit trigger coverage** - Add CI verification that every domain table has the reusable audit trigger attached. New migrations must be checked automatically. (implementation phase)

**What we need from team:** Review recommendations and approve (or suggest changes).

---

### INFO ONLY - Solutions Provided

1. **Test levels**: Go unit tests + Go integration tests (primary), RN component tests, selective E2E for critical paths
2. **Tooling**: Go test (backend), Jest + RNTL (frontend components), Playwright (E2E)
3. **Execution**: PR (<10 min), Nightly (E2E + perf smoke), Weekly (load tests)
4. **Coverage**: ~62 test scenarios prioritized P0-P3 with risk-based classification
5. **Quality gates**: P0=100%, P1>=95%, high-risk mitigations complete before MVP

**What we need from team:** Just review and acknowledge.

---

## For Architects and Devs

### Risk Assessment

**Total risks identified**: 12 (5 high-priority score >= 6, 4 medium, 3 low)

#### High-Priority Risks (Score >= 6) - IMMEDIATE ATTENTION

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner | Timeline |
|---------|----------|-------------|---|---|-------|------------|-------|----------|
| **R-001** | **BUS** | Multi-role check-in conflict: vendor checked in at Market A tries Market B; conflict detection crosses market boundaries | 2 | 3 | **6** | Unit tests for conflict detection; integration test for cross-market scenario | Dev | Epic 4 |
| **R-002** | **PERF** | Firebase Realtime propagation may exceed 60s SLO under load | 2 | 3 | **6** | Load test write-to-read latency; implement polling fallback (NFR6) | Dev | Epic 4 |
| **R-003** | **DATA** | Audit trigger missing on new domain table in future migration | 2 | 3 | **6** | CI check scanning pg_trigger catalog; integration test verifying all tables | Dev | Epic 1 |
| **R-006** | **DATA** | Soft-delete leak: query forgets `WHERE deleted_at IS NULL` | 2 | 3 | **6** | Integration tests on all query paths; consider DB views or query helper enforcement | Dev | All Epics |
| **R-011** | **PERF** | Saturday 6-10am peak: Cloud Run autoscaling too slow, connection pool exhaustion | 2 | 3 | **6** | Load test simulating NFR8 concurrency targets; validate min-instances=1 warm start | Dev | Pre-MVP |

#### Medium-Priority Risks (Score 4-5)

| Risk ID | Category | Description | P | I | Score | Mitigation | Owner |
|---------|----------|-------------|---|---|-------|------------|-------|
| R-004 | TECH | Optimistic UI desync: MMKV queued mutations replay out of order | 2 | 2 | 4 | Unit test queue ordering; integration test conflict resolution | Dev |
| R-008 | OPS | FCM notification delivery failure not retried (NFR7) | 2 | 2 | 4 | Integration test: simulate FCM failure, verify retry | Dev |
| R-010 | SEC | JWT custom claim stale after role change | 2 | 2 | 4 | Force token refresh on role change; integration test | Dev |
| R-012 | TECH | GraphQL schema drift between frontend and backend repos | 2 | 2 | 4 | CI schema validation on both repos | Dev |

#### Low-Priority Risks (Score 1-3)

| Risk ID | Category | Description | P | I | Score | Action |
|---------|----------|-------------|---|---|-------|--------|
| R-005 | SEC | Manager scope bypass (resolver misses market_managers check) | 1 | 3 | 3 | Document + negative test |
| R-007 | OPS | Auto-checkout Cloud Scheduler job fails silently | 1 | 3 | 3 | Document + monitoring |
| R-009 | SEC | Two-manager minimum bypass via race condition | 1 | 3 | 3 | Document + DB constraint |

#### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

### Testability Concerns and Architectural Gaps

#### 1. Blockers to Fast Feedback

| Concern | Impact | What Architecture Must Provide | Owner | Timeline |
|---------|--------|-------------------------------|-------|----------|
| **No Firebase Emulator config** | Cannot test any authenticated flow | Firebase Emulator Suite configured for Auth + Realtime in local and CI | Dev | Story 1.1b |
| **No test database isolation** | Tests pollute each other's state; audit_log rows cannot be cleaned | Per-test transaction rollback or test-scoped database/schema | Dev | Story 1.1b |
| **No test data seeding** | Cannot set up preconditions for integration tests | Go test helpers that seed through resolvers (not raw SQL) | Dev | Story 1.1b |

#### 2. Architectural Improvements Needed

1. **Firebase Realtime deterministic testing**
   - **Current problem**: Real-time propagation is eventually consistent (<60s SLO), making tests non-deterministic
   - **Required change**: Use Firebase Emulator with deterministic write confirmation; implement polling helpers that wait for state arrival
   - **Impact if not fixed**: Flaky tests, false failures in CI
   - **Owner**: Dev
   - **Timeline**: Epic 4

---

### Testability Assessment Summary

#### What Works Well

- GraphQL API provides 100% headless access to all business logic (no UI dependency for testing)
- In-process domain event bus is easy to mock in unit tests
- PostgreSQL audit triggers guarantee audit coverage at DB level (no application code to miss)
- Schema-first GraphQL with gqlgen + @graphql-codegen catches contract drift at compile time
- Stateless Cloud Run with ACID PostgreSQL transactions ensures reliability
- Structured logging via slog provides strong observability

#### Accepted Trade-offs

- **Audit_log immutability in tests** - Test databases will accumulate audit_log rows. Acceptable for MVP; use per-test databases if volume becomes an issue.
- **No server-side caching** - Deferred to post-MVP. Means no cache invalidation testing needed now.

---

### Risk Mitigation Plans (High-Priority Risks >= 6)

#### R-001: Multi-Role Check-In Conflict (Score: 6)

**Mitigation Strategy:**

1. Implement check-in conflict detection as a pure function (unit-testable)
2. Integration test: create vendor, check in at Market A, attempt check in at Market B, verify conflict warning
3. Edge case: same-day boundary at midnight, concurrent check-in attempts

**Owner:** Dev
**Timeline:** Epic 4 (Story 4.1)
**Status:** Planned
**Verification:** Integration test passes with cross-market conflict scenario

#### R-002: Firebase Realtime 60s SLO (Score: 6)

**Mitigation Strategy:**

1. Measure write-to-read latency under load using Firebase Emulator
2. Implement polling fallback (NFR6) if Firebase Realtime subscription fails
3. Load test: 50 concurrent vendor status changes, measure propagation time

**Owner:** Dev
**Timeline:** Epic 4-5
**Status:** Planned
**Verification:** Load test confirms P95 propagation < 60s at pilot scale

#### R-003: Missing Audit Trigger on New Table (Score: 6)

**Mitigation Strategy:**

1. Create CI check that queries `pg_trigger` catalog and verifies every domain table has the reusable audit trigger
2. Integration test: insert/update/delete on every domain table, verify audit_log row created

**Owner:** Dev
**Timeline:** Story 1.1b (initial), ongoing for new migrations
**Status:** Planned
**Verification:** CI check fails if migration adds table without trigger

#### R-006: Soft-Delete Data Leak (Score: 6)

**Mitigation Strategy:**

1. Consider PostgreSQL views (e.g., `active_vendors`) that pre-filter `WHERE deleted_at IS NULL`
2. Integration test: create record, soft-delete, verify excluded from every query/resolver that returns that entity type
3. Code review checklist item for all new resolvers

**Owner:** Dev
**Timeline:** All epics (ongoing)
**Status:** Planned
**Verification:** Integration test suite covers all query paths

#### R-011: Saturday Peak Load (Score: 6)

**Mitigation Strategy:**

1. Load test simulating NFR8: 50 concurrent vendor/manager + 200 customer sessions
2. Validate Cloud Run autoscaling with min-instances=1 (no cold start)
3. Monitor Cloud SQL connection pool under peak concurrency

**Owner:** Dev
**Timeline:** Pre-MVP (after Epics 4-6 implemented)
**Status:** Planned
**Verification:** Load test passes at NFR8 concurrency targets

---

### Assumptions and Dependencies

#### Assumptions

1. Firebase Emulator Suite provides sufficient fidelity for Auth and Realtime testing
2. Cloud SQL Auth Proxy connection pooling handles pilot-scale concurrency (50+200 concurrent)
3. GraphQL schema is the single source of truth; both codebases generate from it

#### Dependencies

1. Firebase project setup (Auth + Realtime + FCM) - Required by Story 1.1b
2. Cloud SQL instance provisioned - Required by Story 1.1b
3. Firebase Emulator Suite configured in CI - Required before integration tests

#### Risks to Plan

- **Risk**: Firebase Emulator behavior diverges from production Firebase
  - **Impact**: Tests pass locally but fail in production
  - **Contingency**: Run critical E2E flows against staging Firebase project in nightly CI

---

**End of Architecture Document**

**Next Steps for Development Team:**

1. Review Quick Guide and prioritize the 3 pre-implementation blockers
2. Include Firebase Emulator + test database setup in Story 1.1b
3. Validate soft-delete enforcement approach (views vs. query helpers)

**Next Steps for QA:**

1. Wait for pre-implementation blockers to be resolved in Story 1.1b
2. Refer to companion QA doc (test-design-qa.md) for test scenarios and coverage plan
3. Begin test infrastructure setup (factories, fixtures) alongside Story 1.1b
