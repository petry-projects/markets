---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional']
inputDocuments:
  - "/workspaces/markets/_bmad-output/planning-artifacts/product-brief-markets-2026-03-16.md"
  - "/workspaces/markets/_bmad-output/brainstorming/brainstorming-session-2026-03-15-16-19-33.md"
  - "/workspaces/markets/_bmad-output/planning-artifacts/research/market-farmer-and-art-market-app-research-2026-03-15.md"
  - "/workspaces/markets/_bmad-output/planning-artifacts/research/domain-farmer-and-art-market-ecosystem-research-2026-03-15.md"
  - "/workspaces/markets/_bmad-output/planning-artifacts/research/technical-react-graphql-supabase-research-2026-03-15.md"
  - "/workspaces/markets/_bmad-output/planning-artifacts/research/domain-real-time-object-detection-research-2026-03-15.md"
  - "/workspaces/markets/_bmad-output/planning-artifacts/research/feature-priority-matrix-market-app-2026-03-15.md"
workflowType: 'prd'
classification:
  projectType: web_app
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - markets

**Author:** Human
**Date:** 2026-03-17

## Executive Summary

**markets** is a real-time coordination platform for local farmer and art markets. It addresses the high-friction operational gap where customers cannot reliably find accurate, current market-day information because managers must manually collect updates from fragmented vendor channels (text, email, social media), leading to stale customer-facing information, missed purchases, and reduced vendor revenue.

The platform creates a unified operational source of truth across three actor roles: **managers** collect and publish consolidated market-day status with less manual chasing; **vendors** communicate attendance, availability, and exceptions with minimal effort; **customers** discover markets and vendors, confirm current status, and make confident go/no-go decisions before traveling.

**Target Users:**
- **Rachel** (primary customer persona) — health-conscious weekly market shopper who needs reliable vendor presence and product availability confirmation before leaving home
- **Brad** (primary vendor persona) — multi-market organic produce vendor who needs low-friction status tools that increase his discoverability and repeat customer flow
- **Market Manager** (secondary but critical enabler) — needs consolidated operational visibility and less manual coordination overhead

**Core Problem:** No existing tool owns the market-day coordination layer. Managers broadcast on social media rather than coordinating operationally. There is no structured, trusted channel between actors.

**Proposed Solution:** A web/PWA application where vendors post structured status updates (check-in, sold out, running late), managers validate and publish market-level truth, and customers search, follow, and receive real-time availability signals before and during market visits.

### What Makes This Special

**Domain-native coordination design** — built for the specific operational workflow of farmer and art markets, not adapted from generic social commerce or directory tools.

**Multi-actor flywheel** — each actor's action creates value for the others: vendor check-in → auto-notification to followers → increased purchase intent → stronger manager attendance outcomes. No incumbent operates across all three roles in a coordinated workflow.

**Confidence-first positioning** — competes on *failed-trip reduction* and evidence-backed availability signals. The core metric is not engagement or listing count, but customer confidence that translates into trips taken and completed.

**Exception-first vendor UX** — vendors maintain baseline availability by default and update only when something changes. This dramatically reduces maintenance burden and is the primary driver of vendor adoption and retention.

**Founder advantage** — custom software delivery combining product expertise, market context, and agentic development at a fraction of traditional build cost.

**Competitive gap** — the domain is structurally fragmented: incumbents (Marketspread, ManageMyMarket, Local Line, Open Food Network) specialize by workflow layer (admin ops, farm commerce, or network coordination) and do not provide unified cross-actor real-time coordination.

## Project Classification

| Attribute | Value |
|---|---|
| **Project Type** | Web App (React SPA/PWA, mobile-first usage pattern) |
| **Domain** | General — local marketplace / community commerce coordination |
| **Complexity** | Medium (multi-actor coordination, real-time requirements, mobile market-day UX constraints) |
| **Project Context** | Greenfield — new product, no existing codebase |
| **Technology Stack** | React + GraphQL + Supabase (TypeScript, PostgreSQL, real-time subscriptions) |

## Success Criteria

### User Success

**Customer (Rachel):**
- Can discover relevant markets and vendors through search without a failed trip
- Can confirm vendor presence, product availability, and market hours before leaving home
- Aha moment: "I found my vendor and what they have today in one quick search"
- 90-day target: 100 new market/vendor follows from customers

**Vendor (Brad):**
- Can publish market-day status (check-in, exception) in under 10 seconds
- Gains measurable new followers and inbound customer visibility through the app
- 90-day target: 10+ new followers per participating vendor

**Manager:**
- Can view consolidated vendor attendance and status without manual chasing
- 90-day target: 10 vendors per managed market with complete, current profiles

### Business Success

| Horizon | Markets | Managers | Vendors | Customers |
|---|---|---|---|---|
| **3 months** | 5 | 5 | 40 | 250 |
| **12 months** | 20 | 20 | 160 | 1,000 |

**Key Performance Indicators:**
- Monthly active customers: 100
- Active vendor participation rate: 40 vendors posting same-day updates
- Weekly returning customer rate: 10%
- Active market managers: 10

### Technical Success

- Vendor status updates propagate to customer-facing surfaces same-day (within minutes, not hours)
- Core vendor actions (check-in, exception status) complete in under 10 seconds on mobile
- App is reliable on market-day peak load (Saturday mornings, multiple concurrent vendor updates)
- Onboarding completable for all three roles without support intervention

### Measurable Outcomes

- **Primary signal:** Customers complete follow actions after searching (search → follow conversion)
- **Secondary signal:** Vendors post at least one same-day status update per market day
- **Guardrail:** Inaccurate listing complaint rate stays near zero in first 90 days
- **Ecosystem health:** All three actor types (manager + vendor + customer) actively using the platform within 30 days of a market's onboarding

## Product Scope

### MVP — Minimum Viable Product

The MVP closes the minimum viable coordination loop: supply side joins → demand side joins → customers discover and subscribe.

| Feature | Purpose |
|---|---|
| Market and manager onboarding | Supply-side foundation; enables market profiles and vendor rosters |
| Vendor onboarding | Supply-side participation; vendor profiles, product catalog, market schedule |
| Customer signup | Demand-side entry point |
| Search for markets and vendors | Core discovery action for customers |
| Follow markets and vendors | Subscription mechanism; enables retention signal and notification infrastructure |

**MVP success signal:** All three actor types are onboarded and cross-role interaction (search + follow) is occurring at target markets.

### Growth Features (Post-MVP)

Drawn from the MoSCoW feature matrix — "Should Have" tier:

- Real-time vendor attendance check-in and status (present/running late/not attending)
- Product availability and exception states (sold out, low stock, product unavailable)
- Payment and incentive clarity (SNAP eligibility indicators)
- Confidence signal with freshness timestamp
- Manager operations dashboard for disruptions and market-wide broadcast alerts
- Intent-based shopper planner (find item → vendor → market path)
- Vendor auto-notify followers on check-in
- Substitution and fallback suggestions when availability drops

### Vision (Future)

- Multi-city and multi-state rollout from local pilot to regional network
- Reliability analytics and vendor trust scoring for manager governance
- Route/time-aware market-day planning
- Cross-market comparison view
- Personalization (confidence thresholds, product preferences)
- Loyalty and retention hooks

**Intentionally deferred from all releases:**
- In-app chat
- Ratings and reviews
- Weather functionality
- Full inventory management
- Market fee management
- End-to-end e-commerce checkout (full vendor replacement)

## User Journeys

### Journey 1: Rachel — The Confident Trip (Customer, Happy Path)

It's Friday night. Rachel is planning her Saturday morning. She's been burned twice in the last month — once a vendor she drove to wasn't there, once the market had moved hours. She opens **markets** for the first time after a friend's recommendation.

She types "organic eggs" into search. Three vendors appear, each with a check-in timestamp from the last market day and a baseline product list. Two have already checked in for tomorrow's market. She taps one — sees their product list, market location, and hours. Follows them. Sets a product reminder for eggs.

Saturday morning, she gets a push notification: "Green Valley Farm just checked in at Riverside Market." She grabs her bag and goes. She finds the stall, buys eggs and herbs she didn't plan on. On the way home she follows two more vendors she discovered at the market.

**New reality:** Rachel now plans her Saturday around what the app confirms, not around what she hopes will be there. She hasn't had a wasted trip in six weeks.

**Requirements revealed:** search with product-to-vendor mapping, vendor check-in status, freshness timestamps, follow + notification, vendor discovery at market level.

---

### Journey 2: Rachel — The Fallback (Customer, Exception Path)

Rachel opens the app Saturday at 7am to confirm her usual honey vendor is there. Status: "Not attending today." She feels disappointment for a moment — then taps the fallback suggestion: "Two other honey vendors are checked in nearby." She finds one two stalls over at the same market and completes her shop.

**New reality:** The app turned a failed trip into a successful one she didn't expect.

**Requirements revealed:** exception states (not attending), fallback/substitution suggestions, same-market alternative discovery.

---

### Journey 3: Brad — The Check-In Revenue Loop (Vendor, Happy Path)

It's 6:45am Saturday. Brad is unloading his truck at the market. He has 20 minutes before customers start walking in. He opens the app, taps "Check in" on his market-day card. Done in 8 seconds. The app marks him as present and sends an auto-notification to his 34 followers.

Three of those followers arrive in the first 30 minutes specifically because they saw the alert. One becomes a regular. By 9am Brad has matched last week's revenue. He posts a quick "Running low on strawberries — grab them soon" status. Four more customers beeline to his stall.

Next week a new customer tells him: "I found you through the app." Brad realizes the app is now his best customer acquisition channel.

**New reality:** Brad's check-in takes less than 10 seconds and directly generates foot traffic. He no longer relies on Instagram posts that his followers may or may not see.

**Requirements revealed:** one-tap check-in (<10 seconds), auto-notify followers on check-in, exception status updates (running low), vendor profile with follower count, customer-to-vendor discovery attribution.

---

### Journey 4: Maria — The Prepared Market (Manager, Core Path)

Maria manages Riverside Farmers Market, 38 vendors, every Saturday. By 8am on a normal Saturday she's already received 12 texts and 3 calls from vendors with updates. She's guessing which ones she missed.

Her first Saturday using **markets**: she opens her manager dashboard at 7am. 31 of 38 vendors have checked in. 2 have posted "not attending." 5 are pending. She taps the pending list and sends a single broadcast to all 5: "Please confirm attendance." Three respond in minutes.

At 8:30am a vendor posts "sold out of tomatoes" — the manager dashboard lights up. She notes it and moves on. No phone call needed.

Customers arriving that day check the app before walking in. Attendance is up 15% from the previous week. Maria fields half the calls she normally gets.

**New reality:** Maria's market-day coordination shifted from reactive fire-fighting to proactive confirmation. She feels prepared, not scrambled.

**Requirements revealed:** manager dashboard with attendance overview, vendor confirmation broadcast, disruption/exception notifications to manager, role-based access (manager vs vendor vs customer), market-level configuration.

---

### Journey 5: Juan — The Co-Manager (Manager, Shared Market Path)

Juan is Maria's assistant manager at Riverside Farmers Market. He handles the early Saturday shift while Maria covers vendor applications and communications during the week.

He opens the **markets** app at 6:30am Saturday — before Maria arrives. The manager dashboard shows Riverside Market and its full vendor roster. He can see everything Maria set up: vendor profiles, scheduled attendance, market hours. He starts monitoring check-ins as vendors arrive.

At 7:15am a vendor Juan doesn't know well posts "running late." He flags it in the dashboard. Maria sees the same flag when she checks her phone at 7:45am. No duplicate calls, no confusion — they're looking at the same live state. Maria handles the follow-up message to the vendor; Juan keeps watching the floor.

Later that morning, a vendor has a stall issue. Juan posts an exception update from his manager view. The vendor and all followers see the status update. Maria sees it too, timestamped, with Juan's session attributed.

**New reality:** Two people can manage one market from the same shared operational view. Actions are visible to both. No duplication, no gaps.

**Requirements revealed:** multiple manager accounts per market, shared market state visible to all managers of that market, action attribution/audit trail (which manager posted what), role permission scoping to specific markets (Juan can only manage Riverside, not other markets Maria administers).

---

### Journey Requirements Summary

| Capability Area | Revealed By |
|---|---|
| Product/vendor search with intent matching | Rachel J1 |
| Vendor check-in status + freshness timestamps | Rachel J1, Brad J3 |
| Follow markets and vendors + push notifications | Rachel J1, Brad J3 |
| Exception states (not attending, running late, sold out) | Rachel J2, Brad J3 |
| Fallback/substitution suggestions | Rachel J2 |
| One-tap check-in (<10 seconds, mobile) | Brad J3 |
| Auto-notify followers on check-in | Brad J3 |
| Vendor profile + product catalog | Brad J3, Rachel J1 |
| Manager attendance dashboard | Maria J4, Juan J5 |
| Manager broadcast to unconfirmed vendors | Maria J4 |
| Manager alert on vendor disruption/exception | Maria J4, Juan J5 |
| Role-based access model (3 roles) | Maria J4, Brad J3, Rachel J1 |
| Market profile + hours + vendor roster | Maria J4, Rachel J1 |
| Multiple managers per market (shared state) | Juan J5 |
| Manager action attribution / audit trail | Juan J5 |
| Manager permission scoped to specific markets | Juan J5 |

## Domain-Specific Requirements

### Privacy & Data Protection

- User accounts for all three roles hold personal data (name, location context, contact info); must comply with applicable privacy law (CCPA for California users at minimum; GDPR principles for responsible design).
- Customers must be able to delete their account and associated data.
- Vendor location and product data is operational, not sensitive, but must only be modifiable by the authenticated vendor or an authorized manager of that market.
- No personal data sold or shared with third parties; notification opt-out must be honored promptly.

### Security & Access Control

- Role-based access model enforced at the data layer (Supabase RLS policies), not just the UI layer: customers cannot write vendor data, vendors cannot write other vendors' data, managers can only administer markets they are explicitly assigned to.
- Manager action attribution required: all manager writes (broadcasts, exception overrides, attendance flags) must be attributable to a specific manager account with timestamp.
- Authentication via JWT with secure PKCE flow; social login optional but not required for MVP.
- No sensitive financial data stored in-system (payment method details, SNAP account info); SNAP eligibility displayed as a market/vendor attribute flag only.

### Real-Time Reliability Constraints

- Vendor check-in and status updates must propagate to customer-facing surfaces within 60 seconds of submission under normal load.
- Notification delivery (push/in-app) for follower alerts on check-in is best-effort but must not silently fail; failed deliveries must be retryable.
- Market-day peak load window: Saturday 6-10am; system must remain responsive for core vendor actions (check-in, exception status) under concurrent multi-vendor update load.
- Supabase Realtime subscriptions (Postgres CDC) used for live dashboard updates; connection drops must degrade gracefully (poll fallback, not blank state).

### Data Freshness & Trust Integrity

- All customer-facing availability and attendance claims must display a freshness timestamp (e.g., "checked in 14 min ago").
- Stale data (no update in >24 hours for a scheduled market day) must be visually distinguished from fresh data, not silently shown as current.
- Vendor baseline catalog data (products, typical availability) remains visible between market days but marked as "typical" not "confirmed today".

### Mobile Performance Constraints

- Core vendor actions (check-in, exception status) must complete within 10 seconds on a mid-range mobile device on a typical mobile network.
- App must be usable in low-signal conditions common at outdoor market venues (graceful degradation, optimistic UI with retry on reconnect).
- PWA install prompt appropriate for market-day repeat usage pattern.

### Audit, Review & Recovery

- All data creation actions across all three roles (market creation, vendor onboarding, customer signup, check-ins, status updates, exception posts, manager broadcasts, follow actions, profile edits) must be stored in an immutable audit log with: actor identity, role, action type, affected record ID, timestamp, and payload snapshot.
- Audit log must be append-only; no actor (including managers) can delete or modify audit entries.
- Audit data must be retained for a minimum of 12 months and be queryable by market, vendor, or actor for operational review.
- Recovery: in the event of accidental or incorrect data mutation, audit log must provide sufficient snapshot data to reconstruct prior state (soft-delete preferred over hard-delete for all user-generated records).
- Manager and admin views may expose a filtered audit trail for their managed markets; customers and vendors do not have access to audit data outside their own account history.

## Innovation & Novel Patterns

### Detected Innovation Areas

- Confidence-first coordination model: the product does not act as a static directory; it transforms fragmented market-day signals into decision-grade confidence for customers before travel.
- Multi-actor shared truth workflow: customers, vendors, and multiple managers operate on one synchronized state model, including co-manager governance for a single market.
- Exception-first operational UX: vendors are not forced into heavy daily maintenance. Baseline data persists and only meaningful changes are posted, which increases real-world adoption probability.
- Trust-integrity architecture: freshness metadata, role-scoped permissions, and immutable audit trails are product-level trust mechanisms, not back-office extras.

### Market Context & Competitive Landscape

- Most alternatives specialize by layer: manager administration, vendor commerce, or customer discovery. They do not consistently unify all three actor loops in real time.
- The practical competitive moat is execution of reliability: lower failed-trip rate, faster vendor update loop, and lower manager coordination overhead.
- Positioning edge: confidence and coordination quality over social feed visibility or generic listing depth.

### Validation Approach

- Pilot design: run in 2 to 3 markets with at least two managers sharing one market to validate co-management and audit traceability.
- Core experiments: measure search-to-follow conversion, vendor check-in completion time, and customer failed-trip reduction versus baseline weeks.
- Trust experiments: compare engagement for listings with freshness and confidence signals against listings without those signals.
- Governance validation: confirm manager audit review workflows can reconstruct disputed or incorrect creation events.

### Risk Mitigation

- Innovation adoption risk: if users do not understand confidence signals, provide simplified confidence labels and clear source explanations.
- Workflow friction risk: if vendor update behavior drops, preserve strict sub-10-second action paths and use exception presets.
- Data trust risk: enforce immutable creation logs, soft-delete recovery, and market-scoped manager permissions from initial release.
- Market onboarding risk: if managers resist process change, introduce staged rollout with one lead manager and one co-manager before full market migration.

## Web App Specific Requirements

### Project-Type Overview

The product will use a hybrid SSR/SPA model to balance market discovery indexability with highly interactive, real-time market-day workflows. Public discovery pages (markets, vendors, basic listings) should be server-rendered for crawlability and fast first paint, while authenticated user flows (manager dashboard, vendor controls, notifications, follow state, check-ins) run as SPA experiences.

The architecture should evaluate GlueStack v3 as a viable UI/stack option where it accelerates cross-platform component reuse without compromising web performance and accessibility targets.

### Technical Architecture Considerations

- Rendering model: hybrid SSR/SPA with route-level rendering strategy:
  - SSR/SSG for public pages needing indexability.
  - SPA for authenticated real-time operational workflows.
- Browser baseline: latest two stable versions of Chrome, Safari, Edge, and Firefox.
- Real-time architecture: live subscriptions for check-ins, manager dashboards, and notifications.
- Acceptable latency: end-to-end update propagation target under 60 seconds.
- Project stack alignment: React + GraphQL + Supabase remains primary; GlueStack v3 considered for design-system and component productivity fit.

### Browser Matrix

- Supported:
  - Chrome latest 2.
  - Safari latest 2.
  - Edge latest 2.
  - Firefox latest 2.
- Not supported:
  - Internet Explorer.
  - Outdated browser engines beyond latest-2 policy.
- Progressive enhancement: core browse/read paths must remain usable if real-time channels degrade.

### Responsive Design Requirements

- Mobile-first layouts for outdoor market-day usage.
- Breakpoints optimized for:
  - Small phone (vendor quick actions).
  - Standard phone.
  - Tablet.
  - Desktop (manager dashboard).
- Critical UX constraint: one-tap vendor actions (check-in/status) stay visible and reachable without deep navigation.

### Performance Targets

- Initial meaningful paint on public pages: target under 2.5s on 4G for key listing pages.
- Core interaction latency: check-in/status action completes in under 10 seconds including feedback.
- Real-time freshness: UI updates reflected in under 60 seconds under normal load.
- Peak load window hardening: Saturday 6-10am concurrent vendor and manager activity.

### SEO Strategy

- Basic indexability only:
  - Crawlable market and vendor pages.
  - Stable canonical URLs.
  - Metadata per market/vendor page.
  - Sitemap and robots configuration.
- Non-goal for MVP: advanced editorial/content SEO campaigns.

### Accessibility Level

- Target: WCAG 2.1 AA for MVP.
- Required baseline:
  - Keyboard navigability across all critical workflows.
  - Sufficient color contrast.
  - Semantic heading and landmark structure.
  - Form labels, error messaging, and focus states.
  - Screen-reader readable status changes for key actions.

### Implementation Considerations

- Route rendering policy should be documented early to prevent accidental SEO/performance regressions.
- Real-time features must include graceful fallback (polling/retry) when subscriptions fail.
- Accessibility checks should be embedded into CI and design review, not deferred to post-build QA.
- GlueStack v3 adoption should be gated by bundle impact, accessibility parity, and component velocity gains for shared UI patterns.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Mobile-first operational trust MVP with validated learning.

- Core hypothesis: real-time vendor status and shared manager coordination will reduce customer uncertainty enough to change weekly behavior.
- Validation target: establish repeat market-day usage across all three roles within first pilot markets.
- Why this approach: aligns directly to the confidence-first coordination differentiator and avoids premature feature breadth.

**Final Surface Decision (Supersedes Cross-Surface Scope):**

- The product is mobile-app only for MVP and near-term roadmap.
- Vendor, Market Manager, and Customer roles are all served through the mobile app.
- Previously discussed web access parity and browser/SEO requirements are deferred and out of current scope unless explicitly reintroduced later.

**Resource Requirements:**

- Minimum team: 2 full-stack engineers (or 1 mobile + 1 backend/full-stack), 1 product/UX lead, 1 part-time QA/ops support.
- Skills required: mobile application development, React + GraphQL + Supabase/Postgres/RLS, push notifications, accessibility implementation, analytics instrumentation.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Rachel confident-trip journey.
- Rachel fallback journey.
- Brad check-in and exception journey.
- Maria and Juan shared co-manager market coordination journey.

**Must-Have Capabilities:**

- Authentication and role model: customer, vendor, manager with market-scoped permissions.
- Co-manager support: multiple managers per market with shared state and action attribution.
- Market and vendor onboarding: market profile, vendor roster, vendor profile, baseline product catalog.
- Search and discovery: market/vendor/product intent search with follow actions.
- Real-time operations: vendor check-in and exception status updates propagated in under 60 seconds.
- Notifications: follower notifications for vendor check-ins and key exception updates.
- Trust UX: freshness timestamps and stale-data indicators.
- Audit and recovery: immutable logging of all data-creation actions, review access, and recovery support.
- Accessibility baseline: WCAG 2.1 AA intent implemented for mobile critical workflows.
- Mobile reliability: core vendor actions complete within 10 seconds under typical mobile conditions.

### Post-MVP Features

**Phase 2 (Growth):**

- Confidence score model and explainability views.
- Substitution and fallback recommendations.
- Manager reliability analytics and quality controls.
- Enhanced alerting and operational feed views.
- Offline resilience improvements and notification tuning.

**Phase 3 (Expansion):**

- Multi-city and multi-state expansion tooling.
- Route/time-aware planning.
- Cross-market comparison.
- Personalization layers and loyalty hooks.
- Broader platform integrations.

### Risk Mitigation Strategy

**Technical Risks:**

- Risk: real-time propagation and notification reliability degrade under peak market-day load.
- Mitigation: subscription plus polling fallback, explicit latency SLOs, Saturday peak-load testing, retry queues for notifications.

**Market Risks:**

- Risk: vendors do not update status consistently.
- Mitigation: strict sub-10-second actions, exception-first design, follower-visibility incentives, pilot manager coaching.

**Resource Risks:**

- Risk: team capacity too small for roadmap breadth.
- Mitigation: lock MVP to four core journeys, defer confidence scoring and recommendation features, launch in 2 to 3 pilot markets only.

**Distribution Risks (Mobile-Only):**

- Risk: app-install friction slows early customer adoption.
- Mitigation: referral-led onboarding, streamlined first-run flow, and launch pilots where manager/vendor pull can drive installs.

## Functional Requirements

### Identity, Roles, and Access Control

- FR1: Customer can create and access an account.
- FR2: Vendor can create and access an account.
- FR3: Market Manager can create and access an account.
- FR4: System can assign and enforce role-specific permissions for Customer, Vendor, and Market Manager.
- FR5: Market Manager can be assigned to one or more specific markets.
- FR6: Multiple Market Managers can manage the same market concurrently.
- FR7: System can restrict manager actions to only markets the manager is authorized to manage.

### Market and Vendor Administration

- FR8: Market Manager can create and maintain a market profile.
- FR9: Market Manager can manage market schedule and operational status.
- FR10: Market Manager can add, approve, and manage vendors in a market roster.
- FR11: Vendor can create and maintain a vendor profile.
- FR12: Vendor can define baseline product offerings associated with their profile.
- FR13: Vendor can associate their profile with one or more markets where authorized.

### Market-Day Operations and Status Management

- FR14: Vendor can check in for a market day.
- FR15: Vendor can publish market-day exception statuses including running late, sold out, and not attending.
- FR16: Vendor can update availability state for products or categories without replacing full baseline profile data.
- FR17: Market Manager can view live attendance and status overview for vendors in a managed market.
- FR18: Market Manager can request attendance confirmation from unconfirmed vendors in a managed market.
- FR19: Market Manager can publish market-level operational updates.
- FR20: System can reflect vendor and market status changes across all relevant user views.

### Discovery, Follow, and Engagement

- FR21: Customer can search markets.
- FR22: Customer can search vendors.
- FR23: Customer can discover vendors by product intent.
- FR24: Customer can view vendor presence and market participation status.
- FR25: Customer can follow vendors.
- FR26: Customer can follow markets.
- FR27: Customer can receive updates from followed vendors and markets.
- FR28: Customer can view alternatives when a preferred vendor or product is unavailable.

### Notifications and Activity Awareness

- FR29: System can notify relevant customers when a followed vendor checks in.
- FR30: System can notify relevant customers when followed vendor or market statuses materially change.
- FR31: System can notify Market Managers of vendor disruptions and exception updates within managed markets.
- FR32: System can maintain an activity feed of relevant market-day updates for each role.

### Trust, Data Integrity, and Auditability

- FR33: System can present freshness context for customer-visible status and availability information.
- FR34: System can distinguish current versus stale market-day information.
- FR35: System can capture all data-creation actions in an immutable audit log.
- FR36: Audit entries can include actor identity, role, action type, affected record reference, timestamp, and action payload snapshot.
- FR37: Authorized manager/admin users can review audit records for markets they are permitted to manage.
- FR38: System can support recovery workflows using audit history and retained record states.
- FR39: System can retain audit records for defined retention periods.

### Account Control, Privacy, and Governance

- FR40: Customer can request account deletion.
- FR41: Vendor can request account deletion.
- FR42: System can enforce role-based visibility so users only access data permitted for their role and market context.
- FR43: System can support notification preference controls for users.
- FR44: System can maintain action attribution for manager-originated updates in shared-market management scenarios.

## Non-Functional Requirements

### Performance

- NFR1: Core vendor market-day actions (check-in, exception update) shall complete user-visible confirmation within 10 seconds on a typical mid-range mobile device and normal mobile network conditions.
- NFR2: Market-day status changes shall propagate to subscribed role views within 60 seconds under normal operating load.
- NFR3: Customer search queries for markets, vendors, or products shall return results within 2 seconds for 95% of requests under normal load.
- NFR4: Manager dashboard refresh and state reconciliation actions shall complete within 3 seconds for 95% of requests under normal load.

### Reliability and Availability

- NFR5: The system shall maintain service availability of at least 99.5% monthly during MVP operations, excluding pre-announced maintenance windows.
- NFR6: Real-time delivery pathways shall provide graceful degradation to retry or polling behavior when live subscription channels are unavailable.
- NFR7: No acknowledged status-change event shall be silently dropped; failed delivery attempts shall be retried and logged.
- NFR8: The platform shall support peak market-day concurrency windows without functional loss of core workflows for vendors and managers.

### Security and Privacy

- NFR9: All data in transit shall be encrypted using TLS.
- NFR10: All persisted user and operational data shall be encrypted at rest.
- NFR11: Access control enforcement shall occur at the data-access layer and conform to role and market-scope authorization rules.
- NFR12: Immutable audit logs for data-creation events shall be append-only and tamper-evident.
- NFR13: Privacy controls shall support account deletion requests and enforce role-scoped data visibility.
- NFR14: The system shall avoid storage of sensitive payment credentials; payment-eligibility indicators may be stored as metadata only.

### Scalability

- NFR15: The architecture shall support at least 10x growth from pilot baseline usage without redesign of core domain data models.
- NFR16: The platform shall support horizontal scaling for notification and real-time event processing components.
- NFR17: Data models and permission rules shall support multi-market and multi-manager expansion without role-conflict behavior.

### Accessibility

- NFR18: MVP mobile workflows shall meet WCAG 2.1 AA intent for critical user journeys, including vendor check-in, manager status review, and customer discovery/follow actions.
- NFR19: All critical flows shall be operable with assistive technologies supported by target mobile platforms.
- NFR20: Critical action states and errors shall be conveyed through non-color-dependent cues and readable status messaging.

### Observability, Audit Review, and Recovery

- NFR21: All data-creation actions shall be recorded with actor, role, action type, target reference, timestamp, and payload snapshot.
- NFR22: Audit records shall be queryable by authorized reviewer by market, actor, and time range.
- NFR23: Audit retention shall be no less than 12 months for MVP.
- NFR24: Recovery workflows shall support restoration from accidental or incorrect data changes using retained record history and audit snapshots.
- NFR25: Operational monitoring shall include event delivery success rates, latency, and failure alerts for market-day critical paths.

