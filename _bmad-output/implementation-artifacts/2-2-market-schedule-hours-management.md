# Story 2.2: Market Schedule & Hours Management

Status: in-progress

## Story

As a market manager,
I want to set my market's operating schedule (days of week, hours, seasonal dates),
So that customers know when to visit and auto-checkout can be triggered.

## Acceptance Criteria

1. **Given** a manager editing market schedule, **When** they add a recurring schedule (day of week, start time, end time), **Then** the schedule is saved and visible to customers.

2. **Given** a market with a seasonal schedule, **When** the manager sets start and end dates for the season, **Then** the market appears as active only during the season.

3. **Given** a manager, **When** they add a one-time event schedule (specific date, hours, event name), **Then** it is saved alongside recurring schedules.

4. **Given** a manager, **When** they edit or delete a schedule entry, **Then** changes are persisted.

5. **Given** any authenticated user, **When** they view a market profile, **Then** schedules are returned with the market.

## Tasks

### Backend
- [ ] Create `market_schedules` table migration
- [ ] Extend GraphQL schema with schedule types and CRUD mutations
- [ ] Implement schedule repository methods
- [ ] Implement schedule resolvers
- [ ] Add domain events for schedule changes
- [ ] Write tests

### Frontend
- [ ] Create schedule list component
- [ ] Create add/edit schedule forms (recurring + one-time)
- [ ] Integrate into market management flow
- [ ] Write tests

## Dev Notes
- Reuse established patterns from Story 2.1
- Schedule types: RECURRING (day of week + hours + optional season) and ONE_TIME (date + hours + name)
- Auto-checkout trigger logic deferred to Epic 5 (check-in/out)
