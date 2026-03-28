---
title: 'TEA Test Design -> BMAD Handoff Document'
version: '1.0'
workflowType: 'testarch-test-design-handoff'
inputDocuments:
  - '_bmad-output/test-artifacts/test-design-architecture.md'
  - '_bmad-output/test-artifacts/test-design-qa.md'
sourceWorkflow: 'testarch-test-design'
generatedBy: 'TEA Master Test Architect'
generatedAt: '2026-03-28'
projectName: 'markets'
---

# TEA -> BMAD Integration Handoff

## Purpose

This document bridges TEA's test design outputs with BMAD's epic/story decomposition workflow (`create-epics-and-stories`). It provides structured integration guidance so that quality requirements, risk assessments, and test strategies flow into implementation planning.

## TEA Artifacts Inventory

| Artifact | Path | BMAD Integration Point |
|----------|------|------------------------|
| Architecture Test Design | `_bmad-output/test-artifacts/test-design-architecture.md` | Epic quality requirements, testability blockers |
| QA Test Design | `_bmad-output/test-artifacts/test-design-qa.md` | Story acceptance criteria, test coverage plan |
| Risk Assessment | (embedded in both documents) | Epic risk classification, story priority |
| Coverage Strategy | (embedded in QA document) | Story test requirements |
| Progress Tracker | `_bmad-output/test-artifacts/test-design-progress.md` | Workflow completion status |

## Epic-Level Integration Guidance

### Risk References

The following P0/P1 risks should appear as epic-level quality gates:

- **Epic 1 (Auth)**: R-003 (audit trigger coverage), R-005 (scope bypass), R-006 (soft-delete leak)
- **Epic 4 (Check-in)**: R-001 (cross-market conflict), R-002 (Realtime 60s SLO), R-004 (optimistic UI desync)
- **Epic 5 (Dashboard)**: R-002 (Realtime SLO), R-007 (auto-checkout failure)
- **Epic 7 (Notifications)**: R-008 (FCM retry failure)
- **Epic 8 (Audit)**: R-003 (trigger coverage), R-006 (soft-delete leak), R-009 (2-manager bypass)
- **Cross-cutting**: R-011 (Saturday peak load) - validate before MVP release

### Quality Gates

| Epic | Gate Criteria |
|------|--------------|
| Epic 1 | Firebase Emulator configured, test DB isolation working, audit triggers verified on all initial tables |
| Epic 4 | Check-in conflict detection tested (unit + integration), optimistic UI component tests pass |
| Epic 5 | Real-time dashboard update within 60s SLO, auto-checkout idempotency verified |
| Epic 7 | FCM retry logic tested, notification preferences respected |
| Epic 8 | All domain tables have audit trigger (catalog scan), soft-delete exclusion verified on all queries |
| Pre-MVP | Load test passes at NFR8 concurrency (50+200 concurrent sessions) |

## Story-Level Integration Guidance

### P0/P1 Test Scenarios -> Story Acceptance Criteria

These critical test scenarios MUST be reflected in story acceptance criteria:

| Test ID | Scenario | Target Story | Priority |
|---------|----------|-------------|----------|
| 1.1-INT-002 | Audit trigger fires on all domain tables | Story 1.1b | P0 |
| 1.4-INT-002 | Unauthorized market access returns FORBIDDEN | Story 1.4 | P0 |
| 1.5-INT-002 | Soft-deleted records excluded from queries | Story 1.5 | P0 |
| 4.1-UNIT-001 | Cross-market check-in conflict detected | Story 4.1 | P0 |
| 4.1-INT-002 | Check-in at Market B while at A triggers warning | Story 4.1 | P0 |
| 5.5-INT-001 | Auto-checkout at market close (idempotent) | Story 5.5 | P1 |
| 7.2-INT-002 | FCM failure triggers retry (NFR7) | Story 7.2 | P1 |
| 8.1-INT-001 | CI check: all domain tables have audit trigger | Story 8.1 | P0 |

### Data-TestId Requirements

Recommended `data-testid` attributes for testability (React Native components):

- `check-in-button` - CheckInButton component (UX-DR4)
- `status-badge` - StatusBadge component (UX-DR2)
- `attendance-summary-bar` - AttendanceSummaryBar (UX-DR5)
- `freshness-timestamp` - FreshnessTimestamp (UX-DR6)
- `vendor-card` - VendorCard component (UX-DR3)
- `market-card` - MarketCard component (UX-DR7)
- `exception-status-selector` - ExceptionStatusSelector (UX-DR8)
- `activity-feed-item` - ActivityFeedItem (UX-DR9)

## Risk-to-Story Mapping

| Risk ID | Category | P x I | Recommended Story/Epic | Test Level |
|---------|----------|-------|------------------------|------------|
| R-001 | BUS | 2x3=6 | Story 4.1 (Vendor Check-In) | Unit + Integration |
| R-002 | PERF | 2x3=6 | Story 4.1, 5.1 (Check-in, Dashboard) | Integration + Load |
| R-003 | DATA | 2x3=6 | Story 1.1b, 8.1 (Scaffolding, Audit) | Integration + CI |
| R-004 | TECH | 2x2=4 | Story 4.1 (Check-In offline) | Unit + Integration |
| R-005 | SEC | 1x3=3 | Story 1.4, 1.5 (Permissions) | Integration |
| R-006 | DATA | 2x3=6 | Story 1.5, 8.3 (Access, Deletion) | Integration |
| R-007 | OPS | 1x3=3 | Story 5.5 (Auto-checkout) | Integration |
| R-008 | OPS | 2x2=4 | Story 7.2 (Notifications) | Integration |
| R-009 | SEC | 1x3=3 | Story 8.4 (Governance) | Integration |
| R-010 | SEC | 2x2=4 | Story 1.3 (Role Selection) | Integration |
| R-011 | PERF | 2x3=6 | Pre-MVP (cross-cutting) | Load Test |
| R-012 | TECH | 2x2=4 | Story 1.1a, 1.1b (Scaffolding) | CI |

## Recommended BMAD -> TEA Workflow Sequence

1. **TEA Test Design** (`TD`) -> produces this handoff document (DONE)
2. **BMAD Create Epics & Stories** -> consumes this handoff, embeds quality requirements
3. **TEA ATDD** (`AT`) -> generates acceptance tests per story
4. **BMAD Implementation** -> developers implement with test-first guidance (TDD)
5. **TEA Automate** (`TA`) -> generates full test suite
6. **TEA Trace** (`TR`) -> validates coverage completeness

## Phase Transition Quality Gates

| From Phase | To Phase | Gate Criteria |
|------------|----------|---------------|
| Test Design | Epic/Story Creation | All P0 risks have mitigation strategy (DONE) |
| Epic/Story Creation | ATDD | Stories have acceptance criteria from test design |
| ATDD | Implementation | Failing acceptance tests exist for all P0/P1 scenarios |
| Implementation | Test Automation | All acceptance tests pass |
| Test Automation | Release | Trace matrix shows >= 80% coverage of P0/P1 requirements |
