---
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
lastSaved: '2026-03-28'
workflowType: 'testarch-test-design'
inputDocuments:
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/epics.md'
---

# Test Design for QA: Markets Platform

**Purpose:** Test execution recipe for the development team. Defines what to test, how to test it, and what is needed from other teams.

**Date:** 2026-03-28
**Author:** Murat (TEA Master Test Architect)
**Status:** Draft
**Project:** markets

**Related:** See Architecture doc (test-design-architecture.md) for testability concerns and architectural blockers.

---

## Executive Summary

**Scope:** System-level test design covering all 8 epics of the Markets platform: authentication, market administration, vendor profiles, market-day operations, manager dashboard, customer discovery, notifications, and audit/governance.

**Risk Summary:**

- Total Risks: 12 (5 high-priority score >= 6, 4 medium, 3 low)
- Critical Categories: DATA (2 high), PERF (2 high), BUS (1 high)

**Coverage Summary:**

- P0 tests: ~12 (auth, authorization, audit, check-in conflict, soft-delete)
- P1 tests: ~35 (core domain CRUD, real-time, notifications, components)
- P2 tests: ~12 (secondary flows, edge cases, alternative discovery)
- P3 tests: ~3 (load benchmarks, exploratory)
- **Total**: ~62 tests (~57-100 hours with 1 developer, incremental with each epic)

---

## Not in Scope

| Item | Reasoning | Mitigation |
|------|-----------|------------|
| **Server-side caching** | Deferred to post-MVP per architecture | Not needed at pilot scale |
| **Rate limiting** | Deferred to post-MVP per architecture | Log mutation frequency for analysis |
| **Advanced offline-first** | MVP handles low-signal, not full offline | MMKV queue covers critical path |
| **Visual regression testing** | No design system implementation yet | Add after UX components stabilize |

---

## Dependencies & Test Blockers

**Source:** See Architecture doc "Quick Guide" for detailed mitigation plans.

### Backend Dependencies (Pre-Implementation)

1. **Firebase Emulator Suite** - Dev - Story 1.1b
   - Auth Emulator for generating test JWTs
   - Realtime Database Emulator for status propagation tests
   - Blocks all authenticated integration tests

2. **Test Database Isolation** - Dev - Story 1.1b
   - Per-test transaction rollback or test-scoped schemas
   - Audit_log rows are immutable; test DBs will accumulate them
   - Blocks all database integration tests

3. **Test Data Seeding Helpers** - Dev - Story 1.1b
   - Go functions that seed data through resolvers
   - Must trigger audit triggers and event bus (not raw SQL)
   - Blocks most integration tests

### QA Infrastructure Setup (Pre-Implementation)

1. **Go Test Factories**
   - `createTestUser(role)` - returns user with Firebase test token
   - `createTestMarket(managerId)` - returns market with manager assignment
   - `createTestVendor(userId)` - returns vendor profile with products
   - Auto-cleanup via test database rollback

2. **React Native Test Setup**
   - Jest + React Native Testing Library for component tests
   - Mock Apollo Provider for GraphQL hook testing
   - Mock Firebase Auth context

**Example Go integration test pattern:**

```go
func TestCheckInVendor(t *testing.T) {
    // Setup: seed via test helpers (exercises audit triggers)
    ctx := testutil.AuthContext(t, "vendor")
    market := testutil.CreateMarket(t, ctx)
    vendor := testutil.CreateVendor(t, ctx)
    testutil.AddVendorToRoster(t, ctx, vendor.ID, market.ID)

    // Act: call resolver
    result, err := resolver.CheckInVendor(ctx, model.CheckInInput{
        MarketID: market.ID,
    })

    // Assert
    require.NoError(t, err)
    assert.Equal(t, model.StatusCheckedIn, result.Status)

    // Verify audit log entry was created by trigger
    auditEntry := testutil.GetLatestAuditEntry(t, "check_ins")
    assert.Equal(t, "INSERT", auditEntry.ActionType)
    assert.Equal(t, vendor.UserID, auditEntry.ActorID)
}
```

---

## Risk Assessment

**Note:** Full risk details in Architecture doc. This section summarizes risks relevant to test planning.

### High-Priority Risks (Score >= 6)

| Risk ID | Category | Description | Score | QA Test Coverage |
|---------|----------|-------------|-------|------------------|
| **R-001** | BUS | Multi-role check-in conflict | **6** | Unit test conflict logic + integration test cross-market check-in |
| **R-002** | PERF | Firebase Realtime 60s SLO | **6** | Load test write-to-read latency at pilot concurrency |
| **R-003** | DATA | Missing audit trigger on new table | **6** | Integration test scanning pg_trigger catalog |
| **R-006** | DATA | Soft-delete data leak | **6** | Integration test: soft-delete → verify excluded from all queries |
| **R-011** | PERF | Saturday peak load | **6** | Load test at NFR8 concurrency (50+200 concurrent) |

### Medium/Low-Priority Risks

| Risk ID | Category | Description | Score | QA Test Coverage |
|---------|----------|-------------|-------|------------------|
| R-004 | TECH | Optimistic UI desync (MMKV replay) | 4 | Unit test queue ordering |
| R-005 | SEC | Manager scope bypass | 3 | Negative auth test: wrong market -> FORBIDDEN |
| R-008 | OPS | FCM notification retry failure | 4 | Integration test: mock FCM failure -> verify retry |
| R-010 | SEC | JWT custom claim stale after role change | 4 | Integration test: change role -> verify claim refresh |

---

## Entry Criteria

- [ ] Firebase Emulator Suite configured (Auth + Realtime)
- [ ] Test database isolation strategy implemented (rollback or per-test schema)
- [ ] Go test data seeding helpers available
- [ ] CI pipeline running Go tests and RN tests
- [ ] Feature deployed to test environment

## Exit Criteria

- [ ] All P0 tests passing (100%)
- [ ] All P1 tests passing (>= 95%)
- [ ] No open high-severity bugs
- [ ] 5 high-risk mitigations (R-001, R-002, R-003, R-006, R-011) have test coverage
- [ ] Load test passes at NFR8 concurrency targets

---

## Test Coverage Plan

**IMPORTANT:** P0/P1/P2/P3 = **priority and risk level** (what to focus on if time-constrained), NOT execution timing. See "Execution Strategy" for when tests run.

### P0 (Critical)

**Criteria:** Blocks core functionality + High risk (>= 6) + No workaround + Affects majority of users

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---------|-------------|------------|-----------|-------|
| **1.1-UNIT-001** | JWT validation (valid/expired/malformed) | Unit (Go) | - | Auth foundation |
| **1.1-UNIT-002** | Role extraction from custom claims | Unit (Go) | - | Auth foundation |
| **1.1-INT-001** | Auth middleware sets PG session variables | Integration (Go) | - | Enables audit triggers |
| **1.1-INT-002** | Audit trigger fires on INSERT/UPDATE/DELETE | Integration (Go) | R-003 | Verify all domain tables |
| **1.2-INT-002** | Invalid JWT returns UNAUTHENTICATED | Integration (Go) | - | Security gate |
| **1.4-INT-001** | Manager authorized for Market A can query | Integration (Go) | R-005 | Scope enforcement |
| **1.4-INT-002** | Manager NOT authorized -> FORBIDDEN | Integration (Go) | R-005 | Negative test |
| **1.5-INT-001** | Customer JWT -> vendor mutation -> FORBIDDEN | Integration (Go) | R-005 | Role enforcement |
| **1.5-INT-002** | Soft-deleted records excluded from queries | Integration (Go) | R-006 | All entity types |
| **4.1-UNIT-001** | Check-in conflict detection logic | Unit (Go) | R-001 | Cross-market same-day |
| **4.1-INT-001** | Vendor check-in -> SQL + Realtime + audit | Integration (Go) | - | Core action |
| **4.1-INT-002** | Check-in at Market B while at A -> conflict | Integration (Go) | R-001 | Business rule |

**Total P0:** ~12 tests

---

### P1 (High)

**Criteria:** Important features + Medium risk + Common workflows

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---------|-------------|------------|-----------|-------|
| **1.1-INT-003** | Audit_log rejects UPDATE/DELETE | Integration (Go) | - | Immutability |
| **1.1-INT-004** | Domain event bus publishes after write | Integration (Go) | - | Event-driven |
| **1.2-INT-001** | Google Sign-In -> JWT -> user record | Integration (Go) | - | Auth flow |
| **1.3-INT-001** | First-time user -> role -> Cloud SQL record | Integration (Go) | R-010 | Onboarding |
| **1.4-INT-003** | Remove manager rejects if < 2 remain | Integration (Go) | R-009 | Governance |
| **2.1-INT-001** | createMarket + auto-assign manager | Integration (Go) | - | Market CRUD |
| **2.2-INT-001** | Market schedule CRUD | Integration (Go) | - | Schedule |
| **2.2e-INT-001** | Cancel market -> auto-checkout + notify | Integration (Go) | - | Emergency flow |
| **2.3-INT-001** | Vendor join request -> PENDING per date | Integration (Go) | - | Roster |
| **2.3-INT-002** | Approve join -> APPROVED, on roster | Integration (Go) | - | Roster |
| **2.3-INT-003** | Remove checked-in vendor -> warn first | Integration (Go) | - | FR20b |
| **3.1-INT-001** | Create vendor profile with social links | Integration (Go) | - | Profile |
| **3.2-INT-001** | Product catalog CRUD | Integration (Go) | - | Products |
| **3.3-INT-001** | Vendor requests market join for dates | Integration (Go) | - | Association |
| **4.1-INT-003** | Check-in failure -> MMKV queue -> retry | Integration (RN) | R-004 | Offline |
| **4.1-E2E-001** | Full check-in: tap -> optimistic -> confirm -> Realtime | E2E | R-002 | Critical path |
| **4.2-INT-001** | Exception status -> Firebase Realtime | Integration (Go) | - | Status update |
| **4.2-INT-002** | "Not Attending" -> checkout + notify | Integration (Go) | - | Exception flow |
| **5.1-INT-001** | Dashboard returns attendance counts | Integration (Go) | - | Manager view |
| **5.1-INT-002** | Real-time dashboard update within 60s | Integration (Go+FB) | R-002 | SLO |
| **5.3-INT-001** | Manager check-in on behalf -> attribution | Integration (Go) | - | FR20a |
| **5.5-INT-001** | Auto-checkout at market close | Integration (Go) | R-007 | Scheduled |
| **5.5-UNIT-001** | Auto-checkout idempotency | Unit (Go) | - | No duplicates |
| **6.1-INT-001** | Market search within 2s (NFR3) | Integration (Go) | - | Performance |
| **6.1-INT-002** | Vendor search by product intent | Integration (Go) | - | Discovery |
| **6.4-INT-001** | Following feed with live status | Integration (Go) | - | Customer home |
| **7.1-INT-001** | FCM device token registration | Integration (Go) | - | Push infra |
| **7.2-INT-001** | Vendor check-in -> FCM to followers | Integration (Go) | R-008 | Notification |
| **7.2-INT-002** | FCM failure -> retry (NFR7) | Integration (Go) | R-008 | Reliability |
| **8.1-INT-001** | All domain tables have audit trigger | Integration (Go) | R-003 | Catalog scan |
| **8.1-INT-002** | Audit entries include full payload | Integration (Go) | - | Completeness |
| **8.3-INT-001** | Soft-delete removes from user-facing queries | Integration (Go) | R-006 | Privacy |
| **8.3-INT-002** | Soft-deleted user's audit preserved | Integration (Go) | - | Integrity |
| **8.4-INT-001** | 2-manager min under concurrent removal | Integration (Go) | R-009 | Governance |
| **UX-COMP-001** | StatusBadge 5 variants + a11y labels | Component (RN) | - | UX-DR2 |
| **UX-COMP-002** | CheckInButton 4 states | Component (RN) | - | UX-DR4 |
| **UX-COMP-004** | FreshnessTimestamp auto-update 60s | Component (RN) | - | UX-DR6 |

**Total P1:** ~35 tests

---

### P2 (Medium)

**Criteria:** Secondary features + Low risk + Edge cases

| Test ID | Requirement | Test Level | Risk Link | Notes |
|---------|-------------|------------|-----------|-------|
| **2.1-INT-002** | updateMarket mutation | Integration (Go) | - | Profile edit |
| **3.3-INT-002** | Vendor views all market associations | Integration (Go) | - | Multi-market |
| **4.3-INT-001** | Product availability without catalog change | Integration (Go) | - | FR16 |
| **6.3-INT-001** | Follow/unfollow vendor | Integration (Go) | - | Relationship |
| **6.5-INT-001** | Alternative vendor suggestions | Integration (Go) | - | FR28 |
| **7.4-INT-001** | Notification preferences respected | Integration (Go) | - | Opt-out |
| **7.5-INT-001** | Manager activity feed for market day | Integration (Go) | - | Feed |
| **UX-COMP-003** | AttendanceSummaryBar tappable segments | Component (RN) | - | UX-DR5 |
| **UX-COMP-005** | Skeleton screen loading pattern | Component (RN) | - | UX-DR11 |
| **UX-COMP-006** | VendorCard compact/expanded variants | Component (RN) | - | UX-DR3 |
| **NFR-PERF-003** | Search returns within 2s at P95 | Load Test | - | NFR3 |
| **4.1-INT-004** | Optimistic UI shows "Checked In" | Component (RN) | - | Immediate feedback |

**Total P2:** ~12 tests

---

### P3 (Low)

**Criteria:** Nice-to-have + Performance benchmarks

| Test ID | Requirement | Test Level | Notes |
|---------|-------------|------------|-------|
| **NFR-PERF-001** | 50+200 concurrent sessions at peak | Load Test | NFR8 |
| **NFR-PERF-002** | Vendor action within 10s E2E | Load Test | NFR1 |
| **NFR-PERF-004** | Firebase Realtime within 60s at load | Load Test | NFR2 |

**Total P3:** ~3 tests

---

## Execution Strategy

| Trigger | What Runs | Target Duration |
|---------|-----------|-----------------|
| **Every PR** | All Go unit + integration tests, RN component tests | < 10 minutes |
| **Nightly** | Full E2E suite + NFR performance smoke tests | < 30 minutes |
| **Weekly** | Full load tests (NFR-PERF-001 through 004), audit trigger catalog scan | < 60 minutes |

**Philosophy:** Run everything in PRs if < 10 minutes. Go tests with parallelization and Firebase Emulator are fast. Defer only load tests (require infrastructure, long-running).

---

## QA Effort Estimate

| Priority | Count | Effort Range | Notes |
|----------|-------|-------------|-------|
| P0 | ~12 | ~15-25 hours | Firebase emulator setup drives initial complexity |
| P1 | ~35 | ~30-50 hours | Standard integration tests, incremental with epics |
| P2 | ~12 | ~10-20 hours | Edge cases, component tests |
| P3 | ~3 | ~2-5 hours | Load test scripts |
| **Total** | **~62** | **~57-100 hours** | **Incremental with each epic, not a separate phase** |

**Assumptions:**

- Includes test design, implementation, debugging, CI integration
- Excludes ongoing maintenance (~10% effort)
- Assumes test infrastructure (Firebase Emulator, test DB, seeding helpers) ready from Story 1.1b

---

## Implementation Planning Handoff

| Work Item | Owner | Target Milestone | Dependencies |
|-----------|-------|-----------------|--------------|
| Firebase Emulator Suite setup | Dev | Story 1.1b | Firebase project created |
| Test database isolation strategy | Dev | Story 1.1b | Cloud SQL provisioned |
| Go test data seeding helpers | Dev | Story 1.1b | Resolvers scaffolded |
| RN test setup (Jest + RNTL + mocks) | Dev | Story 1.1a | Expo project created |
| Audit trigger catalog CI check | Dev | Story 1.1b | Initial migration run |
| Load test infrastructure | Dev | Pre-MVP | All core epics implemented |

---

## Interworking & Regression

| Service/Component | Impact | Regression Scope | Validation |
|-------------------|--------|-----------------|------------|
| **Firebase Auth** | Auth for all requests | All authenticated tests must pass | JWT validation integration tests |
| **Firebase Realtime** | Status propagation | Real-time update tests | SLO measurement tests |
| **Cloud SQL** | All data persistence | All integration tests | Database isolation prevents cross-test pollution |
| **FCM** | Push notifications | Notification delivery tests | Mock FCM in tests, verify retry logic |

---

## Appendix A: Code Examples & Tagging

**Go Test Tags for Selective Execution:**

```go
// Unit test (always runs)
func TestCheckInConflictDetection(t *testing.T) { ... }

// Integration test (requires Firebase Emulator + Cloud SQL)
//go:build integration
func TestCheckInVendorIntegration(t *testing.T) { ... }

// Run commands:
// Unit tests only (fast, PR)
// go test ./...

// Integration tests (requires emulators)
// go test -tags=integration ./...
```

**React Native Component Test:**

```typescript
import { render, screen } from '@testing-library/react-native';
import { StatusBadge } from '@/components/ui/StatusBadge';

test('StatusBadge renders checked-in variant with a11y label', () => {
  render(<StatusBadge status="checked-in" size="md" />);

  const badge = screen.getByLabelText('Status: Checked In');
  expect(badge).toBeTruthy();
});
```

---

## Appendix B: Knowledge Base References

- **Risk Governance**: `risk-governance.md` - Risk scoring methodology (P x I matrix)
- **Probability-Impact**: `probability-impact.md` - 1-3 scale definitions
- **Test Levels Framework**: `test-levels-framework.md` - Unit vs Integration vs E2E selection
- **Test Quality**: `test-quality.md` - DoD (no hard waits, <300 lines, <1.5 min, self-cleaning)

---

**Generated by:** BMad TEA Agent
**Workflow:** `_bmad/tea/testarch/bmad-testarch-test-design`
