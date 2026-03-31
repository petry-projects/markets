---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - "/home/donpetry/markets/_bmad-output/planning-artifacts/prd.md"
  - "/home/donpetry/markets/_bmad-output/planning-artifacts/architecture.md"
  - "/home/donpetry/markets/_bmad-output/planning-artifacts/ux-design-specification.md"
---

# markets - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for markets, decomposing the requirements from the PRD, UX Design, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR1: Customer can create and access an account.
- FR2: Vendor can create and access an account.
- FR3: Market Manager can create and access an account.
- FR4: System can assign and enforce role-specific permissions for Customer, Vendor, and Market Manager.
- FR5: Market Manager can be assigned to one or more specific markets.
- FR6: Multiple Market Managers can manage the same market concurrently.
- FR7: System can restrict manager actions to only markets the manager is authorized to manage.
- FR8: Market Manager can create and maintain a market profile.
- FR9: Market Manager can manage market schedule and operational status.
- FR10: Market Manager can view and manage the vendor roster on a per-date basis using a date picker or calendar view. Managers can add vendors directly, approve or reject vendor join requests for specific dates, and manage vendor attendance commitments per market day.
- FR11: Vendor can create and maintain a vendor profile, including social media links (Instagram, Facebook, website), via a dedicated Edit Profile screen accessible from Profile settings.
- FR12: Vendor can define baseline product offerings associated with their profile.
- FR13: Vendor can request to join one or more markets by selecting specific operating dates from a calendar or date picker, submitting a per-date join request that requires Market Manager approval before the vendor appears on that date's roster.
- FR14: Vendor can check in for a market day. System shall warn and require acknowledgment if the vendor is already checked in at another market on the same day.
- FR15: Vendor can publish market-day exception statuses including running late, sold out, and not attending.
- FR16: Vendor can update availability state for products or categories without replacing full baseline profile data.
- FR17: Market Manager can view live attendance and status overview for vendors in a managed market.
- FR18: Market Manager can request attendance confirmation from unconfirmed vendors in a managed market.
- FR19: Market Manager can publish market-level operational updates.
- FR20: System can reflect vendor and market status changes across all relevant user views.
- FR20a: Market Manager can check in a vendor on their behalf; attribution shall display as "[Market Name] checked-in [Vendor Name]".
- FR20b: When a vendor is removed from a market roster mid-market-day while checked in, the system shall warn the Market Manager and require acknowledgment before proceeding with checkout.
- FR20c: System shall automatically check out all vendors at the end of the market's scheduled hours.
- FR20d: Vendor checkout events shall generate notifications to followers, matching the check-in notification pattern.
- FR20e: Customer onboarding flow guides new customers to set their location, select product preferences, and discover and follow nearby markets and vendors before reaching the main app experience.
- FR21: Customer can search markets with radius/distance filtering.
- FR22: Customer can search vendors with radius/distance filtering.
- FR23: Customer can discover vendors by product intent.
- FR24: Customer can view vendor presence and market participation status.
- FR25: Customer can follow vendors.
- FR26: Customer can follow markets.
- FR27: Customer can receive updates from followed vendors and markets.
- FR28: Customer can view alternatives when a preferred vendor or product is unavailable.
- FR29: System can notify relevant customers when a followed vendor checks in at any market.
- FR30: System can notify relevant customers when followed vendor or market statuses materially change.
- FR31: System can notify Market Managers of vendor disruptions and exception updates within managed markets.
- FR32a: Market Manager can view an aggregated activity feed of all vendor actions for a managed market on a given market day.
- FR32b: Vendor can view their own activity feed of actions and status changes.
- FR32c: Customer can view activity feeds for followed markets and followed vendors.
- FR33: System can present freshness context for customer-visible status and availability information.
- FR34: [Deferred to post-MVP] System can distinguish current versus stale market-day information.
- FR35: System can capture all data-creation actions in an immutable audit log.
- FR36: Audit entries can include actor identity, role, action type, affected record reference, timestamp, and action payload snapshot.
- FR37: All users can view an Activity Log of their own past actions. Market Managers can additionally review audit records for all activity within markets they are permitted to manage.
- FR38: System can support recovery workflows using audit history and retained record states.
- FR39: System can retain audit records for defined retention periods.
- FR40: Customer can request account deletion. Deletion is soft-delete only.
- FR41: Vendor can request account deletion. Deletion is soft-delete only.
- FR41a: System shall enforce a minimum of 2 Market Managers per market at all times.
- FR41b: Market Manager onboarding shall require a recovery account email or phone number.
- FR13a: Vendor can browse and search available markets by name, location, and operating schedule, view market details, and submit a per-date join request — accessible from the vendor Markets tab.
- FR10a: Market Manager can browse and search vendors by name, product category, or location, view vendor profiles, and send an invitation to join their market roster for specific dates. Invited vendors receive a notification and can accept or decline.
- FR10b: Market Manager can plan future market days
- FR10c: Market Manager can define market rules/expectations that vendors must acknowledge before joining. Visible on join request flow and "My Markets."
- FR10d: Market Manager can send notifications to all rostered vendors of a specific market with a custom message.
- FR10e: Market Manager can cancel or end a market day early (weather, emergency). Triggers notifications to all rostered vendors AND following customers. Market status updates to "Cancelled" or "Ended Early." by selecting upcoming dates from a calendar, seeing committed vendors vs. gaps, and proactively inviting vendors to fill gaps. Supports comparing vendor coverage across multiple upcoming dates.
- FR42: System can enforce role-based visibility so users only access data permitted for their role and market context.
- FR42a: All users can switch between roles ("Switch Mode") from their Profile settings without signing out. The app transitions to the target role's tab layout and home screen.
- FR42b: Customer can view and edit product preferences (category selections) from Profile settings. Preferences are used to personalize vendor recommendations in Discover and during onboarding.
- FR43: System can support notification preference controls for users.
- FR44: System can maintain action attribution for manager-originated updates in shared-market management scenarios.

### NonFunctional Requirements

- NFR1: Core vendor market-day actions shall complete user-visible confirmation within 10 seconds.
- NFR2: Market-day status changes shall propagate to subscribed role views within 60 seconds.
- NFR3: Customer search queries shall return results within 2 seconds for 95% of requests.
- NFR4: Manager dashboard refresh shall complete within 3 seconds for 95% of requests.
- NFR5: System shall maintain 99.5% monthly availability, 99.9% Saturday 6am-2pm.
- NFR6: Real-time delivery pathways shall provide graceful degradation to polling.
- NFR7: No acknowledged status-change event shall be silently dropped.
- NFR8: Platform shall support 50 concurrent vendor/manager actions and 200 concurrent customer sessions in peak hour.
- NFR9: All data in transit encrypted using TLS.
- NFR10: All persisted data encrypted at rest.
- NFR11: Access control enforcement at backend service layer.
- NFR12: Immutable audit logs append-only with application-layer write protection.
- NFR13: Privacy controls supporting account deletion and role-scoped visibility.
- NFR14: No storage of sensitive payment credentials.
- NFR15: Architecture supports 10x growth from pilot baseline without redesign.
- NFR16: Horizontal scaling for notification and real-time event processing.
- NFR17: Data models support multi-market and multi-manager expansion.
- NFR18: MVP mobile workflows meet WCAG 2.1 AA intent for critical user journeys.
- NFR19: All critical flows operable with assistive technologies.
- NFR20: Critical action states conveyed through non-color-dependent cues.
- NFR21: All data-creation actions recorded with actor, role, action type, target, timestamp, payload.
- NFR22: Audit records queryable by authorized reviewer.
- NFR23: Audit retention minimum 12 months.
- NFR24: Recovery workflows supported from audit snapshots.
- NFR25: Operational monitoring for event delivery success rates, latency, failure alerts.

### Additional Requirements

- Architecture specifies Expo tabs starter template (`npx create-expo-app@latest markets-app --template tabs`) and gqlgen scaffold (`go run github.com/99designs/gqlgen init`) — Epic 1 Story 1 must set up both projects.
- Firebase project setup required: Auth, Realtime Database, FCM, Analytics — must be configured before auth or real-time features.
- Cloud SQL PostgreSQL with pgx v5 driver — database migrations via golang-migrate.
- Apollo Client 4.x for GraphQL client with @graphql-codegen for TypeScript types.
- NativeWind v4 for styling with Gluestack UI v3 for components.
- MMKV for offline queue and cached data storage.
- Cloud Run deployment with min-instances=1 for Saturday cold-start avoidance.
- Cloud Scheduler for auto-checkout jobs (FR20c).
- Firebase Realtime Database paths: `/markets/{marketId}/vendors/{vendorId}/status`.
- Structured logging via slog in Go backend.
- GraphQL schema split by domain: auth, market, vendor, customer, notification, audit.
- Audit logging via PostgreSQL triggers on all domain tables — guaranteed at DB level, not application level.
- Go domain event bus (`internal/events/`) for raising events after writes — handlers dispatch to Firebase Realtime and FCM.
- Go auth middleware sets PostgreSQL session variables (`app.actor_id`, `app.actor_role`) per request for trigger access.
- Test-driven development (TDD) is mandatory for all stories — write failing tests before implementation.

### UX Design Requirements

- UX-DR1: Implement Gluestack UI v3 provider with custom design tokens (color system with forest green primary, harvest gold secondary, semantic status colors for checked-in/running-late/sold-out/not-attending/pending).
- UX-DR2: Create StatusBadge component with 5 status variants, 3 sizes, optional freshness timestamp, and full accessibility labels.
- UX-DR3: Create VendorCard component (compact and expanded variants) displaying avatar, vendor name, market, StatusBadge, product tags, and follow button.
- UX-DR4: Create CheckInButton component with 4 states (ready, checked-in, pending, error), optimistic UI, and haptic feedback.
- UX-DR5: Create AttendanceSummaryBar component for manager dashboard with tappable segments filtering vendor list.
- UX-DR6: Create FreshnessTimestamp component with auto-update every 60 seconds and relative time display.
- UX-DR7: Create MarketCard component with market name, address, distance badge, vendor count, next market day, and follow button.
- UX-DR8: Create ExceptionStatusSelector bottom sheet with predefined exception states and single-tap selection.
- UX-DR9: Create ActivityFeedItem component with role-specific variants (customer, vendor, manager).
- UX-DR10: Implement bottom tab navigation with role-specific tab sets (Customer: Discover/Following/Profile; Vendor: Markets/Status/Profile; Manager: Dashboard/Vendors/Profile).
- UX-DR11: Implement skeleton screen loading pattern for all initial data loads (no spinners).
- UX-DR12: Implement optimistic UI pattern for all mutations with pending indicators and automatic retry.
- UX-DR13: Implement pull-to-refresh on all list/feed screens via Apollo refetch.
- UX-DR14: Implement empty states with friendly illustration + descriptive heading + actionable CTA for all list screens.
- UX-DR15: Ensure all interactive elements meet minimum 44x44px touch targets; primary actions 48x48px+.
- UX-DR16: Implement WCAG 2.1 AA color contrast (4.5:1 normal text, 3:1 large text) across all screens.
- UX-DR17: Add accessibilityLabel and accessibilityRole to all custom composed components.
- UX-DR18: Implement accessibilityLiveRegion for all status changes (polite for updates, assertive for errors).

### FR Coverage Map

- FR1, FR2, FR3, FR4: Epic 1 (Authentication & Role Setup)
- FR5, FR6, FR7: Epic 1 (Authentication & Role Setup)
- FR8, FR9: Epic 2 (Market Administration)
- FR10: Epic 2 (Market Administration)
- FR11, FR12, FR13: Epic 3 (Vendor Profile & Product Catalog)
- FR14, FR15, FR16: Epic 4 (Market-Day Vendor Operations)
- FR17, FR18, FR19, FR20, FR20a, FR20b, FR20c, FR20d: Epic 5 (Manager Dashboard & Market-Day Operations)
- FR20e: Epic 6, Story 6.0 (Customer Onboarding)
- FR21, FR22, FR23, FR24: Epic 6 (Customer Discovery & Search)
- FR25, FR26, FR27, FR28: Epic 6 (Customer Discovery & Search)
- FR29, FR30, FR31: Epic 7 (Notifications & Real-Time Updates)
- FR32a, FR32b, FR32c: Epic 7 (Notifications & Real-Time Updates)
- FR33: Epic 4/5/6 (Freshness timestamps across all views)
- FR35, FR36: Epic 1 Story 1.1b (Audit infrastructure) + Epic 8 (Audit review & recovery)
- FR37, FR38, FR39: Epic 8 (Audit, Trust & Data Integrity)
- FR40, FR41, FR41a, FR41b, FR42, FR43, FR44: Epic 8 (Audit, Trust & Data Integrity)

## Epic List

### Epic 1: Authentication & Role-Based Access
Users can create accounts, sign in with Google or Apple, and be assigned to one of three roles (customer, vendor, manager) with enforced permissions. This is the foundation enabling all other epics.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7

### Epic 2: Market Administration
Market managers can create market profiles, set schedules, and manage vendor rosters. This establishes the supply-side infrastructure.
**FRs covered:** FR8, FR9, FR10

### Epic 3: Vendor Profile & Product Catalog
Vendors can create profiles, define baseline product offerings, and associate with markets. This completes the supply side.
**FRs covered:** FR11, FR12, FR13

### Epic 4: Market-Day Vendor Operations
Vendors can check in, publish exception statuses, and update product availability during market day. The core coordination action.
**FRs covered:** FR14, FR15, FR16, FR33 (vendor freshness)

### Epic 5: Manager Dashboard & Market-Day Oversight
Managers can view live attendance, request confirmation from vendors, publish updates, check in vendors on their behalf, and handle auto-checkout.
**FRs covered:** FR17, FR18, FR19, FR20, FR20a, FR20b, FR20c, FR20d, FR33 (manager freshness), FR44

### Epic 6: Customer Discovery, Search & Follow
Customers can search for markets and vendors, view vendor status, follow markets and vendors, and discover alternatives.
**FRs covered:** FR21, FR22, FR23, FR24, FR25, FR26, FR27, FR28, FR33 (customer freshness)

### Epic 7: Notifications, Activity Feeds & Real-Time
Push notifications for check-in/checkout/exception events, activity feeds for all roles, and real-time status propagation.
**FRs covered:** FR29, FR30, FR31, FR32a, FR32b, FR32c, FR43

### Epic 8: Audit, Privacy & Account Governance
Immutable audit logging, account deletion, 2-manager minimum enforcement, recovery workflows, and role-based data visibility.
**FRs covered:** FR35, FR36, FR37, FR38, FR39, FR40, FR41, FR41a, FR41b, FR42

---

## Epic 1: Authentication & Role-Based Access

Users can create accounts using Google or Apple Sign-In, select their role, and have role-specific permissions enforced across the platform. Multiple managers can be assigned to the same market with scoped access.

### Story 1.1a: Frontend Project Scaffolding

As a developer,
I want the React Native/Expo frontend project initialized with all required dependencies,
So that frontend development can begin on a solid, configured foundation.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** the frontend setup is run
**Then** the Expo app is created with tabs template (`npx create-expo-app@latest markets-app --template tabs`)
**And** Gluestack UI v3 is initialized (`npx gluestack-ui init`) with custom theme provider and design tokens (UX-DR1)
**And** Apollo Client 4.x, NativeWind v4, MMKV, expo-secure-store, and expo-notifications are installed
**And** @graphql-codegen is configured to generate TypeScript types from the schema
**And** role-specific tab navigation is configured (UX-DR10): Customer (Discover/Following/Profile), Vendor (Markets/Status/Profile), Manager (Dashboard/Vendors/Profile)
**And** CI workflow exists for frontend (lint, test, type-check)
**And** a test runner is configured (Jest + React Native Testing Library) and a smoke test passes

### Story 1.1b: Backend Project Scaffolding & Audit Infrastructure

As a developer,
I want the Go backend and cloud infrastructure initialized with audit logging from day one,
So that backend development can begin and all write operations are logged from the start.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** the backend setup is run
**Then** the Go backend is scaffolded with gqlgen init, pgx v5, firebase-admin-go, chi router, slog, and golang-migrate
**And** Cloud SQL PostgreSQL instance is provisioned with auth proxy configured
**And** Firebase project is created with Auth (Google + Apple providers), Realtime Database, FCM, and Analytics enabled
**And** GraphQL schema files are created for the 6 domain schemas (auth, market, vendor, customer, notification, audit)
**And** the audit_log table is created via migration (id, actor_id, actor_role, action_type, target_type, target_id, market_id, timestamp, payload) with append-only enforcement — no UPDATE or DELETE permitted (FR35, FR36, NFR12)
**And** a reusable PostgreSQL audit trigger function is created that automatically inserts audit_log rows on INSERT/UPDATE/DELETE for any domain table it is attached to, capturing actor identity from session variables (`app.actor_id`, `app.actor_role`)
**And** Go auth middleware sets PostgreSQL session variables (`SET LOCAL app.actor_id`, `SET LOCAL app.actor_role`) from the Firebase JWT on each request
**And** a Go domain event bus (`internal/events/`) is implemented with publish/subscribe pattern, event type definitions, and handler registration
**And** event handlers are created for Firebase Realtime writes (`internal/realtime/`) and FCM push dispatch (`internal/notify/`) that subscribe to domain events
**And** CI workflow exists for backend (lint, test, build)
**And** a test runner is configured (Go test) and a smoke test passes

### Story 1.2: Google, Apple & Facebook Sign-In Authentication

As a user (any role),
I want to sign in using my Google, Apple, or Facebook account,
So that I can access the app without managing a password.

**Acceptance Criteria:**

**Given** an unauthenticated user on the login screen
**When** they tap "Sign in with Google"
**Then** the Firebase Auth Google OAuth flow completes and a Firebase JWT is returned
**And** the JWT is stored in expo-secure-store
**And** Apollo Client is configured with the JWT as Authorization Bearer header

**Given** an unauthenticated user on the login screen
**When** they tap "Sign in with Apple"
**Then** the Firebase Auth Apple OAuth flow completes and a Firebase JWT is returned
**And** the JWT is stored in expo-secure-store

**Given** an unauthenticated user on the login screen
**When** they tap "Sign in with Facebook"
**Then** the Firebase Auth Facebook OAuth flow completes and a Firebase JWT is returned
**And** the JWT is stored in expo-secure-store

**Given** a valid Firebase JWT in the Authorization header
**When** a GraphQL request reaches the Go backend
**Then** the auth middleware validates the JWT via Firebase Admin SDK
**And** extracts uid and role custom claim into the request context

**Given** an invalid or expired JWT
**When** a GraphQL request is made
**Then** the backend returns an UNAUTHENTICATED error code

### Story 1.3: Role Selection & User Record Creation

As a new user,
I want to select my role (customer, vendor, or market manager) after first sign-in,
So that the app presents the correct experience for my needs.

**Acceptance Criteria:**

**Given** a user who has just authenticated for the first time (no role custom claim)
**When** they reach the role selection screen
**Then** they see three options: Customer, Vendor, Market Manager
**And** each option has a clear description of the role

**Given** a user selects a role
**When** the selection is submitted
**Then** a user record is created in Cloud SQL (users table with id, firebase_uid, role, name, email, created_at, deleted_at)
**And** a Firebase custom claim `role` is set on the user's token via Firebase Admin SDK
**And** the app navigates to the role-appropriate tab layout

**Given** a returning user with an existing role
**When** they open the app
**Then** they are routed directly to their role-specific tab layout without role selection

### Story 1.4: Market-Scoped Manager Permissions

As a system administrator,
I want manager permissions scoped to specific markets,
So that managers can only administer markets they are assigned to.

**Acceptance Criteria:**

**Given** a market_managers junction table (manager_id, market_id, created_at)
**When** a manager attempts to access a market's data via GraphQL
**Then** the Go resolver queries market_managers to verify the manager is assigned to that market
**And** returns FORBIDDEN if not authorized

**Given** a manager assigned to Market A but not Market B
**When** they query Market B vendor roster
**Then** the request is rejected with FORBIDDEN error code

**Given** a market with two assigned managers
**When** either manager queries the market dashboard
**Then** both see the same shared state (vendor statuses, attendance counts)

**Given** an attempt to reduce a market below 2 managers
**When** a remove-manager mutation is called
**Then** the system rejects the request if it would leave fewer than 2 managers (FR41a)

### Story 1.5: Role-Based Access Enforcement Middleware

As the system,
I want to enforce role-based permissions at the GraphQL resolver level,
So that customers cannot access vendor/manager data and vice versa.

**Acceptance Criteria:**

**Given** a customer-role JWT
**When** the user attempts a vendor-only mutation (e.g., checkInVendor)
**Then** the resolver returns FORBIDDEN

**Given** a vendor-role JWT
**When** the user attempts a manager-only query (e.g., marketDashboard)
**Then** the resolver returns FORBIDDEN

**Given** any authenticated user
**When** they query data that includes soft-deleted records
**Then** soft-deleted records are excluded from results (FR42)

---

## Epic 2: Market Administration

Market managers can create and configure market profiles with schedules, hours, and location. They can build vendor rosters by adding, approving, and managing vendors for their markets.

### Story 2.1: Create & Edit Market Profile

As a market manager,
I want to create and maintain a market profile with name, location, description, and contact info,
So that customers and vendors can find and learn about my market.

**Acceptance Criteria:**

**Given** an authenticated manager
**When** they submit a createMarket mutation with name, address, description, location coordinates, and contact information
**Then** a market record is created in the markets table
**And** the manager is automatically assigned to this market in market_managers
**And** a second manager slot is flagged as required (FR41a)
**And** the manager's recovery contact (email or phone) is required (FR41b)

**Given** an assigned manager
**When** they submit an updateMarket mutation
**Then** the market profile is updated
**And** the update is reflected in customer-facing views

### Story 2.2: Market Schedule & Hours Management

As a market manager,
I want to set my market's operating schedule (days of week, hours, seasonal dates),
So that customers know when to visit and auto-checkout can be triggered.

**Acceptance Criteria:**

**Given** a manager editing market schedule
**When** they set operating days (e.g., Saturdays), start time, and end time
**Then** the schedule is saved to the market record
**And** the schedule is visible to customers viewing the market profile

**Given** a market with a seasonal schedule
**When** the manager sets start and end dates for the season
**Then** the market appears as active only during the season

### Story 2.2c: Market Rules & Expectations

As a market manager,
I want to define rules and expectations for vendors joining my market,
So that vendors understand requirements before committing and I have clear governance.

**Acceptance Criteria:**

**Given** a manager editing their market settings
**When** they open "Market Rules & Expectations"
**Then** they see a rich text editor with the current rules (or empty state prompting them to add rules)
**And** they can add/edit sections like: setup time, stall fees, insurance requirements, conduct policies, cancellation policy

**Given** a manager saves market rules
**When** the rules are saved
**Then** the rules are visible to any vendor viewing the market detail before requesting to join
**And** a "Last updated" timestamp is shown

**Given** a vendor viewing a market detail (from Find Markets or My Markets)
**When** the market has rules defined
**Then** the rules are displayed in a "Market Rules" section below the market profile
**And** when requesting to join, the vendor must acknowledge the rules with a checkbox: "I have read and agree to the market rules"

**Given** a vendor already rostered at a market
**When** they view the market in "My Markets"
**Then** they can tap "View Market Rules" to review the current rules at any time

### Story 2.2d: Send Vendor Notifications

As a market manager,
I want to send custom notifications to all rostered vendors for a specific market,
So that I can communicate important updates, reminders, or instructions.

**Acceptance Criteria:**

**Given** a manager on the Dashboard or Vendors tab
**When** they tap "Send Notification"
**Then** they see a compose screen with: market name (pre-selected), message text input, and "Send to All Vendors" button

**Given** a manager composes a notification
**When** they tap "Send"
**Then** a push notification is sent to all rostered vendors for that market
**And** the notification appears in each vendor's notification feed with the market name, message, and timestamp
**And** the send action is recorded in the audit log

### Story 2.2e: Cancel or End Market Early

As a market manager,
I want to cancel or end a market day early due to weather or emergency,
So that vendors and customers are immediately informed and don't make wasted trips.

**Acceptance Criteria:**

**Given** a manager on the Dashboard for an active or upcoming market day
**When** they tap "Cancel Market" or "End Market Early"
**Then** they see a confirmation screen with: reason selector (Weather, Emergency, Low Attendance, Other), optional message, and "Confirm Cancellation" button

**Given** a manager confirms a cancellation
**When** the cancellation is processed
**Then** ALL rostered vendors for that date receive a push notification: "[Market Name] has been cancelled for [Date] — Reason: [reason]"
**And** ALL customers following the market receive a push notification: "[Market Name] is cancelled today — [reason]"
**And** the market status updates to "Cancelled" or "Ended Early" across all customer and vendor views
**And** checked-in vendors are automatically checked out
**And** the cancellation is recorded in the audit log with manager attribution

**Given** a customer views the Following feed after a cancellation
**When** the market group loads
**Then** the market header shows "❌ Cancelled — [reason]" instead of hours
**And** vendor cards under that market show a "Market Cancelled" badge

### Story 2.2b: Future Market Day Planning

As a market manager,
I want to plan future market days by viewing vendor commitments, identifying gaps, and inviting vendors to fill them,
So that I can ensure a full, well-rounded market for customers on every upcoming date.

**Acceptance Criteria:**

**Given** a manager opens the Dashboard or Vendors tab
**When** they select "Plan Ahead" or tap a future date on the calendar
**Then** they see a planning view for that date showing: committed vendor count, vendor list grouped by product category, and gap indicators for underrepresented categories

**Given** a manager viewing the planning calendar
**When** they scan upcoming market dates
**Then** each date shows a coverage summary: vendor count, a fill bar (e.g., "18/24 vendors committed"), and a color indicator (green = full, yellow = gaps, red = critically low)

**Given** a manager selects a future date with gaps
**When** the planning detail loads
**Then** they see:
- Committed vendors grouped by category (Produce: 6, Dairy: 2, Baked Goods: 1, etc.)
- Gap alerts for categories with no vendors or fewer than typical ("⚠️ No flower vendors for Apr 11")
- A "Fill Gaps" button that opens Find & Invite Vendors pre-filtered to the missing categories and the selected date

**Given** a manager wants to compare across dates
**When** they select "Compare Dates" and pick 2-4 upcoming market days
**Then** they see a side-by-side summary: date, total vendors committed, category coverage, and gaps for each date

**Given** a manager invites a vendor from the planning view
**When** the invitation is sent
**Then** it specifies the target date(s) and the vendor's notification includes those dates
**And** upon acceptance, the vendor is added to the roster for those specific dates

**Given** a vendor who was committed to a future date cancels (status: Not Attending)
**When** the cancellation is processed
**Then** the planning view updates the coverage count and may surface a new gap alert for that date
**And** the manager receives a notification: "[Vendor] cancelled for [Date] — [Category] gap created"

### Story 2.2a: Browse & Invite Vendors to Market

As a market manager,
I want to browse and search for vendors and invite them to join my market,
So that I can proactively build my vendor roster with quality vendors.

**Acceptance Criteria:**

**Given** a manager on the Vendors tab
**When** they tap "Find & Invite Vendors"
**Then** they see a search screen with a search bar and filters (product category, location)

**Given** a manager searching for vendors
**When** they type a vendor name or product category
**Then** matching vendors appear with: business name, products, markets they attend, and follower count

**Given** a manager taps a vendor from search results
**When** the vendor detail loads
**Then** they see the vendor's full profile (name, description, products, social links, current markets)
**And** an "Invite to [Market Name]" button is visible

**Given** a manager taps "Invite to [Market Name]"
**When** the invitation is sent
**Then** the vendor receives a push notification: "[Market Name] has invited you to join their roster"
**And** the invitation appears in the vendor's Markets screen with status "Invited"
**And** the vendor can accept (entering the calendar date selection flow) or decline

**Given** a vendor accepts an invitation
**When** the acceptance is processed
**Then** the vendor selects their attendance dates via the calendar flow
**And** the vendor is added to the roster as APPROVED (no additional manager approval needed since manager initiated)

**Given** a vendor declines an invitation
**When** the decline is processed
**Then** the manager is notified and the invitation is removed

### Story 2.3: Per-Date Vendor Roster Management with Join Request Approval

As a market manager,
I want to view and manage my vendor roster on a per-date basis using a calendar,
So that I can see exactly who is committed to each market day and approve requests for specific dates.

**Acceptance Criteria:**

**Given** a manager opens the Vendors tab
**When** the roster view loads
**Then** a calendar or date picker is displayed at the top showing the market's operating dates (highlighted)
**And** the selected date defaults to the next upcoming market day
**And** the vendor list below shows only vendors committed to the selected date

**Given** a manager selects a different date on the calendar
**When** the date changes
**Then** the vendor list updates to show vendors committed to that specific date
**And** pending join requests for that date appear in a "Pending Approval" section
**And** the vendor count updates to reflect the selected date

**Given** a manager views the calendar
**When** they scan the month view
**Then** each operating date shows a vendor count badge (e.g., "24" vendors committed)
**And** dates with pending requests show an indicator dot

**Given** a vendor has submitted a join request for specific dates
**When** the manager selects one of those dates
**Then** the pending request appears with vendor name, products, and all dates they requested
**And** "Approve" and "Reject" action buttons are visible

**Given** a manager taps "Approve" on a pending join request
**When** the approval is processed
**Then** the vendor is added to the roster for all their requested dates
**And** the vendor is notified of the approval
**And** calendar date badges update to reflect new vendor counts

**Given** a manager taps "Reject" on a pending join request
**When** the rejection is processed
**Then** the manager can optionally provide a reason
**And** the vendor is notified of the rejection with the reason

**Given** a manager wants to add a vendor directly
**When** they tap "Add Vendor" and select a vendor and dates
**Then** the vendor is added with status=APPROVED for those specific dates

**Given** a vendor on the roster who is checked in on market day
**When** a manager attempts to remove them (FR20b)
**Then** the system warns the manager and requires acknowledgment before proceeding with checkout

**Given** a manager for Market A
**When** they attempt to modify Market B's roster (not assigned)
**Then** the request is rejected with FORBIDDEN

---

## Epic 3: Vendor Profile & Product Catalog

Vendors can create rich profiles, define their baseline product offerings, and associate with one or more markets to establish their presence in the system.

### Story 3.1: Create & Edit Vendor Profile

As a vendor,
I want to create and maintain my vendor profile with business name, description, and contact info,
So that customers can learn about my business.

**Acceptance Criteria:**

**Given** an authenticated vendor
**When** they submit a createVendorProfile mutation with business name, description, contact info, and optional social links (Instagram handle, Facebook URL, website URL)
**Then** a vendor record is created in the vendors table with social link fields
**And** the profile is visible in search results and market vendor lists
**And** social links are displayed on the vendor's public profile when provided

**Given** an existing vendor
**When** they update their profile
**Then** changes are reflected across all views

### Story 3.2: Product Catalog Management

As a vendor,
I want to define my baseline product offerings,
So that customers can discover me by the products I sell.

**Acceptance Criteria:**

**Given** a vendor with a profile
**When** they add products via addVendorProduct mutation (name, category, description)
**Then** products are saved in the vendor_products table
**And** products appear on the vendor's profile and in product search results

**Given** a vendor with existing products
**When** they edit or remove a product
**Then** the catalog is updated across all views

### Story 3.3a: Browse & Search Markets to Join

As a vendor,
I want to browse and search available markets from my Markets tab,
So that I can find new markets to sell at and request to join them.

**Acceptance Criteria:**

**Given** a vendor on the Markets tab
**When** they tap "Find Markets"
**Then** they see a search screen with a search bar and a list of nearby markets

**Given** a vendor searching for markets
**When** they type a market name, city, or product category
**Then** matching markets appear with: name, address, distance, operating days/hours, vendor count, and a "View Details" action

**Given** a vendor taps a market from search results
**When** the market detail loads
**Then** they see: full profile (name, address, description, schedule, season), current vendor count, manager contact info, and a "Request to Join" button leading to the calendar date selection flow (Story 3.3)

**Given** a vendor views a market they are already rostered at
**When** the detail loads
**Then** the "Request to Join" button is replaced with their current status (Approved/Pending) and their committed dates

### Story 3.3: Market Association with Calendar Date Selection

As a vendor,
I want to request to join a market by selecting specific dates from a calendar,
So that the market manager can review my request for each date and customers know exactly when to expect me.

**Acceptance Criteria:**

**Given** a vendor searching for markets to join
**When** they tap a market from search results
**Then** they see the market's profile with a calendar showing available operating dates

**Given** a vendor viewing a market's calendar
**When** they tap individual dates they plan to attend
**Then** the selected dates are highlighted on the calendar
**And** a summary shows the count and list of selected dates (e.g., "4 Saturdays selected: Mar 28, Apr 4, Apr 11, Apr 18")

**Given** a vendor wants to attend regularly
**When** they tap "Select All" or "Every [day]" shortcut
**Then** all operating dates for the season are selected
**And** the vendor can deselect individual dates they cannot attend

**Given** a vendor has selected their dates
**When** they tap "Request to Join"
**Then** market_vendor_dates records are created with status=PENDING for each selected date
**And** the market manager receives a notification of the join request showing requested dates
**And** the vendor sees status "Pending Approval" with their selected dates listed

**Given** a market manager approves the vendor's join request
**When** the approval is processed
**Then** the vendor's dates change to APPROVED
**And** the vendor is notified of the approval
**And** the vendor appears on the market's per-date roster for each approved date

**Given** a market manager rejects the vendor's join request
**When** the rejection is processed
**Then** the vendor is notified with an optional reason

**Given** a vendor associated with multiple markets
**When** they view their markets list
**Then** they see all market associations with status and their next upcoming committed date

---

## Epic 4: Market-Day Vendor Operations

Vendors can check in at markets, publish exception statuses, and update product availability during market day. This is the core coordination action that drives the entire platform.

### Story 4.1: Vendor Check-In with Conflict Detection

As a vendor,
I want to check in at my market with one tap,
So that my followers know I'm present and the manager can see my attendance.

**Acceptance Criteria:**

**Given** a vendor at a market on a scheduled market day
**When** they tap the CheckInButton (UX-DR4)
**Then** a check_in record is created in Cloud SQL (vendor_id, market_id, checked_in_at, status=CHECKED_IN)
**And** the UI optimistically shows "Checked In ✓" immediately
**And** the status is written to Firebase Realtime at `/markets/{marketId}/vendors/{vendorId}/status`
**And** a FreshnessTimestamp (UX-DR6) displays "just now"

**Given** a vendor already checked in at Market A
**When** they attempt to check in at Market B on the same day (FR14)
**Then** a conflict warning modal appears requiring explicit acknowledgment
**And** the check-in only proceeds after acknowledgment

**Given** the check-in fails due to network error
**When** connectivity is lost
**Then** the action is queued in MMKV for automatic retry on reconnect
**And** the UI shows "Check-in pending..." with the pending state (UX-DR12)

### Story 4.2: Exception Status Updates

As a vendor,
I want to publish exception statuses (running late, sold out, not attending),
So that customers and managers are informed of changes to my normal availability.

**Acceptance Criteria:**

**Given** a checked-in vendor
**When** they open the ExceptionStatusSelector (UX-DR8)
**Then** they see a bottom sheet with predefined options: Running Late, Sold Out, Not Attending
**And** each option has an icon and description

**Given** a vendor selects "Running Late"
**When** the selection is confirmed with a single tap
**Then** a vendor_statuses record is created (vendor_id, market_id, status=RUNNING_LATE, created_at)
**And** the status is written to Firebase Realtime
**And** the vendor's StatusBadge (UX-DR2) updates to the running-late variant

**Given** a vendor selects "Not Attending"
**When** the status is saved
**Then** the vendor is checked out of the market
**And** followers are notified of the status change

### Story 4.3: Product Availability Updates

As a vendor,
I want to update availability for specific products without changing my full catalog,
So that customers know what I currently have in stock.

**Acceptance Criteria:**

**Given** a checked-in vendor viewing their products
**When** they tap a product and select "Sold Out" or "Low Stock"
**Then** the product availability state is updated (FR16)
**And** the update is reflected in customer views with a FreshnessTimestamp

**Given** a vendor updating multiple products
**When** each update is submitted
**Then** only the affected product's availability changes — baseline catalog data is preserved

---

## Epic 5: Manager Dashboard & Market-Day Oversight

Market managers can view live attendance, request confirmations from vendors, publish market updates, check in vendors on their behalf, and rely on automatic checkout at market close.

### Story 5.1: Live Attendance Dashboard

As a market manager,
I want to view a live dashboard showing vendor attendance and status,
So that I can see at a glance who is present, pending, and absent.

**Acceptance Criteria:**

**Given** a manager opening their dashboard
**When** the dashboard loads
**Then** the AttendanceSummaryBar (UX-DR5) shows counts: X checked in / Y pending / Z exceptions out of total vendors
**And** the vendor list below shows each vendor with their StatusBadge and FreshnessTimestamp
**And** the vendor list supports filter toggles: All, Pending, Exceptions

**Given** a vendor checks in at the market
**When** the check-in is written to Firebase Realtime
**Then** the dashboard updates within 60 seconds (NFR2) without manual refresh
**And** the AttendanceSummaryBar counts update automatically

### Story 5.2: Request Vendor Confirmation

As a market manager,
I want to send a confirmation request to unconfirmed vendors,
So that I can get attendance status without making individual phone calls.

**Acceptance Criteria:**

**Given** a manager viewing pending vendors
**When** they select one or more unconfirmed vendors and tap "Request Confirmation"
**Then** a push notification is sent to each selected vendor
**And** the notification contains the market name and a prompt to check in or report an exception

### Story 5.3: Manager Check-In on Behalf of Vendor

As a market manager,
I want to check in a vendor on their behalf when they are present but haven't self-checked-in,
So that the attendance record stays accurate.

**Acceptance Criteria:**

**Given** a manager viewing a vendor with pending status
**When** they tap "Check In on Behalf" for that vendor
**Then** a check_in record is created with attribution showing "[Market Name] checked-in [Vendor Name]" (FR20a)
**And** the action is recorded in the audit log with the manager's identity (FR44)
**And** followers are notified of the vendor check-in

### Story 5.4: Market-Level Operational Updates

As a market manager,
I want to publish market-wide operational updates (e.g., "Parking lot full", "Rain delay"),
So that customers and vendors are informed of market-level conditions.

**Acceptance Criteria:**

**Given** a manager for an active market
**When** they publish a market update via publishMarketUpdate mutation
**Then** the update appears in the market's activity feed
**And** the update is visible to all customers following the market

### Story 5.5: Automatic Vendor Checkout at Market Close

As the system,
I want to automatically check out all vendors when a market's scheduled hours end,
So that stale check-in status does not persist after market close.

**Acceptance Criteria:**

**Given** a market with scheduled closing time of 2:00 PM
**When** Cloud Scheduler triggers the auto-checkout job after 2:00 PM (FR20c)
**Then** all vendors still checked in at that market are checked out
**And** checkout events generate notifications to followers (FR20d)
**And** vendor statuses in Firebase Realtime are cleared

**Given** a market that has already closed
**When** the auto-checkout runs
**Then** no duplicate checkouts occur for already-checked-out vendors

---

## Epic 6: Customer Discovery, Search & Follow

Customers can search for markets and vendors by name, product, or location. They can view vendor status, follow vendors and markets, and discover alternatives when their preferred vendor is unavailable.

### Story 6.0: Customer Onboarding — Location, Preferences & First Follows

As a new customer,
I want to be guided through setting my location, selecting product interests, and following nearby markets and vendors,
So that my Following feed has relevant content from day one and I don't land on an empty screen.

**Acceptance Criteria:**

**Given** a user who just selected the Customer role
**When** they complete role selection
**Then** they enter the customer onboarding flow (not the empty Following feed)

**Given** a customer on the location step
**When** they tap "Use My Location" or enter a city/zip manually
**Then** their location is saved for distance-based market and vendor discovery
**And** they can skip this step (defaults to no location filtering)

**Given** a customer on the preferences step
**When** they see product category chips (Produce, Dairy, Eggs, Honey, Baked Goods, Flowers, Meat, Artisan, etc.)
**Then** they can tap to select categories they're interested in
**And** selected preferences are saved and used to personalize search results

**Given** a customer on the discover step
**When** nearby markets and recommended vendors are displayed (based on location + preferences)
**Then** each market shows a MarketCard with vendor count and distance
**And** each vendor shows a VendorCard with products matching their preferences
**And** a "Follow" button is visible on each card

**Given** a customer follows at least one market or vendor during onboarding
**When** they tap "Done" or "Start Exploring"
**Then** they land on the Following feed with their followed vendors/markets populated
**And** if they followed zero, they land on the Discover tab instead

**Given** a customer skips the entire onboarding
**When** they tap "Skip" at any step
**Then** they land on the Discover tab with the search bar ready

### Story 6.1: Market & Vendor Search with Distance Filtering

As a customer,
I want to search for markets and vendors by name, product, or location with distance filtering,
So that I can find relevant markets and vendors near me.

**Acceptance Criteria:**

**Given** a customer on the Discover tab
**When** they type a search query (market name, vendor name, or product name)
**Then** results appear within 2 seconds (NFR3) showing matching markets and vendors
**And** each result shows a MarketCard (UX-DR7) or VendorCard (UX-DR3) with distance

**Given** a customer applies a distance filter (e.g., 10 miles)
**When** results are filtered
**Then** only markets and vendors within the specified radius appear (FR21, FR22)

**Given** a customer searches for a product (e.g., "organic eggs")
**When** results are returned
**Then** vendors who sell that product appear with the matching products highlighted (FR23)

**Given** search returns no results
**When** the empty state renders
**Then** a friendly empty state is shown (UX-DR14) with suggestions to broaden search

### Story 6.2: Vendor Profile & Market Status View

As a customer,
I want to view a vendor's profile with their current market-day status,
So that I can see what they sell, where they are, and whether they're present today.

**Acceptance Criteria:**

**Given** a customer taps on a vendor from search results or following list
**When** the vendor profile loads
**Then** it shows: vendor name, description, product catalog, market associations, current status with StatusBadge and FreshnessTimestamp (FR24)
**And** a Follow button is visible

**Given** a vendor is currently checked in at a market
**When** a customer views their profile
**Then** the status shows "Checked in at [Market Name]" with a FreshnessTimestamp (FR33)

### Story 6.3: Follow Vendors & Markets

As a customer,
I want to follow vendors and markets,
So that I receive updates about their status and activity.

**Acceptance Criteria:**

**Given** a customer viewing a vendor profile or VendorCard
**When** they tap the Follow button
**Then** a follows record is created (customer_id, target_type=vendor, target_id)
**And** the button changes to "Following"
**And** the vendor appears in the customer's Following tab

**Given** a customer viewing a MarketCard
**When** they tap Follow
**Then** a follows record is created (customer_id, target_type=market, target_id)
**And** the market appears in the customer's Following tab

**Given** a customer who has just followed their first vendor
**When** the follow action completes
**Then** the notification permission prompt appears at this contextually appropriate moment

### Story 6.4: Following Feed with Live Status

As a customer,
I want to see a live feed of my followed vendors and markets with current status,
So that I can make confident go/no-go decisions before traveling to market.

**Acceptance Criteria:**

**Given** a customer opens the Following tab (default home screen)
**When** the feed loads
**Then** each followed vendor shows a VendorCard with live StatusBadge and FreshnessTimestamp
**And** skeleton screens show during initial load (UX-DR11)
**And** pull-to-refresh is available (UX-DR13)

**Given** a followed vendor's status changes
**When** the update propagates via Firebase Realtime
**Then** the VendorCard in the following feed updates within 60 seconds (NFR2)

### Story 6.5: Alternative Vendor Discovery

As a customer,
I want to see alternative vendors when my preferred vendor is unavailable,
So that I can still find the products I need at the same market.

**Acceptance Criteria:**

**Given** a followed vendor has status "Not Attending" or "Sold Out" on a specific product
**When** the customer views the vendor's exception details
**Then** the app shows "Alternatives at [Market Name]" listing other vendors selling similar products (FR28)

---

## Epic 7: Notifications, Activity Feeds & Real-Time

Push notifications alert customers when followed vendors check in, check out, or post exceptions. Activity feeds provide per-role views of market-day events. Real-time propagation ensures all surfaces stay current.

### Story 7.1: Push Notification Infrastructure

As the system,
I want to register device tokens and dispatch push notifications via FCM,
So that users receive timely alerts about events they care about.

**Acceptance Criteria:**

**Given** a user grants notification permission
**When** the app registers with FCM
**Then** the device token is saved to the device_tokens table (user_id, token, platform, created_at)

**Given** a notification event occurs (vendor check-in, checkout, exception)
**When** the Go backend processes the event
**Then** FCM messages are dispatched to all relevant follower device tokens
**And** failed deliveries are retried (NFR7)
**And** delivery status is logged for monitoring (NFR25)

### Story 7.2: Vendor Check-In & Checkout Notifications

As a customer,
I want to receive push notifications when a followed vendor checks in or checks out,
So that I know when to head to the market and when vendors are leaving.

**Acceptance Criteria:**

**Given** a customer following Vendor A
**When** Vendor A checks in at any market (FR29)
**Then** the customer receives a push notification: "[Vendor Name] just checked in at [Market Name]"

**Given** a customer following a multi-market vendor
**When** the vendor checks in at any of their markets
**Then** the customer receives notifications for all check-ins (FR29)

**Given** a vendor checks out or is auto-checked-out (FR20d)
**When** the checkout event is processed
**Then** followers receive a checkout notification

### Story 7.3: Exception & Market Update Notifications

As a customer or manager,
I want to receive notifications when followed vendors post exceptions or markets publish updates,
So that I stay informed about material changes.

**Acceptance Criteria:**

**Given** a customer following Vendor A
**When** Vendor A posts "Not Attending" or "Sold Out"
**Then** the customer receives a push notification with the exception detail (FR30)

**Given** a manager of Market A
**When** a vendor at Market A posts an exception
**Then** the manager receives a push notification (FR31)

### Story 7.4: Notification Preferences

As a user,
I want to control which types of notifications I receive,
So that I only get alerts I care about.

**Acceptance Criteria:**

**Given** a user on the notification preferences screen
**When** they toggle notification types (check-in alerts, exception alerts, market updates)
**Then** the notification_prefs record is updated (FR43)
**And** future notifications respect these preferences

**Given** a user who has unfollowed a vendor
**When** that vendor checks in
**Then** no notification is sent to that user

### Story 7.5: Per-Role Activity Feeds

As any user,
I want to view an activity feed relevant to my role,
So that I can see recent events and actions.

**Acceptance Criteria:**

**Given** a manager viewing their market's activity feed (FR32a)
**When** the feed loads
**Then** it shows all vendor actions for the current market day: check-ins, checkouts, exception statuses, with ActivityFeedItems (UX-DR9) and FreshnessTimestamps

**Given** a vendor viewing their activity feed (FR32b)
**When** the feed loads
**Then** it shows their own actions: check-ins, status changes, with timestamps

**Given** a customer viewing their following feed (FR32c)
**When** the feed loads
**Then** it shows activity from followed vendors and markets

---

## Epic 8: Audit, Privacy & Account Governance

All data-creation actions are captured in an immutable audit log. Users can request account deletion (soft-delete). Managers can review audit records. The system enforces governance rules like minimum manager counts and role-based data visibility.

### Story 8.1: Immutable Audit Log Infrastructure

As the system,
I want all data-creation actions recorded in an append-only audit log,
So that every action is traceable and recoverable.

**Acceptance Criteria:**

**Given** any write operation (INSERT, UPDATE, DELETE) on any domain table with an attached audit trigger
**When** the database operation commits
**Then** the PostgreSQL trigger automatically inserts an audit_log entry with: actor_id and actor_role (from session variables), action_type (INSERT/UPDATE/DELETE), target_type (table name), target_id (row ID), market_id (if applicable), timestamp, and payload snapshot of old and new row data (FR35, FR36)

**Given** the audit_log table
**When** any UPDATE or DELETE SQL is attempted against audit_log
**Then** the operation is rejected — audit_log is append-only (NFR12)

**Given** a new domain table is created in any future migration
**When** the migration is written
**Then** the reusable audit trigger function must be attached to the new table to maintain audit coverage

**Given** audit records
**When** retention period is checked
**Then** records are retained for a minimum of 12 months (FR39, NFR23)

**Given** an accidental or incorrect data mutation has occurred (e.g., vendor wrongly soft-deleted)
**When** an authorized manager or admin initiates a recovery workflow using the audit log (FR38)
**Then** the audit log provides sufficient payload snapshot data to identify the prior state
**And** the system can reconstruct the affected record to its pre-mutation state
**And** the recovery action itself is recorded as a new audit log entry

### Story 8.2: Activity Log (All Roles)

As any user,
I want to view an Activity Log of my past actions, and as a manager I want to review all activity within my managed markets,
So that I can see my history and managers can investigate disputed actions.

**Acceptance Criteria:**

**Given** a customer viewing their Activity Log
**When** the log loads
**Then** it shows their own actions: follows, unfollows, searches, and profile changes
**And** each entry shows action type, target (vendor/market name), and timestamp
**And** entries can be filtered by date range

**Given** a vendor viewing their Activity Log
**When** the log loads
**Then** it shows their own actions: check-ins, checkouts, exception status changes, product updates, and profile edits
**And** each entry shows action type, market name, and timestamp
**And** entries can be filtered by date range and by market

**Given** a manager viewing their Activity Log
**When** they select "My Activity"
**Then** it shows their own actions: broadcasts, vendor approvals/rejections, check-ins on behalf, market edits
**And** each entry shows action type, target, and timestamp

**Given** a manager viewing their Activity Log
**When** they select "Market Activity" and choose a managed market
**Then** it shows ALL activity for that market: vendor check-ins, exceptions, manager actions (with attribution), roster changes
**And** each entry shows actor name, actor role, action type, target, and timestamp (NFR22)
**And** entries can be filtered by date range, actor, and action type

**Given** a manager for Market A
**When** they attempt to view Market B activity (not assigned)
**Then** the request is rejected with FORBIDDEN

**Given** any user viewing their Activity Log
**When** the log is empty for the selected date range
**Then** an empty state is shown: "No activity for this period"

### Story 8.3: Account Deletion (Soft-Delete)

As a customer or vendor,
I want to request account deletion,
So that my personal data is removed from user-facing surfaces while preserving audit integrity.

**Acceptance Criteria:**

**Given** a customer requesting account deletion (FR40)
**When** the deleteAccount mutation is processed
**Then** the user record's deleted_at is set (soft-delete)
**And** the account is removed from all search results, feeds, and user-facing views
**And** audit log entries referencing this user are preserved

**Given** a vendor requesting account deletion (FR41)
**When** the deletion is processed
**Then** the vendor profile, products, and market associations are soft-deleted
**And** existing check-in history and audit records are preserved

### Story 8.4: Governance Rules Enforcement

As the system,
I want governance rules enforced (minimum manager count, recovery contacts),
So that markets remain operable and recoverable.

**Acceptance Criteria:**

**Given** a market with exactly 2 managers
**When** a remove-manager action is attempted (FR41a)
**Then** the system rejects the removal to maintain the minimum

**Given** a new manager being onboarded
**When** they are assigned to a market
**Then** a recovery contact (email or phone) is required (FR41b)

**Given** any data query
**When** results are assembled
**Then** soft-deleted records are excluded from all user-facing views (FR42)

**Given** a manager action (broadcast, check-in on behalf, exception override)
**When** the action is recorded
**Then** it includes full attribution: manager identity, timestamp, and action detail (FR44)
