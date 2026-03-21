---
stepsCompleted: [1, 2, 3, 4]
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

---

## Target Users

### Primary Users

**markets** serves three distinct primary user groups, each with different goals and market-day realities.

---

#### User 1: The Market Shopper (Customer)

**Three customer segments with distinct needs:**

**Segment A — Maya, Mission-Driven Local Supporter**
Maya shops farmers markets every weekend. She cooks from scratch, values knowing her producer, and is willing to pay a premium for local quality. She builds a mental list before leaving home and takes real wasted trips personally — not just as inconvenience, but as a trust failure with the market. She wants to know which vendors are actually there, what's fresh, and whether her regulars showed up. Her "aha" moment: seeing a live arrival card for her favorite honey vendor before she's even left the house.

**Segment B — Daniel, Value-Conscious Planner**
Daniel comes to the market with a specific list and a budget. He doesn't browse — he hunts. Payment method clarity matters to him (SNAP eligibility, card vs cash). He's the most sensitive to wasted trips: time and transit cost are real constraints. He needs intent-to-stall matching ("where can I find X today") and clear fallback suggestions when items are sold out. His "aha" moment: building a confirmed shopping plan in 2 minutes that maps his list to specific vendors at one or two markets.

**Segment C — Sarah, Safety and Quality Assurer**
Sarah is motivated by food safety, quality confidence, and freshness. She's less price-sensitive and more status-sensitive — she reads source signals and freshness timestamps before she decides. She wants to know if a vendor's attendance is verified, not just claimed. Her "aha" moment: seeing a vendor's confidence score break down by signal source before she commits to going.

**Common journey across all customer segments:**

| Stage | Experience |
|---|---|
| Discovery | Local reputation, community channels, market repeat habit |
| Pre-visit | Opens app to check today's vendor roster and confidence signals |
| Decision | Go/no-go based on confirmed attendance and likely product availability |
| On-site | Navigates via vendor feed; receives exception updates in real time |
| Post-visit | Repeat intent tied to whether actual outcomes matched pre-visit confidence |

---

#### User 2: The Vendor

**Profile — Carmen, Small-Scale Food Producer**
Carmen runs a farm stand at 2–3 markets per weekend. On market morning she's loading vehicles, setting up, managing helpers, and handling cash — her phone is a multitasking device, not a dedicated ops screen. She needs check-in to take under 10 seconds. She does not want to maintain a live inventory feed; she wants to declare exceptions when things change (sold out, running late, not coming) and have the system handle the rest. She's at risk of churning from any app that creates more overhead than value.

**Carmen's core motivations:**
- One-tap check-in that boosts her visibility and notifies her followers automatically
- Quick exception posting (sold out, running late, not attending) without full catalog edits
- Confidence that her product status shown to customers is accurate — false claims cost her reputation

**Carmen's deal-breakers:**
- Too many mandatory daily updates
- Slow or unreliable app on market day
- Long onboarding before she can go live
- Customers seeing wrong status for her products

**Carmen's journey:**

| Stage | Experience |
|---|---|
| Onboarding | Short guided flow: identity, product categories, target markets, schedule, notification prefs |
| Pre-market | Reviews upcoming schedule; receives manager invitations |
| Market morning | One-tap check-in triggers customer notifications and visibility boost |
| During market | Posts exceptions (sold out, low stock) with one action; pauses products without full catalog edits |
| Post-market | Sees reliability score; reviews follower engagement |

---

#### User 3: The Market Manager

**Profile — Jordan, Community Market Director**
Jordan runs a weekly farmers and arts market with 40–80 vendors per event. Their biggest operational challenge is not the market itself — it's the uncertainty: vendors who don't confirm, late arrivals that don't notify, weather cancellations that need coordinated communication, and no-shows who leave gaps in the layout. They need one screen that tells them the real state of today's market, not three group chats and two spreadsheets.

**Jordan's core priorities:**
- Live roster of checked-in vendors with attendance confidence, updated in real time
- Instant market-wide broadcast capability across customer and vendor channels simultaneously
- Unified disruption dashboard: late arrivals, sold-outs, no-shows, and weather events in one view
- Post-event reliability reports: which vendors were accurate, late, or absent

**Jordan's escalation workflow:**
1. Unverified vendor at market start → immediate verification request sent automatically
2. 30 minutes late with no confirmation → vendor flagged at-risk in operations view
3. 30 minutes late → manager escalation workflow triggered
4. 1 hour unresolved → vendor hidden from customer-facing listings until verified

**Jordan's journey:**

| Stage | Experience |
|---|---|
| Setup | Creates market profile, calendar, operating rules, and communication defaults |
| Pre-market | Reviews vendor scheduling confirmations; sends invitations for upcoming dates |
| Market day | Monitors live roster; handles disruptions from unified dashboard; sends broadcasts |
| Escalation | Follows time-boxed verification ladder for unverified vendors |
| Post-market | Reviews reliability report; routes suspicious behavior to governance queue |

---

### Secondary Users

**Market Visitors (occasional / event-driven)**
Non-regular attendees who discover the market through community channels or special events. They don't have established vendor relationships but benefit from the customer confidence feed for first-visit planning. Lower engagement depth but high acquisition potential.

**Market Association Administrators**
Regional or network-level coordinators who oversee multiple markets. They care about cross-market benchmarking, aggregate reliability data, and policy governance across their network. Not a day-1 target but a natural expansion segment.

---

### User Journey Summary

The activation ladder that connects all three primary users:

1. **Market Manager** creates a market with a live calendar → supply-side foundation established
2. **Vendor** onboards and schedules their first market → vendor readiness confirmed
3. **Manager** publishes the market and invites vendors → coordination loop opened
4. **Customer** browses upcoming calendar and available products → demand-side ready

All subsequent market-day interactions flow through the canonical event stream: vendor arrivals populate the customer feed, exceptions trigger manager alerts, manager broadcasts reach both vendors and customers. One operational truth, three role-specific views.

---

## Success Metrics

Success for **markets** is measured at three levels: user outcomes (did we reduce friction and build trust?), operational health (is the coordination loop working?), and business growth (are markets and vendors adopting and staying?).

**Customer success — reducing failed trips and building confidence:**

| Metric | Target Signal |
|---|---|
| Failed-trip rate reduction | Customers arrive and find vendor present and product available as expected |
| Pre-visit confidence action rate | % of customers who check vendor status before traveling |
| Repeat visit rate | 30/60-day repeat attendance among app users vs non-users |
| Planned-list completion rate | % of shopping missions where all target items were found |
| Session-to-purchase continuity after stockout | Customer stays and finds substitute rather than abandoning trip |

**Vendor success — low overhead, high visibility payoff:**

| Metric | Target Signal |
|---|---|
| Check-in completion rate on market day | % of scheduled vendors who check in within first 30 min of market open |
| Check-in time | Median check-in action completed in under 10 seconds |
| Exception update rate | Vendors posting at least one exception update per market day |
| Vendor retention at 60 days | % of onboarded vendors still active after 2 months |
| Onboarding to first live market | Median time from account creation to first market-day check-in |

**Market manager success — operational clarity and fast disruption resolution:**

| Metric | Target Signal |
|---|---|
| Disruption resolution time | Median time from disruption event to customer-visible correction |
| Vendor attendance confidence rate | % of vendors with a verified signal (not just scheduled) at market open |
| Escalation ladder adherence | % of unverified vendor cases that progress through defined time gates |
| Post-event report usage | % of markets generating and reviewing post-event reliability reports |

### Business Objectives

**3-month pilot objectives:**

1. Activate 3–5 pilot markets with measurable same-day operational KPIs
2. Demonstrate reduction in customer uncertainty events (failed trips, incorrect status) vs pre-launch baseline
3. Achieve vendor check-in adoption rate above 70% in active pilot markets
4. Establish onboarding playbook replicable for next wave of markets

**12-month growth objectives:**

1. Expand to 20+ markets with consistent activation ladder completion (all 4 gates)
2. Achieve repeat-visit rate uplift in pilot vs control markets
3. Establish manager-led adoption model where market managers drive vendor and customer participation
4. Begin integration partnerships with one existing market-admin or local-commerce tool

**Strategic objectives:**

- Own the confidence layer — become the default trust signal for market-day attendance and availability in served markets
- Build reliability data moat — post-event reliability scoring creates vendor accountability history that is hard to replicate
- Establish manager as growth vector — satisfied market managers become the primary distribution channel

### Key Performance Indicators

**Leading indicators** (predict platform health before scale):

| KPI | Definition | Early Target |
|---|---|---|
| Vendor status freshness rate | % of active vendor listings with a same-day signal | >80% on market days |
| Attendance/availability accuracy rate | % of vendor status claims verified as accurate post-market | >90% |
| Check-in time (P50) | Median vendor check-in completion time | <10 seconds |
| Activation gate completion | % of markets completing all 4 activation gates | 100% before go-live |

**Lagging indicators** (measure real-world outcomes):

| KPI | Definition | Pilot Target |
|---|---|---|
| Failed-trip rate reduction | Customer-reported or proxy-measured wasted trips | Measurable reduction vs baseline |
| Customer repeat-visit rate | % of app users returning within 30 days | Upward trend vs non-app cohort |
| Vendor 60-day retention | % of vendors active 60 days after first check-in | >65% |
| Disruption resolution time | Time from disruption post to customer-visible resolution | <15 minutes median |
| Manager NPS / satisfaction | Manager satisfaction with operations dashboard | Positive trend |

**Anti-metrics** (signals that indicate trust erosion — monitor as critical):

- False check-in incidents (vendor checked in but not on site)
- Customer complaints about status mismatch
- Vendor ghost check-ins flagged by geolocation validation
