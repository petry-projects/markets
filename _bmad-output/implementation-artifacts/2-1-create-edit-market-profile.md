# Story 2.1: Create & Edit Market Profile

Status: ready-for-dev

## Story

As a market manager,
I want to create and maintain a market profile with name, location, description, and contact info,
so that customers and vendors can find and learn about my market.

## Acceptance Criteria

1. **Given** an authenticated manager, **When** they submit a `createMarket` mutation with name, address, description, location coordinates, and contact information, **Then** a market record is created in the `markets` table **And** the manager is automatically assigned to this market in `market_managers` **And** a second manager slot is flagged as required (FR41a) **And** the manager's recovery contact (email or phone) is required (FR41b).

2. **Given** an assigned manager, **When** they submit an `updateMarket` mutation, **Then** the market profile is updated **And** the update is reflected in customer-facing views.

3. **Given** a non-manager user (customer or vendor), **When** they attempt `createMarket` or `updateMarket`, **Then** the request is rejected with `FORBIDDEN`.

4. **Given** a manager not assigned to a market, **When** they attempt `updateMarket` on that market, **Then** the request is rejected with `FORBIDDEN`.

5. **Given** any authenticated user, **When** they query `market(id)` for a non-soft-deleted market, **Then** the public market profile is returned.

6. **Given** an authenticated manager, **When** they query `myMarkets`, **Then** only markets where they are an assigned manager are returned.

## Tasks / Subtasks

### Backend

- [ ] **Task 1: Database migration — `markets` table** (AC: 1, 2)
  - [ ] Create `000005_create_markets.up.sql` with columns: `id UUID PK`, `name TEXT NOT NULL`, `address TEXT NOT NULL`, `latitude DOUBLE PRECISION NOT NULL`, `longitude DOUBLE PRECISION NOT NULL`, `description TEXT`, `contact_email TEXT NOT NULL`, `contact_phone TEXT`, `social_links JSONB DEFAULT '{}'`, `requires_second_manager BOOLEAN DEFAULT TRUE`, `created_at TIMESTAMPTZ DEFAULT NOW()`, `updated_at TIMESTAMPTZ DEFAULT NOW()`, `deleted_at TIMESTAMPTZ`
  - [ ] Add index `idx_markets_deleted_at` for soft-delete filtering
  - [ ] Attach audit trigger: `CREATE TRIGGER markets_audit AFTER INSERT OR UPDATE OR DELETE ON markets FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();`
  - [ ] Create matching `.down.sql` rollback
  - [ ] Backfill `market_managers.market_id` FK constraint now that `markets` table exists: `ALTER TABLE market_managers ADD CONSTRAINT fk_market_managers_market FOREIGN KEY (market_id) REFERENCES markets(id);`

- [ ] **Task 2: Extend `market_managers` — add `recovery_contact`** (AC: 1)
  - [ ] Create `000006_add_recovery_contact.up.sql`: `ALTER TABLE market_managers ADD COLUMN recovery_contact TEXT NOT NULL DEFAULT '';`
  - [ ] Create matching `.down.sql`

- [ ] **Task 3: GraphQL schema — `market.graphqls`** (AC: 1, 2, 5, 6)
  - [ ] Define types: `Market`, `Location`, `ManagerAssignment`
  - [ ] Define inputs: `CreateMarketInput` (name!, address!, latitude!, longitude!, description, contactEmail!, contactPhone, socialLinks, recoveryContact!), `UpdateMarketInput` (id!, name, address, latitude, longitude, description, contactEmail, contactPhone, socialLinks)
  - [ ] Define mutations: `createMarket(input: CreateMarketInput!): Market!`, `updateMarket(input: UpdateMarketInput!): Market!`
  - [ ] Define queries: `market(id: ID!): Market`, `myMarkets: [Market!]!`
  - [ ] Run `go generate ./...` to regenerate gqlgen code

- [ ] **Task 4: Domain layer — Market aggregate** (AC: 1, 2)
  - [ ] Create/extend `internal/market/market.go`: `Market` struct with typed `MarketID`, `NewMarket()` factory with input validation (name non-empty, valid coordinates, valid email)
  - [ ] Add `Update()` method for partial field updates
  - [ ] Define domain errors: `ErrInvalidMarketName`, `ErrInvalidCoordinates`, `ErrInvalidContactEmail`

- [ ] **Task 5: Repository layer** (AC: 1, 2, 4, 5, 6)
  - [ ] Extend `internal/market/repository.go` interface: `Create(ctx, market) error`, `Update(ctx, market) error`, `FindByID(ctx, id) (*Market, error)`, `FindByManagerID(ctx, userID) ([]*Market, error)`
  - [ ] Implement in `internal/db/market_repo.go` using pgx parameterized queries
  - [ ] All SELECTs include `WHERE deleted_at IS NULL`
  - [ ] Set session variables before writes: `SET LOCAL app.actor_id`, `SET LOCAL app.actor_role`

- [ ] **Task 6: Resolver implementation** (AC: 1-6)
  - [ ] `CreateMarket` resolver in `internal/graph/market.resolvers.go`:
    1. `auth.RequireRole(ctx, "manager")`
    2. Validate input via domain factory `NewMarket()`
    3. Begin transaction
    4. Insert market row
    5. Insert `market_managers` row (current user + recovery_contact)
    6. Set session variables for audit trigger
    7. Commit transaction
    8. Publish `MarketCreated` domain event
    9. Return populated Market
  - [ ] `UpdateMarket` resolver:
    1. `auth.RequireRole(ctx, "manager")`
    2. Scope check: `IsManagerAssigned(ctx, userID, marketID)`
    3. Load existing market, apply updates via `market.Update()`
    4. Save to DB with session variables
    5. Publish `MarketUpdated` domain event
  - [ ] `Market` query resolver: `FindByID` with soft-delete filter (public, any authenticated user)
  - [ ] `MyMarkets` query resolver: `FindByManagerID` filtered to current user

- [ ] **Task 7: Domain events** (AC: 1, 2)
  - [ ] Add `MarketCreated` and `MarketUpdated` event types in `internal/events/types.go`
  - [ ] Publish after successful DB commits (never before)

- [ ] **Task 8: Backend tests** (AC: 1-6)
  - [ ] Unit tests for `NewMarket()` validation (empty name, invalid coords, invalid email)
  - [ ] Unit tests for `Market.Update()` partial updates
  - [ ] Resolver tests: `CreateMarket` happy path, missing fields, non-manager forbidden
  - [ ] Resolver tests: `UpdateMarket` happy path, not-assigned forbidden, not-found
  - [ ] Resolver tests: `Market` query, `MyMarkets` query
  - [ ] Integration tests: full resolver → DB → response roundtrip
  - [ ] Security edge cases: cross-market access, soft-deleted market access
  - [ ] Target: 80%+ line coverage, 75%+ branch coverage

### Frontend

- [ ] **Task 9: GraphQL operations** (AC: 1, 2, 5, 6)
  - [ ] Create `graphql/mutations/createMarket.graphql`
  - [ ] Create `graphql/mutations/updateMarket.graphql`
  - [ ] Create `graphql/queries/market.graphql`
  - [ ] Create `graphql/queries/myMarkets.graphql`
  - [ ] Run `npm run codegen` to generate TypeScript types + hooks

- [ ] **Task 10: MarketForm component** (AC: 1, 2)
  - [ ] Create `components/market/MarketForm.tsx` — reusable for create and edit modes
  - [ ] Use Gluestack UI components: `Box`, `VStack`, `Input`/`InputField`, `Button`/`ButtonText`, `Text`, `Heading`, `Textarea`/`TextareaInput`
  - [ ] NativeWind styling mapped to design tokens from `config.ts`
  - [ ] Fields: Market Name, Address, Description (textarea), Contact Email, Contact Phone (optional), Social Links (Instagram, Facebook, Website, Twitter/X — all optional), Recovery Contact (required on create)
  - [ ] Inline validation on blur: required fields, email format, coordinate format
  - [ ] Error display: red border + error text below field
  - [ ] Loading/disabled state during mutation
  - [ ] `accessibilityLabel` on all interactive elements
  - [ ] 44x44px minimum touch targets, 56px button height

- [ ] **Task 11: Market creation screen** (AC: 1)
  - [ ] Create `app/(manager)/markets/create.tsx`
  - [ ] Renders `MarketForm` in create mode
  - [ ] Calls `useCreateMarketMutation` with `optimisticResponse`
  - [ ] On success: navigate to market detail or markets list
  - [ ] On error: display user-friendly error message via Toast

- [ ] **Task 12: Market edit screen** (AC: 2)
  - [ ] Create or extend `app/(manager)/markets/[id]/edit.tsx`
  - [ ] Loads market data via `useMarketQuery`
  - [ ] Renders `MarketForm` in edit mode with pre-filled values
  - [ ] Calls `useUpdateMarketMutation` with `optimisticResponse`
  - [ ] Skeleton loading state while data loads

- [ ] **Task 13: My Markets list screen** (AC: 6)
  - [ ] Extend `app/(manager)/markets.tsx` (or `index.tsx`)
  - [ ] Query `myMarkets`, display as `FlashList` of market cards
  - [ ] Each card shows: market name, address, manager count
  - [ ] Tap navigates to market detail
  - [ ] FAB or header button: "+ Create Market"
  - [ ] Empty state: prompt to create first market

- [ ] **Task 14: Frontend tests** (AC: 1, 2, 6)
  - [ ] `MarketForm.test.tsx`: renders fields, validates on blur, submits mutation
  - [ ] Create screen test: mutation called with correct input
  - [ ] Edit screen test: pre-fills values, submits update mutation
  - [ ] My Markets list test: renders markets, handles empty state
  - [ ] Target: 80%+ line coverage

## Dev Notes

### Architecture Compliance

- **DDD**: Market is an aggregate root in `internal/market/`. Domain logic (validation, invariants) lives in the aggregate, not resolvers.
- **Repository pattern**: Interface in `internal/market/repository.go`, adapter in `internal/db/market_repo.go`.
- **No ORM**: Use pgx v5 directly with parameterized queries (`$1`, `$2`).
- **Resolver authorization**: Follow the 3-step pattern from Story 1.5 — `RequireRole` → scope check via `IsManagerAssigned` → business logic.
- **Error codes**: Use `gqlerr.NewError()` with standard codes (`FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `INTERNAL`). Never leak required role in error messages.
- **Soft-delete**: All SELECTs include `WHERE deleted_at IS NULL`. Repository layer enforces this.
- **Audit logging**: PostgreSQL triggers handle this automatically — do NOT manually insert audit rows.
- **Session variables**: Set `app.actor_id` and `app.actor_role` via `SET LOCAL` before writes so audit trigger captures actor.
- **Domain events**: Publish `MarketCreated`/`MarketUpdated` after successful DB commit, never before.
- **Transaction**: `createMarket` must use a transaction to atomically create market + assign manager.

### Key Patterns from Epic 1

- **Resolver structure**: See `internal/graph/market.resolvers.go` for existing pattern with `auth.RequireRole()` and `r.MarketRepo.IsManagerAssigned()`.
- **Error handling**: Domain errors defined in domain package, translated to GraphQL error codes in resolvers.
- **Junction table**: `market_managers` uses insert/delete (no soft-delete on junction), audit trigger provides history.
- **Context helpers**: `auth.UserFromContext(ctx)` returns current user with ID and role.
- **Event bus**: `r.EventBus.Publish(ctx, events.MarketCreated{...})` after commit.

### File Structure (Backend — new/modified files)

```
markets-api/
  migrations/
    000005_create_markets.up.sql          # NEW
    000005_create_markets.down.sql        # NEW
    000006_add_recovery_contact.up.sql    # NEW
    000006_add_recovery_contact.down.sql  # NEW
  schema/
    market.graphqls                       # NEW or EXTEND
  internal/
    market/
      market.go                          # EXTEND (add Market struct, NewMarket, Update)
      repository.go                      # EXTEND (add Create, Update, FindByID, FindByManagerID)
    db/
      market_repo.go                     # EXTEND (implement new repository methods)
    graph/
      market.resolvers.go               # EXTEND (add CreateMarket, UpdateMarket, Market, MyMarkets resolvers)
      market.resolvers_test.go           # NEW or EXTEND
    events/
      types.go                           # EXTEND (add MarketCreated, MarketUpdated)
```

### File Structure (Frontend — new/modified files)

```
markets-app/
  graphql/
    mutations/
      createMarket.graphql               # NEW
      updateMarket.graphql               # NEW
    queries/
      market.graphql                     # NEW
      myMarkets.graphql                  # NEW
  components/
    market/
      MarketForm.tsx                     # NEW
      MarketForm.test.tsx                # NEW
      MarketCard.tsx                     # NEW (for list view)
  app/
    (manager)/
      markets.tsx                        # EXTEND (add myMarkets list + create entry)
      markets/
        create.tsx                       # NEW
        [id]/
          edit.tsx                        # NEW
```

### UX Requirements

- **Form validation**: Inline on blur, not keystroke. Red border + error text below field.
- **Touch targets**: 44x44px minimum, 56px for primary buttons.
- **Design tokens**: All colors from `config.ts` — primary green #2D7D46, text #1A1A1A, border #E5E7EB.
- **Components**: Gluestack UI v3 only — `Box`, `VStack`, `HStack`, `Input`/`InputField`, `Button`/`ButtonText`, `Text`, `Heading`. No raw HTML elements.
- **Icons**: `lucide-react-native` only — no new icon packages.
- **Loading**: Skeleton loading for data fetches, disabled button state during mutations.
- **Accessibility**: `accessibilityLabel` on all interactive elements, WCAG 2.1 AA contrast.
- **Social links**: Optional section with Instagram, Facebook, Website, Twitter/X fields.
- **Recovery contact**: Required on create (email format, must differ from sign-in email). Shown in manager assignment context.

### Testing Strategy

- **TDD cycle**: Red → Green → Refactor for each acceptance criterion.
- **Backend unit**: Domain validation (`NewMarket`, `Update`), error cases.
- **Backend integration**: Full resolver → DB roundtrip with real schema.
- **Backend security**: Non-manager access, cross-market scope violation, soft-deleted market access.
- **Frontend component**: `MockedProvider` for Apollo, `fireEvent` for form interactions, `waitFor` for async.
- **Coverage**: 80% line minimum, 75% branch minimum for both backend and frontend.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1] — Acceptance criteria
- [Source: _bmad-output/planning-artifacts/architecture.md] — Technical stack, code structure, API patterns
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md] — Form patterns, design tokens, navigation
- [Source: _bmad-output/planning-artifacts/prd.md#FR8] — Market profile creation requirements
- [Source: _bmad-output/planning-artifacts/prd.md#FR6] — Multiple manager support
- [Source: _bmad-output/planning-artifacts/coding-standards.md] — Naming conventions, DDD patterns
- [Source: _bmad-output/implementation-artifacts/1-5-role-based-access-enforcement-middleware.md] — Auth pattern, error codes
- [Source: _bmad-output/implementation-artifacts/1-4-market-scoped-manager-permissions.md] — Scope check pattern, junction table design

## Dev Agent Record

### Agent Model Used

### Debug Log References

### Completion Notes List

### File List
