---
stepsCompleted: [1, 2]
inputDocuments: []
session_topic: 'A new farmer and art market app that enables customers, vendors and market managers to find, communicate and coordinate.'
session_goals: 'Generate inputs for a product brief and product requirements document (PRD).'
selected_approach: 'ai-recommended'
techniques_used: ['Role Playing', 'SCAMPER Method', 'Solution Matrix']
ideas_generated: [70]
context_file: ''
---

# Brainstorming Session Results

**Facilitator:** Human
**Date:** 2026-03-15

## Session Overview

**Topic:** A new farmer and art market app that enables customers, vendors and market managers to find, communicate and coordinate.
**Goals:** Generate inputs for a product brief and product requirements document (PRD).

### Session Setup

The session scope and outcomes were confirmed with the user. The next step is selecting a facilitation approach to begin idea generation.

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Multi-actor marketplace app with focus on product brief and PRD inputs.

**Recommended Techniques:**

- **Role Playing:** Surface actor-specific needs for customers, vendors, and market managers.
- **SCAMPER Method:** Expand into broad feature and workflow possibilities.
- **Solution Matrix:** Converge ideas into structured, PRD-ready inputs.

**AI Rationale:** This sequence moves from stakeholder empathy to high-divergence ideation to structured prioritization for implementation planning.

## Technique Execution (In Progress)

### Role Playing - Customer Perspective (Trust and Predictability)

**Key user-selected concepts:**

- **[Category #1] Confidence-to-Go Score:** Similar to "Busy Now?" behavior with evidence that people and vendors are actually active.
- **[Category #2] Intent-Based Shopping Mode:** Predictable shopping flow that helps users find specific local products with confidence.

**Expanded concepts captured:**

- **[Category #9] Confidence Score Explainability**
- **[Category #10] Multi-Signal Presence Proof**
- **[Category #11] Intent Match Guarantee**
- **[Category #12] Store-Like Mission Planner**

### Trust Inputs for Product Requirements

**[Category #9] Confidence Score Explainability**

- First-use proof needed: Vendor check-in
- Freshness expectation: Same day
- Failure threshold: False claims

**[Category #10] Multi-Signal Presence Proof**

- First-use proof needed: Any of location density, vendor check-in, manager confirmation, or customer photo/check-in
- Freshness expectation: Same day
- Failure threshold: False claims

**[Category #11] Intent Match Guarantee**

- First-use proof needed: Accurate product list associated with vendor
- Freshness expectation: Same day
- Failure threshold: Multiple false claims

**[Category #12] Store-Like Mission Planner**

- First-use proof needed: Clear plan showing which markets and vendors
- Freshness expectation: Same day
- Failure threshold: False claims

### Draft PRD Requirement Statements (Working)

1. The system shall display evidence-backed confidence indicators using at least one verifiable same-day signal.
2. The system shall show freshness metadata for all confidence and availability claims.
3. The system shall allow users to inspect the source signals behind confidence and availability recommendations.
4. The system shall provide intent-based results that map requested products to specific vendors and markets.
5. The system shall provide fallback alternatives when confidence or availability drops.
6. The system shall track false-claim incidents and downgrade trust visibility for stale or unreliable sources.

### Role Playing - Vendor Perspective (Check-In Reliability)

**Vendor-selected daily check-in motivators:** 1, 2, 3, 7

- **1. One-tap check-in in under 10 seconds**
- **2. Better listing visibility when checked in**
- **3. Automatic customer notifications when checked in**
- **7. Quick status toggle (running late / sold out / not attending)**

**[Category #13] One-Tap Attendance Check-In**
_Concept_: Vendors can confirm attendance with one tap from a persistent action card, designed for less than 10 seconds completion.
_Novelty_: Optimized for real market-day friction where vendors are multitasking during setup.

**[Category #14] Check-In Boosted Discovery**
_Concept_: Checked-in vendors receive elevated ranking in relevant customer browse and search contexts.
_Novelty_: Creates a direct incentive loop where operational updates improve discoverability.

**[Category #15] Customer Auto-Notify on Presence**
_Concept_: Followers and intent-matched shoppers receive automatic "vendor is live" notifications after check-in.
_Novelty_: Converts check-in from admin action into immediate demand generation.

**[Category #16] Fast Exception Statuses**
_Concept_: Vendors can quickly post "running late," "sold out," or "not attending" states without full profile edits.
_Novelty_: Treats exceptions as first-class workflow to preserve trust in volatile market conditions.

### Vendor-Side Draft PRD Requirements (Working)

1. The system shall support vendor attendance check-in within 10 seconds or fewer on mobile.
2. The system shall increase vendor visibility when same-day check-in is active.
3. The system shall notify subscribed or intent-matched customers when a vendor checks in.
4. The system shall support one-tap exception statuses including running late, sold out, and not attending.
5. The system shall reflect vendor status changes in customer-facing views the same day.

### Vendor-Side Acceptance Criteria (Draft)

1. Given a vendor opens market-day controls, when they tap check-in, then attendance is confirmed and visible in under 10 seconds.
2. Given a vendor is checked in, when customers browse relevant categories, then that vendor is rank-boosted compared with non-checked-in peers.
3. Given a vendor checks in, when subscribed users have notifications enabled, then they receive a same-day presence alert.
4. Given a vendor selects sold out, running late, or not attending, when customers view the vendor, then status is updated with same-day freshness.

### Vendor Effort Tolerance - Availability Accuracy

**User selection:** Option 1 (no manual updates by default; vendor updates only when status changes)

**[Category #17] Default-Accurate, Exception-Driven Inventory Signaling**
_Concept_: The system defaults vendor inventory to baseline availability and only asks for updates when meaningful exceptions occur.
_Novelty_: Replaces constant micro-updates with exception-first workflow to fit real market-day constraints.

**Derived PRD Requirements (Working):**

1. The system shall minimize mandatory daily inventory input and support exception-only updates.
2. The system shall provide quick exception actions for sold out, low stock, and product unavailable states.
3. The system shall keep baseline catalog data active unless a vendor posts a same-day exception.
4. The system shall timestamp exception updates and show freshness metadata to customers.

**Derived Acceptance Criteria (Draft):**

1. Given a vendor has not posted new updates today, when customers browse products, then baseline catalog listings remain visible with freshness context.
2. Given a vendor marks sold out for a product or category, when customers search that item, then availability reflects the exception state the same day.
3. Given a vendor changes an exception state, when customer-facing listings refresh, then the update appears without requiring full catalog edits.

### Vendor Disruption Support Needs

**User selection:** 1, 2, 4

- **1. One-tap disruption broadcast to followers**
- **2. Auto-notify market manager when disruption status is posted**
- **4. Temporary product pause without full catalog edits**

**[Category #18] One-Tap Incident Broadcast**
_Concept_: A vendor can publish running late, sold out, or not attending updates to followers in a single action.
_Novelty_: Treats disruption communication as a primary workflow, not an afterthought.

**[Category #19] Manager Escalation Sync**
_Concept_: Any vendor disruption status automatically notifies market managers with reason and timestamp.
_Novelty_: Aligns vendor, manager, and customer truth states with minimal vendor effort.

**[Category #20] Temporary Product Pause Controls**
_Concept_: Vendors can pause specific products or categories for same-day visibility without editing full inventory records.
_Novelty_: Preserves catalog integrity while enabling rapid operational updates.

### Vendor Resilience Requirements (Working)

1. The system shall provide one-action disruption broadcasts for vendor status changes.
2. The system shall automatically notify the assigned market manager when vendor disruption statuses are posted.
3. The system shall support temporary product or category pause states independent of full catalog maintenance.
4. The system shall propagate disruption and pause updates to customer-facing surfaces with same-day freshness context.

### Vendor Resilience Acceptance Criteria (Draft)

1. Given a vendor posts running late, sold out, or not attending, when the action is submitted, then followers receive a same-day broadcast notification.
2. Given a vendor posts a disruption status, when the status is saved, then the market manager receives an automatic alert with timestamp and status type.
3. Given a vendor pauses a product or category, when customers browse or search that item, then the paused state is shown without requiring full catalog edits.
4. Given a disruption or pause update is active, when customers view related listings, then freshness metadata indicates same-day update timing.

### Vendor Deal-Breakers (Adoption Risks)

**User selection:** 1, 4, 5, 7

- **1. Too many manual updates required**
- **4. Product status shown to customers is wrong**
- **5. App is too slow or unreliable on market day**
- **7. Onboarding/setup takes too long**

### Vendor Retention Safeguard Requirements (Working)

1. The system shall keep vendor maintenance overhead low via default baseline availability and exception-first updates.
2. The system shall prioritize product-status accuracy and expose freshness/source context to customer-facing surfaces.
3. The system shall meet market-day performance and reliability thresholds for core vendor actions.
4. The system shall provide fast onboarding with minimal required setup before first market-day use.

### Vendor Retention Acceptance Criteria (Draft)

1. Given a vendor has completed onboarding, when they run a market day, then required routine actions are limited to check-in and optional exception updates.
2. Given a vendor posts an availability or disruption update, when customers view listings, then the reflected state matches vendor input and includes same-day freshness metadata.
3. Given market-day usage conditions, when a vendor performs core actions (check-in, status update, pause product), then actions complete successfully with consistent responsiveness.
4. Given a new vendor account, when onboarding is started, then first publish-ready setup is completed within a short guided flow without unnecessary fields.

### Vendor Branch Summary (Role Playing)

- Primary adoption loop: low effort -> visibility reward -> customer demand signal -> rapid exception controls
- Primary trust risk: any false or stale status claims
- Primary retention risk: operational friction (manual upkeep, latency, long onboarding)

### Role Playing - Market Manager Perspective (Live Operations)

**Correction applied per user request: supersedes prior single-priority interpretation.**

**Manager top priorities:**

- Live roster of checked-in vendors with attendance confidence
- Ability to broadcast market-wide updates instantly
- One dashboard for disruptions (late, sold out, no-show, weather issues)
- Post-event reliability report (which vendors were accurate, late, absent)

**[Category #21] Operations Roster with Attendance Confidence**
_Concept_: Managers get a real-time roster showing vendor check-in state, confidence level, and last verification signal for each stall.
_Novelty_: Moves beyond simple attendance to confidence-scored operational truth for rapid decision-making.

**[Category #22] Instant Market-Wide Broadcasts**
_Concept_: Managers can publish urgent market-wide updates in one action across customer and vendor channels.
_Novelty_: Treats communication latency as an operational risk and minimizes time-to-awareness.

**[Category #23] Unified Disruption Command Dashboard**
_Concept_: A single pane consolidates vendor incidents (late, sold out, no-show) and market-level disruptions (weather, closures).
_Novelty_: Replaces fragmented incident handling with coordinated response visibility.

**[Category #24] Post-Event Reliability Analytics**
_Concept_: After each event, managers receive reliability scoring by vendor based on attendance, timeliness, and status accuracy.
_Novelty_: Turns operational history into policy and planning inputs for future events.

### Manager-Side Draft PRD Requirements (Working)

1. The system shall provide market managers with a live roster of scheduled vendors with current attendance and confidence state.
2. The system shall support one-action market-wide broadcasts with same-day delivery to relevant audiences.
3. The system shall provide a unified disruption dashboard aggregating vendor-level and market-level incidents.
4. The system shall generate post-event reliability reports that classify vendor accuracy, late arrivals, and no-shows.
5. The system shall display freshness metadata and signal provenance for all manager operational views.

### Manager-Side Acceptance Criteria (Draft)

1. Given market day is active, when a manager opens operations view, then all scheduled vendors are listed with attendance status and confidence.
2. Given a manager publishes a market-wide alert, when the alert is submitted, then targeted customers and vendors receive same-day notification.
3. Given disruption events occur, when the manager views command dashboard, then vendor incidents and market-level disruptions appear in one consolidated timeline.
4. Given an event has ended, when the manager opens post-event analytics, then each vendor is tagged with reliability outcomes including accurate, late, or absent states.
5. Given any manager-facing operational datum, when displayed, then freshness and verification context are visible.

### Manager Escalation Policy for Unverified Vendors

**User-defined default action order and timing:**

1. **Immediate:** Send verification request to vendor.
2. **After 30 minutes late:** Mark vendor as at-risk in manager operations view.
3. **After 30 minutes late:** Escalate to manager intervention workflow.
4. **After 1 hour:** Hide vendor from customer-facing listings until verification is restored.

**[Category #25] Time-Boxed Verification Escalation Ladder**
_Concept_: Unverified vendor handling follows explicit SLA-style time gates from verification request through customer-visibility enforcement.
_Novelty_: Converts ad hoc manager judgment into deterministic trust-preserving operations policy.

### Manager Escalation Requirements (Working)

1. The system shall issue immediate verification prompts when vendor attendance is unverified at market start.
2. The system shall automatically classify vendors as at-risk after 30 minutes of unverified late status.
3. The system shall trigger manager escalation workflows at the same 30-minute threshold.
4. The system shall remove vendors from customer discovery surfaces after 1 hour of unresolved unverified status.

### Manager Escalation Acceptance Criteria (Draft)

1. Given a vendor is unverified at market start, when operations begin, then a verification request is sent immediately.
2. Given 30 minutes have elapsed without verification, when manager dashboard refreshes, then vendor is flagged at-risk.
3. Given 30 minutes have elapsed without verification, when escalation checks run, then manager intervention workflow is activated.
4. Given 1 hour has elapsed without verification, when customer listings refresh, then vendor is hidden until verified.

### Manager Visibility Restoration Policy

**User selection:** Option 3

- Restore vendor visibility when any one valid signal is received: vendor check-in, manager confirmation, or customer proof signal.

**[Category #26] Multi-Signal Reinstatement Gate**
_Concept_: Hidden vendors can be reinstated through any approved verification signal to balance trust protection with operational agility.
_Novelty_: Uses flexible recovery criteria while preserving strict escalation thresholds.

### Manager Restoration Requirements (Working)

1. The system shall support visibility reinstatement when at least one approved verification signal is received.
2. The system shall log restoration source type (vendor check-in, manager confirmation, customer proof) and timestamp.
3. The system shall re-rank restored vendors based on current confidence and freshness metadata.

### Manager Restoration Acceptance Criteria (Draft)

1. Given a vendor is hidden due to unverified status, when any one approved signal is recorded, then vendor visibility is restored.
2. Given visibility is restored, when manager reviews operations history, then restoration source and timestamp are auditable.
3. Given a vendor is restored, when customers view listings, then confidence and freshness context are displayed alongside reinstated status.

### Role Playing - Failure Scenarios and Abuse Prevention (In Progress)

**[Category #27] Ghost Check-In Abuse**
_Concept_: A vendor checks in remotely without being physically present to capture customer demand and listing visibility.
_Novelty_: Misalignment between digital status and physical presence causes trust erosion and wasted customer trips.

**[Category #28] Weather Panic Cascade**
_Concept_: Conflicting weather/cancellation messages spread across vendors, managers, and customers causing market-wide confusion.
_Novelty_: Information inconsistency, not weather itself, becomes the primary failure mode.

**[Category #29] Sold-Out Baiting Pattern**
_Concept_: Vendor repeatedly advertises high-demand items but marks sold out shortly after opening, creating engagement without fulfillment.
_Novelty_: Availability signaling can be gamed as attention capture rather than service accuracy.

**[Category #30] Mass Late Arrival Surge**
_Concept_: Many vendors arrive late simultaneously, overwhelming manager escalation workflows and stale-status correction capacity.
_Novelty_: Operational policies that work per vendor may fail under synchronized stress events.

### Failure Scenario Decisions (User-Directed)

**Ghost Check-In Abuse**

- Detection signal: Geolocation required for check-in, preferably automated.
- Containment intent: Prevent check-in without valid on-site location proof.

**Weather Panic Cascade**

- Authority rule: Only market managers can communicate weather cancellation decisions.

**Sold-Out Baiting Pattern**

- Observability rule: Vendor inventory changes appear in a visible feed for customers and market managers.
- Governance intent: Enable accountability and penalties for repeated bad-faith behavior.

**Mass Late Arrival Surge**

- Prioritization note: User considers this unlikely at present; lower immediate design priority.

### Anti-Abuse Requirements (Working)

1. The system shall require validated on-site geolocation evidence for vendor check-in, with automation preferred when available.
2. The system shall reject or downgrade check-ins that lack valid location verification.
3. The system shall restrict weather cancellation broadcast authority to market managers.
4. The system shall publish inventory status change events to a shared activity feed visible to customers and market managers.
5. The system shall support enforcement actions for repeated misleading inventory signaling patterns.

### Anti-Abuse Acceptance Criteria (Draft)

1. Given a vendor attempts check-in outside approved geolocation bounds, when check-in is submitted, then check-in is blocked or marked unverified.
2. Given a weather cancellation message is initiated by a non-manager actor, when broadcast is attempted, then publication is denied.
3. Given a vendor changes inventory state, when update is committed, then the change appears in the shared activity feed with timestamp.
4. Given repeated suspicious sold-out patterns are detected, when governance review runs, then the vendor is flagged for policy enforcement.

### Enforcement Model Decision (Current)

**User selection:** Option 4 - Manual manager-only discretion (temporary)

**[Category #31] Human-Adjudicated Enforcement Workflow**
_Concept_: Enforcement outcomes for suspected bad actors are decided by market managers through review workflows rather than automatic penalties.
_Novelty_: Prioritizes contextual human judgment while policy maturity and detection quality are still evolving.

### Governance Requirements - Manual Discretion Phase (Working)

1. The system shall route suspicious behavior events to manager review queues instead of auto-penalizing vendors.
2. The system shall provide managers with evidence context (event history, timestamps, inventory feed changes) for each case.
3. The system shall require managers to record enforcement rationale for auditability.
4. The system shall support configurable transition to automated or hybrid enforcement models in the future.

### Governance Acceptance Criteria - Manual Discretion Phase (Draft)

1. Given suspicious behavior is detected, when review is triggered, then case details appear in manager moderation queue with supporting evidence.
2. Given a manager takes an enforcement action, when the decision is saved, then rationale and timestamp are stored for audit.
3. Given no manager decision is made, when monitoring dashboards refresh, then the case remains open and visible until resolved.

### Technique Transition - SCAMPER (Rapid Expansion)

**Current lens:** S = Substitute

**[Category #32] Substitute Manual Check-In with Geofenced Auto Presence**
_Concept_: Replace manual attendance check-in with automatic geofence presence confirmation when vendor arrives on-site.
_Novelty_: Eliminates routine effort while improving trust through passive verification.

**[Category #33] Substitute Vendor Feed-First Discovery for Market-First Browse**
_Concept_: Replace market-centric browsing with a live vendor activity feed showing arrivals, inventory updates, and disruptions first.
_Novelty_: Prioritizes real-time confidence signals over static listing pages.

**[Category #34] Substitute Binary Open/Closed with Confidence Bands**
_Concept_: Replace simple open/closed status with confidence bands (high, medium, low) backed by signal freshness.
_Novelty_: Better matches uncertain real-world market operations.

**[Category #35] Substitute Search Results with Mission Outcomes**
_Concept_: Replace item search result lists with mission completion outcomes (found now, likely available, fallback route).
_Novelty_: Optimizes for shopping success rather than information lookup.

**[Category #36] Substitute Vendor Punishment with Progressive Coaching**
_Concept_: Replace immediate punitive interventions with manager-guided correction workflows during early reliability failures.
_Novelty_: Balances trust enforcement with vendor retention and behavior improvement.

**[Category #37] Substitute Single-Channel Alerts with Audience-Specific Broadcasts**
_Concept_: Replace generic notifications with role-specific updates tuned for customers, vendors, and managers.
_Novelty_: Reduces noise while increasing actionability by audience.

### SCAMPER - Substitute Selections Expanded

**User-selected substitutes:**

- Auto presence instead of manual check-in
- Live vendor feed instead of market-first browse
- Audience-specific broadcasts instead of one-size alerts

**[Category #38] MVP Slice - Passive Arrival Verification**
_Concept_: Vendors opt into geofenced auto-presence so arrival can be detected automatically, with fallback manual verification when location confidence is weak.
_Novelty_: Reduces vendor friction while preserving attendance trust through blended automation and fallback controls.

**PRD Requirement (Working):**
The system shall support passive vendor arrival verification through approved location signals, with fallback manual or manager verification when automated confidence is insufficient.

**Acceptance Criteria (Draft):**
1. Given a vendor with auto-presence enabled enters approved geofence bounds, when arrival is detected, then vendor attendance is updated automatically.
2. Given automated confidence is insufficient, when attendance cannot be verified, then vendor remains pending verification and fallback actions are available.

**Risk / Mitigation:**
- Risk: false positives or privacy resistance.
- Mitigation: explicit opt-in, visible confidence status, and manual fallback path.

**[Category #39] MVP Slice - Live Vendor Activity Feed**
_Concept_: The home experience prioritizes a feed of vendor arrivals, inventory changes, status updates, and disruptions instead of static market directory browsing.
_Novelty_: Makes freshness and current activity the primary discovery surface, not a secondary detail.

**PRD Requirement (Working):**
The system shall provide a live vendor activity feed that surfaces same-day operational updates before or alongside market directory views.

**Acceptance Criteria (Draft):**
1. Given same-day vendor events occur, when customers open the app, then a time-ordered activity feed is visible with freshness metadata.
2. Given users need broader exploration, when they navigate from the feed, then market and vendor detail views remain accessible without losing event context.

**Risk / Mitigation:**
- Risk: feed noise overwhelms users.
- Mitigation: filtering by followed vendors, products, markets, and event type.

**[Category #40] MVP Slice - Role-Specific Broadcast Engine**
_Concept_: Broadcasts are generated once but rendered differently for customers, vendors, and managers based on urgency and relevance.
_Novelty_: One source of truth with audience-specific delivery semantics.

**PRD Requirement (Working):**
The system shall support audience-specific broadcast delivery and presentation rules for customers, vendors, and market managers.

**Acceptance Criteria (Draft):**
1. Given a market-wide event is published, when notifications are sent, then customers, vendors, and managers each receive role-appropriate versions.
2. Given a user is not part of the relevant audience, when broadcasts are delivered, then irrelevant alerts are suppressed.

**Risk / Mitigation:**
- Risk: inconsistent message variants create confusion.
- Mitigation: single canonical event model with audience-specific templates.

### Emerging Product Pattern from Substitute Lens

- Core operating model: passive verification + live operational feed + audience-specific communication.
- Strategic implication: the app behaves more like a real-time market operations network than a static marketplace directory.

### Technique Transition - SCAMPER (Combine)

**Current lens:** C = Combine

**[Category #41] Combine Auto Presence + Live Feed into Verified Arrival Stream**
_Concept_: Vendor geofence arrivals automatically generate feed events that customers and managers can see in real time.
_Novelty_: Presence verification becomes both an operational signal and a discovery event.

**[Category #42] Combine Intent Shopping + Vendor Feed into Mission Tracking Feed**
_Concept_: User shopping missions subscribe the feed to only relevant vendors, products, and disruptions.
_Novelty_: Turns a noisy feed into a goal-directed shopping assistant.

**[Category #43] Combine Confidence Bands + Audience-Specific Broadcasts into Trust-Aware Messaging**
_Concept_: Alerts vary not just by audience but by confidence level, so low-confidence events are framed cautiously while confirmed events are definitive.
_Novelty_: Messaging tone adapts to signal quality, not just user role.

**[Category #44] Combine Manager Dashboard + Vendor Activity Feed into Shared Operations Timeline**
_Concept_: Managers, vendors, and customers see different views of the same underlying event timeline.
_Novelty_: A single event backbone powers multi-role coordination without divergent truths.

**[Category #45] Combine Reliability Reporting + Broadcast Engine into Reputation-Aware Delivery**
_Concept_: Vendor reliability history influences how prominently their claims are shown and whether messages are labeled as verified, cautionary, or pending.
_Novelty_: Past behavior directly shapes current trust presentation.

### SCAMPER - Combine Selections Expanded

**User-selected combinations:** 1, 4

**[Category #46] Product Anchor - Verified Arrival Stream**
_Concept_: Auto-presence events become public arrival moments in the live feed, visible to customers and managers with confidence and freshness context.
_Novelty_: Arrival is no longer just an internal ops status; it becomes a trust-building discovery primitive.

**User-Facing Workflow:**
1. Vendor enters geofenced market area.
2. System detects arrival and assigns confidence level.
3. Feed event appears: vendor has arrived, confidence high/medium, updated now.
4. Customers can tap into vendor details, products, and current status.
5. Managers see the same event in ops view with additional verification context.

**MVP Scope:**
- Geofenced arrival detection
- Feed event generation for arrival
- Confidence/freshness metadata on arrival events
- Shared event visible in customer and manager surfaces

**PRD Requirement (Working):**
The system shall generate verified arrival events from vendor presence signals and surface them in both customer discovery views and manager operations views.

**Acceptance Criteria (Draft):**
1. Given a vendor arrival is detected with sufficient confidence, when event processing completes, then an arrival event appears in both feed and manager operations timeline.
2. Given arrival confidence is low, when the event is shown, then confidence and freshness context are displayed and verification remains inspectable.

**Main Implementation Risk:**
- Risk: event noise or inaccurate location triggers undermine trust.
- Mitigation: confidence scoring, clear freshness badges, and manual correction paths.

**[Category #47] Product Anchor - Shared Operations Timeline**
_Concept_: One canonical event timeline powers different role-specific views for managers, vendors, and customers.
_Novelty_: Reduces conflicting truths by making all major operational changes originate from one event model.

**User-Facing Workflow:**
1. Vendor or manager creates or triggers an event.
2. Event is stored in canonical timeline.
3. Customers see public-safe subset, vendors see self-relevant subset, managers see full operational detail.
4. Subsequent actions and updates append to the same event history.

**MVP Scope:**
- Canonical event model
- Role-filtered timeline rendering
- Event freshness and provenance
- Support for arrival, inventory, disruption, and broadcast events

**PRD Requirement (Working):**
The system shall maintain a canonical operational event timeline and render role-specific views for customers, vendors, and market managers.

**Acceptance Criteria (Draft):**
1. Given an operational event is created, when timeline views render, then each role sees the correct authorized representation of the same underlying event.
2. Given an event is updated or resolved, when users revisit their timeline views, then the updated state and audit history remain consistent across roles.

**Main Implementation Risk:**
- Risk: permission complexity and message divergence create inconsistent UX.
- Mitigation: single event schema with role-based projection rules rather than independent per-role records.

### Architectural Signal from Combine Lens

- Likely system backbone: canonical event stream.
- Likely flagship user experience: verified arrival stream.
- Product implication: discovery, trust, and operations all converge on the same event infrastructure.

### Technique Transition - SCAMPER (Modify)

**Current lens:** M = Modify

**[Category #48] Modify Arrival Events into Countdown Events**
_Concept_: Instead of only showing that a vendor has arrived, show countdown-style states such as arriving soon, setting up, open now, and wrapping up.
_Novelty_: Expands arrival from a single moment into a fuller temporal experience for customers and managers.

**[Category #49] Modify Feed Cards into Trust Panels**
_Concept_: Replace simple activity cards with richer trust panels containing confidence score, freshness, source signals, and recent exceptions.
_Novelty_: Discovery objects become compact trust instruments rather than plain updates.

**[Category #50] Modify Broadcasts into Actionable Tasks**
_Concept_: Broadcasts can include a next action by audience, such as reroute shopper, confirm attendance, or review disruption.
_Novelty_: Communication becomes operational workflow, not just messaging.

**[Category #51] Modify Shared Timeline into a Replayable Incident Log**
_Concept_: Timeline events can be replayed after market close to review how disruptions unfolded and where trust broke down.
_Novelty_: The same live ops system becomes a learning and accountability tool.

**[Category #52] Modify Vendor Profiles into Reliability Profiles**
_Concept_: Vendor profiles foreground reliability history, attendance consistency, freshness habits, and responsiveness alongside products.
_Novelty_: Reputation becomes a first-class discovery attribute, not a hidden back-office metric.

### Strategic Priority Correction (User-Directed)

**Primary product goals to emphasize going forward:**

- Market onboarding is a primary goal.
- Vendor onboarding is a primary goal.
- Market calendar is a core capability.
- Vendor scheduling is a core capability.

**[Category #53] Market Onboarding Control Center**
_Concept_: Market managers onboard by creating the operational foundation: market profile, location, hours, recurring calendar, policies, and broadcast defaults.
_Novelty_: Treats market onboarding as system configuration for the whole coordination network, not just account signup.

**[Category #54] Vendor Fast-Start Onboarding**
_Concept_: Vendors become publish-ready through a short guided flow covering identity, products/categories, preferred markets, recurring schedule, and notification preferences.
_Novelty_: Optimizes for time-to-first-market rather than profile completeness.

**[Category #55] Market Calendar as Source of Truth**
_Concept_: Each market maintains a canonical event calendar with openings, closures, weather exceptions, special events, and seasonal schedule changes.
_Novelty_: Calendar becomes the anchor for discovery, scheduling, notifications, and attendance workflows.

**[Category #56] Vendor Scheduling Layer**
_Concept_: Vendors maintain recurring and exception-based schedules across one or more markets, with conflicts and gaps made visible before market day.
_Novelty_: Scheduling becomes proactive coordination instead of last-minute status correction.

**[Category #57] Activation Funnel from Onboarding to First Live Event**
_Concept_: The product measures success not at account creation but when a market or vendor is fully scheduled and visible in a live upcoming calendar.
_Novelty_: Aligns onboarding UX with operational readiness rather than generic completion percentages.

### Core Capability Requirements - Onboarding and Scheduling (Working)

1. The system shall support market onboarding flows that establish profile, calendar, operating rules, and communications defaults.
2. The system shall support vendor onboarding flows that establish products, target markets, scheduling preferences, and notification settings.
3. The system shall maintain a canonical market calendar that drives discovery, attendance expectations, and market-wide communications.
4. The system shall support vendor recurring schedules and exception-based schedule changes across markets.
5. The system shall surface onboarding progress in terms of readiness for first live market participation.

### Product Direction Adjustment

- The app is not only a real-time event stream product.
- It also needs a strong activation and scheduling foundation.
- Market calendar + vendor scheduling likely sit underneath verified arrival, feed updates, and manager operations.

### Activation Milestone Decision (User-Directed)

**User selection:** All four activation milestones are required.

**Activation ladder for MVP planning:**

1. Market created with live calendar.
2. Vendor onboarded with first scheduled market.
3. Manager can publish a market and invite vendors.
4. Customer can browse upcoming market calendar and available products.

**[Category #58] Sequential Activation Gates**
_Concept_: Product activation is measured as a staged system readiness ladder rather than a single completion checkpoint.
_Novelty_: Ensures supply-side and demand-side readiness are validated together.

### Activation Requirements - All Four Gates (Working)

1. The system shall treat market setup with a live calendar as a required activation gate.
2. The system shall treat vendor onboarding with an attached scheduled market as a required activation gate.
3. The system shall treat manager market publication and vendor invitation capability as a required activation gate.
4. The system shall treat customer upcoming-calendar and available-product browse capability as a required activation gate.
5. The system shall expose activation progress across all four gates at market and platform levels.

### Activation Acceptance Criteria - All Four Gates (Draft)

1. Given a market completes onboarding and has at least one upcoming calendar entry, when activation status is calculated, then gate 1 is marked complete.
2. Given a vendor completes onboarding and is scheduled for at least one upcoming market occurrence, when activation status is calculated, then gate 2 is marked complete.
3. Given a manager publishes a market occurrence and sends at least one vendor invitation, when activation status is calculated, then gate 3 is marked complete.
4. Given upcoming market occurrences and linked product availability data exist, when a customer opens calendar browse, then discoverable upcoming entries and available products are visible and gate 4 is marked complete.
5. Given any gate remains incomplete, when readiness dashboards render, then incomplete gates are shown with next required actions.
