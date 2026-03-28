---
stepsCompleted: ['step-01-detect-mode', 'step-02-load-context', 'step-03-risk-and-testability', 'step-04-coverage-plan', 'step-05-generate-output']
lastStep: 'step-05-generate-output'
lastSaved: '2026-03-28'
inputDocuments:
  - '_bmad-output/planning-artifacts/architecture.md'
  - '_bmad-output/planning-artifacts/epics.md'
  - '_bmad/tea/testarch/knowledge/adr-quality-readiness-checklist.md'
  - '_bmad/tea/testarch/knowledge/test-levels-framework.md'
  - '_bmad/tea/testarch/knowledge/risk-governance.md'
  - '_bmad/tea/testarch/knowledge/test-quality.md'
---

# Test Design Progress

## Step 1: Mode Detection & Prerequisites

- **Mode:** System-Level
- **Rationale:** Full planning stack available (PRD requirements, architecture, epics). Pre-implementation phase — system-level test architecture needed before epic-level work.
- **Prerequisites validated:**
  - PRD functional/non-functional requirements: Captured in architecture.md (52 FRs across 7 categories, 25 NFRs across 6 domains)
  - Architecture decision document: architecture.md (complete)
  - Epics and stories: epics.md (complete)
  - UX Design Specification: ux-design-specification.md
  - Implementation Readiness Report: implementation-readiness-report-2026-03-21.md

## Step 2: Context Loaded

- Config: tea_use_playwright_utils=true, tea_use_pactjs_utils=true, tea_pact_mcp=mcp, detected_stack=fullstack
- Architecture: React Native/Expo + Go/gqlgen + GCP (Cloud Run, Cloud SQL, Firebase Auth/Realtime/FCM)
- Requirements: 52 FRs, 25 NFRs, 18 UX-DRs
- Knowledge fragments: adr-quality-readiness-checklist, test-levels-framework, risk-governance, test-quality, probability-impact

## Step 3: Testability & Risk Assessment

### Testability Concerns

| ID | Concern | Status | Impact |
|----|---------|--------|--------|
| TC-1 | No test data seeding infrastructure | ACTIONABLE | Pre-implementation blocker |
| TC-2 | Firebase Auth dependency in all paths | ACTIONABLE | Pre-implementation blocker |
| TC-3 | Firebase Realtime as state propagation | ACTIONABLE | Needed for Epic 4+ |
| TC-4 | PostgreSQL audit trigger coupling | FYI | Test cleanup must account for audit_log |
| TC-5 | Domain event bus is in-process synchronous | FYI | Strength — easy to mock |
| TC-6 | GraphQL schema as contract | FYI | Strength — typed, compile-time verified |

### Testability Assessment

| Dimension | Rating | Notes |
|-----------|--------|-------|
| Controllability | Medium | GraphQL headless access (strong), Firebase needs emulation (gap) |
| Observability | Strong | slog, audit triggers, GraphQL error codes |
| Reliability | Strong | Stateless Cloud Run, ACID transactions |
| Isolation | Medium | In-process event bus (easy to mock), Firebase needs emulator |

### ASRs

| ASR | Status | Impact |
|-----|--------|--------|
| Firebase Auth Emulator integration | ACTIONABLE | Cannot test authenticated flows |
| Test database strategy (per-test isolation) | ACTIONABLE | Tests will pollute state |
| Firebase Realtime Emulator | ACTIONABLE | Real-time tests will be flaky |
| GraphQL schema validation in CI | FYI | Already in architecture |
| Audit trigger verification tests | FYI | Integration test concern |

### Risk Assessment

| ID | Risk | Cat | P | I | Score | Action |
|----|------|-----|---|---|-------|--------|
| R-001 | Multi-role check-in conflict | BUS | 2 | 3 | 6 | MITIGATE |
| R-002 | Firebase Realtime 60s SLO breach | PERF | 2 | 3 | 6 | MITIGATE |
| R-003 | Missing audit trigger on new table | DATA | 2 | 3 | 6 | MITIGATE |
| R-004 | Optimistic UI desync (MMKV replay) | TECH | 2 | 2 | 4 | MONITOR |
| R-005 | Manager scope bypass | SEC | 1 | 3 | 3 | DOCUMENT |
| R-006 | Soft-delete data leak | DATA | 2 | 3 | 6 | MITIGATE |
| R-007 | Auto-checkout silent failure | OPS | 1 | 3 | 3 | DOCUMENT |
| R-008 | FCM notification retry failure | OPS | 2 | 2 | 4 | MONITOR |
| R-009 | Two-manager minimum bypass | SEC | 1 | 3 | 3 | DOCUMENT |
| R-010 | JWT custom claim stale after role change | SEC | 2 | 2 | 4 | MONITOR |
| R-011 | Saturday peak load | PERF | 2 | 3 | 6 | MITIGATE |
| R-012 | GraphQL schema drift | TECH | 2 | 2 | 4 | MONITOR |

### Risk Summary

- **No BLOCK risks (score=9)** — architecture is well-designed
- **5 MITIGATE risks (score=6)**: R-001, R-002, R-003, R-006, R-011
- **4 MONITOR risks (score=4)**: R-004, R-008, R-010, R-012
- **3 DOCUMENT risks (score=3)**: R-005, R-007, R-009
- **Gate Recommendation:** CONCERNS — proceed, but high-risk areas need test coverage before MVP
