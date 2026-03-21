---
stepsCompleted: [1, 2]
inputDocuments:
  - "_bmad-output/brainstorming/brainstorming-session-2026-03-15-16-19-33.md"
  - "_bmad-output/planning-artifacts/research/market-farmer-and-art-market-app-research-2026-03-15.md"
  - "_bmad-output/planning-artifacts/research/domain-farmer-and-art-market-ecosystem-research-2026-03-15.md"
  - "_bmad-output/planning-artifacts/research/domain-real-time-object-detection-research-2026-03-15.md"
  - "_bmad-output/planning-artifacts/research/technical-react-graphql-supabase-research-2026-03-15.md"
  - "_bmad-output/planning-artifacts/research/feature-priority-matrix-market-app-2026-03-15.md"
date: 2026-03-20
author: Human
---

# Product Brief: markets

<!-- Content will be appended sequentially through collaborative workflow steps -->

## Executive Summary

**markets** is a real-time market coordination platform that connects customers, vendors, and market managers through a single confidence-centered operational network. It transforms how farmers markets and art markets run on market day — moving from fragmented, stale, manual communication to a live operational truth shared across all participants.

The product solves a persistent and measurable problem: customers make wasted trips because they cannot verify who is present or what is available before traveling. Vendors lose customers because updating their status requires too much effort. Market managers operate without a unified view of attendance, disruptions, and communications. Every existing tool addresses one actor in isolation, leaving the coordination layer empty.

**markets** fills that gap by building a canonical event stream that powers role-specific experiences for all three actors simultaneously — arrival feed for customers, exception controls for vendors, and live operations dashboard for managers.

---

## Core Vision

### Problem Statement

Customers traveling to farmer and art markets cannot reliably know who will be present, what will be available, or whether conditions have changed — until they arrive. This pre-visit uncertainty leads to wasted trips, reduced participation, and eroded trust in local markets. Vendors face the reverse problem: maintaining accurate real-time status requires too much overhead on an already chaotic market day, so they go dark rather than update. Market managers have no unified operations view, relying on fragmented channels to coordinate attendance, disruptions, and communications.

The domain has no shared truth layer. Each actor operates with incomplete, stale, or inconsistent information.

### Problem Impact

- **Customers** make failed trips when vendors are absent, sold out, or running late — reducing trust and repeat attendance, especially among time-constrained and budget-sensitive shoppers
- **Vendors** lose customer demand when they can't quickly signal their presence or exceptions without high effort — creating an invisible attendance and adoption risk
- **Market managers** cannot maintain operational confidence during live events, leading to slow disruption resolution, conflicting communications, and post-event accountability gaps
- **Markets overall** face trust erosion when digital status does not match on-site reality — reducing the perceived reliability of the market as a destination

### Why Existing Solutions Fall Short

Current market software fragments by workflow layer rather than actor coordination:

- **Marketspread / ManageMyMarket** — strong market administration (applications, stall assignment, billing) but no customer-facing confidence layer or live vendor status
- **Local Line / Barn2Door** — producer commerce and ordering capability but no real-time attendance or exception signaling
- **LocalHarvest** — directory and discovery but static, no operational coordination
- **Eventeny** — adjacent event operations but not specialized to produce-market trust and availability workflows

No existing product builds a unified confidence layer that spans customer intent, vendor real-time status, and manager verification in a single operational loop.

### Proposed Solution

**markets** is a real-time market operations network built on a canonical event stream. Every significant operational action — vendor arrival, inventory exception, disruption broadcast, manager override — is recorded as a canonical event and rendered through role-specific views.

Core platform capabilities:

- **Verified arrival stream** — passive geofenced vendor arrival detection generates live feed events visible to customers and managers with confidence and freshness metadata
- **Exception-first vendor controls** — one-tap check-in, sold-out, running late, and not-attending states minimize vendor overhead while keeping market-day truth current
- **Customer confidence feed** — a live activity feed surfaces same-day vendor arrivals, exceptions, and updates as the primary discovery surface before static directory browsing
- **Manager operations dashboard** — live roster of vendors with confidence scores, unified disruption command view, instant market-wide broadcast, and post-event reliability analytics
- **Activation backbone** — market calendar, vendor scheduling, and sequential activation gates ensure supply-side and demand-side readiness are validated before market day

### Key Differentiators

1. **Cross-actor coordination as the core product** — not a vendor app, not a manager tool, not a customer directory — all three actors share one operational truth layer
2. **Confidence explainability** — every status claim shows its source signal, freshness timestamp, and confidence level; customers can inspect why a vendor is shown as present
3. **Exception-first, low-friction vendor model** — defaults to baseline availability and asks vendors only for meaningful exceptions, designed for the chaos of real market-day setup
4. **Canonical event stream** — one event model powers customer feed, manager operations, vendor notifications, and post-event reliability analytics — eliminating conflicting truths
5. **Sequential activation gates** — product success is measured at operational readiness (market with live calendar + vendor scheduled + manager can publish + customer can browse) not at account creation
