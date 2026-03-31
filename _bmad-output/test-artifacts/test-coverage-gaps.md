---
created: 2026-03-31
source: E2E test coverage audit mapped to PRD functional requirements
status: active
---

# Test Coverage Gaps — FR Traceability

All 9 epics are feature-complete. This document tracks **28 functional requirements with zero automated test coverage** and the infrastructure blockers preventing full test execution.

## Coverage Summary

| Layer | Implemented | Planned | Status |
|-------|:-:|:-:|--------|
| E2E (Playwright/Detox) | 0 | 62 | Not started |
| Go Integration | 8 cases | 12+ | **Disabled in CI** (no DB service) |
| RN Component | 30+ cases | — | Active in CI |
| Go Unit | 50+ cases | — | Active in CI |

**Overall FR coverage: 28/56 FRs tested (50%)**

---

## Infrastructure Blockers

| Blocker | Impact | Priority |
|---------|--------|:--------:|
| No `docker-compose.yml` | Cannot run full stack locally | P0 |
| Dockerfile uses Go 1.23 (needs 1.26) | Container build fails | P0 |
| No migration runner wired | DB schema not applied on startup | P0 |
| Firebase Emulator not configured | Cannot test authenticated flows in isolation | P1 |
| CI has no Postgres service | Integration tests skipped (`if: false`) | P1 |
| No E2E framework | Zero end-to-end coverage | P2 |

---

## FRs WITH Test Coverage (28/56)

| FR | Epic | Test Layer | Key Test Files |
|----|:----:|-----------|----------------|
| FR1-3 | 1 | Component | `useAuth.test.ts` |
| FR4 | 1 | Component + Integration | `layout-routing.test.tsx`, `role_enforcement_test.go` |
| FR5 | 1 | Integration | `market_test.go` |
| FR6 | 1 | Unit | `market.resolvers_test.go` |
| FR7 | 1 | Unit | `role_enforcement_test.go` |
| FR8 | 2 | Integration | `market_test.go` |
| FR9 | 2 | Unit | `market.resolvers_test.go` |
| FR10 | 2 | Unit | `market.resolvers_test.go` |
| FR11 | 3 | Component | `profile.test.tsx` (vendor) |
| FR12 | 3 | Unit | `vendor.resolvers_test.go` |
| FR14 | 4 | Unit | `vendor.resolvers_test.go` |
| FR17 | 5 | Component | `markets-index.test.tsx` |
| FR19 | 5 | Unit | `market.resolvers_test.go` |
| FR21 | 6 | Component | `discover.test.tsx` |
| FR24 | 6 | Component | `vendor-detail.test.tsx` |
| FR25 | 6 | Component + Unit | `useFollow.test.ts`, `following.test.tsx` |
| FR26 | 6 | Component | `useFollow.test.ts` |
| FR27 | 6 | Component | `following.test.tsx` |
| FR29 | 7 | Unit | `handler_test.go` (notify) |
| FR32a | 7 | Component | `activity.test.tsx` (manager) |
| FR32b | 7 | Component | `activity.test.tsx` (vendor) |
| FR32c | 7 | Component | `following.test.tsx` |
| FR35 | 8 | Unit | resolver tests |
| FR36 | 8 | Unit | `queries.go` tests |
| FR37 | 8 | Component | `ActivityLogScreen.test.tsx` |
| FR42 | 8 | Integration | `soft_delete_integration_test.go` |

---

## FRs WITHOUT Test Coverage (28/56)

### Epic 2: Market Administration (5 gaps)

| FR | Description | Suggested Test Type | Risk |
|----|-------------|-------------------|:----:|
| FR10a | Browse/invite vendors to market | Integration + Component | Medium |
| FR10b | Plan future market days | Component | Low |
| FR10c | Market rules/expectations | Component | Low |
| FR10d | Send vendor notifications | Integration | Medium |
| FR10e | Cancel/end market early | Integration | **High** |

### Epic 3: Vendor Profile (1 gap)

| FR | Description | Suggested Test Type | Risk |
|----|-------------|-------------------|:----:|
| FR13/13a | Market join requests (per-date) | Integration + Component | Medium |

### Epic 4: Market-Day Operations (3 gaps)

| FR | Description | Suggested Test Type | Risk |
|----|-------------|-------------------|:----:|
| FR15 | Exception status updates | Integration | Medium |
| FR16 | Product availability updates | Integration | Low |
| FR33 | Freshness context | Component | Low |

### Epic 5: Manager Dashboard (6 gaps)

| FR | Description | Suggested Test Type | Risk |
|----|-------------|-------------------|:----:|
| FR18 | Request vendor confirmation | Integration | Medium |
| FR20 | Status change propagation | E2E | **High** |
| FR20a | Manager check-in on behalf | Integration | **High** |
| FR20b | Roster removal warning | Component | Medium |
| FR20c | Auto-checkout at market close | Integration | **High** |
| FR20d | Checkout notifications | Integration | Medium |
| FR44 | Action attribution | Unit | Low |

### Epic 6: Customer Discovery (3 gaps)

| FR | Description | Suggested Test Type | Risk |
|----|-------------|-------------------|:----:|
| FR22 | Vendor search + radius | Component | Medium |
| FR23 | Discover by product intent | Component | Low |
| FR28 | View alternatives | Component | Low |

### Epic 7: Notifications (3 gaps)

| FR | Description | Suggested Test Type | Risk |
|----|-------------|-------------------|:----:|
| FR30 | Status change notifications | Integration | **High** |
| FR31 | Manager disruption alerts | Integration | Medium |
| FR43 | Notification preferences | Component | Low |

### Epic 8: Audit & Governance (7 gaps)

| FR | Description | Suggested Test Type | Risk |
|----|-------------|-------------------|:----:|
| FR38 | Recovery workflows | Integration | Medium |
| FR39 | Audit retention | Unit | Low |
| FR40 | Customer account deletion | Integration | **High** |
| FR41 | Vendor account deletion | Integration | **High** |
| FR41a | 2-manager minimum enforcement | Integration | **High** |
| FR41b | Manager recovery contact | Unit | Low |
| FR42a | Role switching | Component | Medium |

---

## Risk-Ranked Priority for Test Implementation

### P0 — High-Risk FRs (write tests before MVP launch)

1. **FR10e** — Cancel/end market early (triggers cascading notifications)
2. **FR20/20a/20c** — Status propagation, manager check-in, auto-checkout (core market-day integrity)
3. **FR30** — Status change notifications (customer-facing reliability)
4. **FR40/41** — Account deletion (privacy/legal compliance)
5. **FR41a** — 2-manager minimum (data integrity constraint)

### P1 — Medium-Risk FRs

6. FR10a/10d — Vendor invitations and notifications
7. FR13/13a — Join request flow
8. FR15/18 — Exception statuses, confirmation requests
9. FR22/31 — Vendor search, manager alerts
10. FR38/42a — Recovery workflows, role switching

### P2 — Low-Risk FRs

11. FR10b/10c, FR16, FR23, FR28, FR33, FR39, FR41b, FR43, FR44

---

## Relationship to Test Strategy Documents

- **62 planned test scenarios:** `_bmad-output/test-artifacts/test-design-qa.md`
- **Risk assessment (12 risks):** `_bmad-output/test-artifacts/test-design-progress.md`
- **Epic 1 test strategy (57 cases):** `_bmad-output/test-artifacts/epic-1-test-strategy.md`
- **Architecture testability:** `_bmad-output/test-artifacts/test-design-architecture.md`
