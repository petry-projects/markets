package graph_test

import (
	"context"
	"errors"
	"sync"
	"testing"
	"time"

	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/db"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/events"
	"github.com/petry-projects/markets-api/internal/graph"
	"github.com/petry-projects/markets-api/internal/graph/model"
	"github.com/petry-projects/markets-api/internal/market"
	"github.com/petry-projects/markets-api/internal/vendor"
)

// --- Mock market repository ---

type mockMarketRepo struct {
	mu          sync.Mutex
	assignments []market.ManagerAssignment
	assignErr   error
	removeErr   error
	queryErr    error
	checkErr    error
}

func (m *mockMarketRepo) IsManagerAssigned(_ context.Context, managerID domain.UserID, marketID domain.MarketID) (bool, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.checkErr != nil {
		return false, m.checkErr
	}
	for _, a := range m.assignments {
		if a.ManagerID == managerID && a.MarketID == marketID {
			return true, nil
		}
	}
	return false, nil
}

func (m *mockMarketRepo) AssignManager(_ context.Context, managerID domain.UserID, marketID domain.MarketID) (*market.ManagerAssignment, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.assignErr != nil {
		return nil, m.assignErr
	}
	// Check for duplicate
	for _, a := range m.assignments {
		if a.ManagerID == managerID && a.MarketID == marketID {
			return nil, db.ErrDuplicateAssignment
		}
	}
	assignment := market.ManagerAssignment{
		ID:        "generated-id",
		ManagerID: managerID,
		MarketID:  marketID,
		CreatedAt: time.Now(),
	}
	m.assignments = append(m.assignments, assignment)
	return &assignment, nil
}

func (m *mockMarketRepo) RemoveManager(_ context.Context, managerID domain.UserID, marketID domain.MarketID) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.removeErr != nil {
		return m.removeErr
	}
	for i, a := range m.assignments {
		if a.ManagerID == managerID && a.MarketID == marketID {
			m.assignments = append(m.assignments[:i], m.assignments[i+1:]...)
			return nil
		}
	}
	return market.ErrManagerNotAssigned
}

func (m *mockMarketRepo) GetManagersByMarket(_ context.Context, marketID domain.MarketID) ([]market.ManagerAssignment, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.queryErr != nil {
		return nil, m.queryErr
	}
	var result []market.ManagerAssignment
	for _, a := range m.assignments {
		if a.MarketID == marketID {
			result = append(result, a)
		}
	}
	return result, nil
}

func (m *mockMarketRepo) CreateMarket(_ context.Context, rec *market.MarketRecord, managerID domain.UserID, recoveryContact string) (*market.MarketRecord, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	rec.ID = domain.MarketID("generated-market-id")
	rec.CreatedAt = time.Now()
	rec.UpdatedAt = time.Now()
	m.assignments = append(m.assignments, market.ManagerAssignment{
		ID:              "generated-id",
		ManagerID:       managerID,
		MarketID:        rec.ID,
		RecoveryContact: recoveryContact,
		CreatedAt:       time.Now(),
	})
	return rec, nil
}

func (m *mockMarketRepo) UpdateMarket(_ context.Context, rec *market.MarketRecord) (*market.MarketRecord, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	rec.UpdatedAt = time.Now()
	return rec, nil
}

func (m *mockMarketRepo) FindMarketByID(_ context.Context, id domain.MarketID) (*market.MarketRecord, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	if id == domain.MarketID("nonexistent") {
		return nil, db.ErrMarketNotFound
	}
	return &market.MarketRecord{
		ID:           id,
		Name:         "Test Market",
		Address:      "123 St",
		Latitude:     40.0,
		Longitude:    -74.0,
		ContactEmail: "a@b.com",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}, nil
}

func (m *mockMarketRepo) FindMarketsByManagerID(_ context.Context, managerID domain.UserID) ([]*market.MarketRecord, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	var result []*market.MarketRecord
	for _, a := range m.assignments {
		if a.ManagerID == managerID {
			result = append(result, &market.MarketRecord{
				ID:           a.MarketID,
				Name:         "Test Market",
				Address:      "123 St",
				Latitude:     40.0,
				Longitude:    -74.0,
				ContactEmail: "a@b.com",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			})
		}
	}
	return result, nil
}

func (m *mockMarketRepo) ListMarkets(_ context.Context, _ *int32, _ *int32) ([]*market.MarketRecord, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	return []*market.MarketRecord{}, nil
}

func (m *mockMarketRepo) CreateSchedule(_ context.Context, s *market.ScheduleRecord) (*market.ScheduleRecord, error) {
	s.ID = domain.MarketID("generated-schedule-id")
	s.CreatedAt = time.Now()
	s.UpdatedAt = time.Now()
	return s, nil
}

func (m *mockMarketRepo) UpdateSchedule(_ context.Context, s *market.ScheduleRecord) (*market.ScheduleRecord, error) {
	s.UpdatedAt = time.Now()
	return s, nil
}

func (m *mockMarketRepo) DeleteSchedule(_ context.Context, _ domain.MarketID) error {
	return nil
}

func (m *mockMarketRepo) FindScheduleByID(_ context.Context, id domain.MarketID) (*market.ScheduleRecord, error) {
	if id == domain.MarketID("nonexistent") {
		return nil, db.ErrScheduleNotFound
	}
	return &market.ScheduleRecord{
		ID:           id,
		MarketID:     domain.MarketID("market-a"),
		ScheduleType: "recurring",
		StartTime:    "08:00",
		EndTime:      "13:00",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}, nil
}

func (m *mockMarketRepo) FindSchedulesByMarketID(_ context.Context, _ domain.MarketID) ([]*market.ScheduleRecord, error) {
	return []*market.ScheduleRecord{}, nil
}

func (m *mockMarketRepo) UpdateMarketRules(_ context.Context, marketID domain.MarketID, rulesText string) (*market.MarketRecord, error) {
	return &market.MarketRecord{ID: marketID, Name: "Test", Address: "St", Latitude: 40, Longitude: -74, ContactEmail: "a@b.com", RulesText: rulesText, Status: "active", CreatedAt: time.Now(), UpdatedAt: time.Now()}, nil
}

func (m *mockMarketRepo) CancelMarket(_ context.Context, marketID domain.MarketID, status, reason, message string) (*market.MarketRecord, error) {
	return &market.MarketRecord{ID: marketID, Name: "Test", Address: "St", Latitude: 40, Longitude: -74, ContactEmail: "a@b.com", Status: status, CancellationReason: reason, CancellationMessage: message, CreatedAt: time.Now(), UpdatedAt: time.Now()}, nil
}

func (m *mockMarketRepo) ReactivateMarket(_ context.Context, marketID domain.MarketID) (*market.MarketRecord, error) {
	return &market.MarketRecord{ID: marketID, Name: "Test", Address: "St", Latitude: 40, Longitude: -74, ContactEmail: "a@b.com", Status: "active", CreatedAt: time.Now(), UpdatedAt: time.Now()}, nil
}

func (m *mockMarketRepo) CreateNotification(_ context.Context, n *market.NotificationRecord) (*market.NotificationRecord, error) {
	n.ID = "notif-id"
	n.SentAt = time.Now()
	return n, nil
}

func (m *mockMarketRepo) CreateInvitation(_ context.Context, inv *market.InvitationRecord) (*market.InvitationRecord, error) {
	inv.ID = "inv-id"
	inv.Status = "pending"
	inv.CreatedAt = time.Now()
	inv.UpdatedAt = time.Now()
	return inv, nil
}

func (m *mockMarketRepo) UpdateInvitationStatus(_ context.Context, id string, status string) (*market.InvitationRecord, error) {
	return &market.InvitationRecord{ID: id, Status: status, CreatedAt: time.Now(), UpdatedAt: time.Now()}, nil
}

func (m *mockMarketRepo) GetInvitationsByVendor(_ context.Context, _ domain.UserID) ([]*market.InvitationRecord, error) {
	return []*market.InvitationRecord{}, nil
}

func (m *mockMarketRepo) CreateRosterEntries(_ context.Context, marketID domain.MarketID, vendorID domain.UserID, dates []string, status string, rulesAcknowledged bool) ([]*market.RosterEntry, error) {
	var entries []*market.RosterEntry
	for _, d := range dates {
		entries = append(entries, &market.RosterEntry{ID: "re-id", MarketID: marketID, VendorID: vendorID, Date: d, Status: status, RulesAcknowledged: rulesAcknowledged, CreatedAt: time.Now(), UpdatedAt: time.Now()})
	}
	return entries, nil
}

func (m *mockMarketRepo) UpdateRosterEntryStatus(_ context.Context, id string, status string) (*market.RosterEntry, error) {
	return &market.RosterEntry{ID: id, Status: status, CreatedAt: time.Now(), UpdatedAt: time.Now()}, nil
}

func (m *mockMarketRepo) RejectRosterEntry(_ context.Context, id string, reason string) (*market.RosterEntry, error) {
	return &market.RosterEntry{ID: id, Status: "rejected", RejectionReason: reason, CreatedAt: time.Now(), UpdatedAt: time.Now()}, nil
}

func (m *mockMarketRepo) FindRosterEntryByID(_ context.Context, id string) (*market.RosterEntry, error) {
	return &market.RosterEntry{ID: id, MarketID: "test-market-1"}, nil
}

func (m *mockMarketRepo) DeleteRosterEntry(_ context.Context, _ string) error { return nil }

func (m *mockMarketRepo) GetRosterByDate(_ context.Context, _ domain.MarketID, _ string) ([]*market.RosterEntry, error) {
	return []*market.RosterEntry{}, nil
}

func (m *mockMarketRepo) GetDayPlans(_ context.Context, _ domain.MarketID, _, _ string) ([]*market.DayPlan, error) {
	return []*market.DayPlan{}, nil
}

func (m *mockMarketRepo) SearchVendors(_ context.Context, _, _ string, _ *int32) ([]market.VendorSummary, error) {
	return []market.VendorSummary{}, nil
}

func (m *mockMarketRepo) CreateMarketUpdate(_ context.Context, u *market.MarketUpdateRecord) (*market.MarketUpdateRecord, error) {
	u.ID = "generated-update-id"
	u.CreatedAt = time.Now()
	return u, nil
}

func (m *mockMarketRepo) FindMarketUpdates(_ context.Context, _ domain.MarketID, _ int32, _ int32) ([]*market.MarketUpdateRecord, error) {
	return []*market.MarketUpdateRecord{}, nil
}

func newMarketTestResolver() (*graph.Resolver, *mockMarketRepo, *testEventHandler) {
	marketRepo := &mockMarketRepo{}
	bus := events.NewBus()
	handler := &testEventHandler{}
	bus.Subscribe(handler)
	r := graph.NewResolverWithMarketRepo(nil, bus, &mockUserRepo{}, &mockClaimsSetter{}, marketRepo)
	return r, marketRepo, handler
}

func managerCtx(uid string) context.Context {
	ctx := context.Background()
	ctx = auth.WithUser(ctx, uid, "manager")
	return ctx
}

// --- Test 1.4.7: Scope check queries market_managers with correct manager_id ---

func TestScopeCheck_AssignedManager_Passes(t *testing.T) {
	r, repo, _ := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}

	ctx := managerCtx("mgr-1")

	// Market query should NOT return FORBIDDEN for assigned manager
	result, err := r.Query().Market(ctx, "market-a")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil market result")
	}
}

// --- Test 1.4.2: Unassigned manager receives FORBIDDEN ---

func TestScopeCheck_UnassignedManager_Forbidden(t *testing.T) {
	r, repo, _ := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}

	ctx := managerCtx("mgr-1")

	// Try to update market-b (not assigned) — should be forbidden
	_, err := r.Mutation().UpdateMarket(ctx, "market-b", model.UpdateMarketInput{})
	if err == nil {
		t.Fatal("expected FORBIDDEN error for unassigned market")
	}
	if !hasExtensionCode(err, "FORBIDDEN") {
		t.Errorf("expected FORBIDDEN extension code, got: %v", err)
	}
}

// --- Test 1.4.1: Assigned manager accesses market data successfully ---

func TestScopeCheck_AssignedManager_UpdateMarket_Passes(t *testing.T) {
	r, repo, _ := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}

	ctx := managerCtx("mgr-1")

	// UpdateMarket should pass scope check and succeed
	result, err := r.Mutation().UpdateMarket(ctx, "market-a", model.UpdateMarketInput{})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil market result")
	}
}

// --- Test: Non-manager role bypasses scope check ---

func TestScopeCheck_NonManagerRole_Bypasses(t *testing.T) {
	r, _, _ := newMarketTestResolver()

	// Customer role should not be subject to scope check
	ctx := context.Background()
	ctx = auth.WithUser(ctx, "customer-1", "customer")

	// Should succeed — no scope check for non-manager roles
	result, err := r.Query().Market(ctx, "any-market")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil market result for customer")
	}
}

// --- Test: AssignManager requires manager role ---

func TestAssignManager_NoRole_Forbidden(t *testing.T) {
	r, _, _ := newMarketTestResolver()

	ctx := context.Background() // no auth
	_, err := r.Mutation().AssignManager(ctx, "mgr-1", "market-a")
	if err == nil {
		t.Fatal("expected FORBIDDEN error for unauthenticated request")
	}
	if !hasExtensionCode(err, "FORBIDDEN") {
		t.Errorf("expected FORBIDDEN extension code, got: %v", err)
	}
}

// --- Test: AssignManager success ---

func TestAssignManager_Success(t *testing.T) {
	r, repo, handler := newMarketTestResolver()
	// Calling manager must be assigned to the target market for scope check
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("caller-mgr"), MarketID: domain.MarketID("market-a")},
	}

	ctx := managerCtx("caller-mgr")
	result, err := r.Mutation().AssignManager(ctx, "mgr-1", "market-a")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !result {
		t.Error("expected true result")
	}

	// Verify assignment was persisted (caller-mgr + mgr-1)
	if len(repo.assignments) != 2 {
		t.Fatalf("expected 2 assignments, got %d", len(repo.assignments))
	}
	if repo.assignments[1].ManagerID != domain.UserID("mgr-1") {
		t.Errorf("unexpected manager ID: %s", repo.assignments[1].ManagerID)
	}

	// Verify ManagerAssigned event published
	if len(handler.events) != 1 {
		t.Fatalf("expected 1 event, got %d", len(handler.events))
	}
	evt, ok := handler.events[0].(events.ManagerAssigned)
	if !ok {
		t.Fatal("expected ManagerAssigned event")
	}
	if evt.UserID != "mgr-1" || evt.MarketID != "market-a" {
		t.Errorf("unexpected event data: %+v", evt)
	}
}

// --- Test: AssignManager duplicate returns CONFLICT ---

func TestAssignManager_Duplicate(t *testing.T) {
	r, repo, _ := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("caller-mgr"), MarketID: domain.MarketID("market-a")},
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}

	ctx := managerCtx("caller-mgr")
	_, err := r.Mutation().AssignManager(ctx, "mgr-1", "market-a")
	if err == nil {
		t.Fatal("expected error for duplicate assignment")
	}
	if !hasExtensionCode(err, "CONFLICT") {
		t.Errorf("expected CONFLICT error, got: %v", err)
	}
}

// --- Test: AssignManager - event NOT published on DB failure ---

func TestAssignManager_NoEventOnDBFailure(t *testing.T) {
	r, repo, handler := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("caller-mgr"), MarketID: domain.MarketID("market-a")},
	}
	repo.assignErr = errors.New("db connection failed")

	ctx := managerCtx("caller-mgr")
	_, err := r.Mutation().AssignManager(ctx, "mgr-1", "market-a")
	if err == nil {
		t.Fatal("expected error")
	}

	if len(handler.events) != 0 {
		t.Errorf("expected 0 events when DB fails, got %d", len(handler.events))
	}
}

// --- Test 1.4.4: Cannot reduce below 2 managers (CONFLICT) ---

func TestRemoveManager_BelowMinimum_Conflict(t *testing.T) {
	r, repo, handler := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
		{ManagerID: domain.UserID("mgr-2"), MarketID: domain.MarketID("market-a")},
	}

	ctx := managerCtx("mgr-1")
	_, err := r.Mutation().RemoveManager(ctx, "mgr-1", "market-a")
	if err == nil {
		t.Fatal("expected error when removing would leave < 2 managers")
	}
	if !hasExtensionCode(err, "CONFLICT") {
		t.Errorf("expected CONFLICT error, got: %v", err)
	}

	// Verify no event published on failure
	if len(handler.events) != 0 {
		t.Errorf("expected 0 events, got %d", len(handler.events))
	}

	// Verify managers unchanged
	if len(repo.assignments) != 2 {
		t.Errorf("expected 2 managers to remain, got %d", len(repo.assignments))
	}
}

// --- Test 1.4.5: Can remove manager if 3+ remain ---

func TestRemoveManager_ThreeManagers_Success(t *testing.T) {
	r, repo, handler := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
		{ManagerID: domain.UserID("mgr-2"), MarketID: domain.MarketID("market-a")},
		{ManagerID: domain.UserID("mgr-3"), MarketID: domain.MarketID("market-a")},
	}

	ctx := managerCtx("mgr-1")
	result, err := r.Mutation().RemoveManager(ctx, "mgr-2", "market-a")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !result {
		t.Error("expected true result")
	}

	// Verify 2 managers remain
	if len(repo.assignments) != 2 {
		t.Fatalf("expected 2 managers remaining, got %d", len(repo.assignments))
	}

	// Verify ManagerRemoved event published
	if len(handler.events) != 1 {
		t.Fatalf("expected 1 event, got %d", len(handler.events))
	}
	evt, ok := handler.events[0].(events.ManagerRemoved)
	if !ok {
		t.Fatal("expected ManagerRemoved event")
	}
	if evt.UserID != "mgr-2" || evt.MarketID != "market-a" {
		t.Errorf("unexpected event data: %+v", evt)
	}
}

// --- Test: RemoveManager - event NOT published on DB failure ---

func TestRemoveManager_NoEventOnDBFailure(t *testing.T) {
	r, repo, handler := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
		{ManagerID: domain.UserID("mgr-2"), MarketID: domain.MarketID("market-a")},
		{ManagerID: domain.UserID("mgr-3"), MarketID: domain.MarketID("market-a")},
	}
	repo.removeErr = errors.New("db connection failed")

	ctx := managerCtx("mgr-1")
	_, err := r.Mutation().RemoveManager(ctx, "mgr-2", "market-a")
	if err == nil {
		t.Fatal("expected error")
	}

	if len(handler.events) != 0 {
		t.Errorf("expected 0 events when DB fails, got %d", len(handler.events))
	}
}

// --- Test: Handler failure does not affect resolve result ---

type failingHandler struct{}

func (h *failingHandler) Handle(_ context.Context, _ events.Event) error {
	return errors.New("handler failed")
}

func TestAssignManager_HandlerFailureDoesNotRollBack(t *testing.T) {
	marketRepo := &mockMarketRepo{
		assignments: []market.ManagerAssignment{
			{ManagerID: domain.UserID("caller-mgr"), MarketID: domain.MarketID("market-a")},
		},
	}
	bus := events.NewBus()
	bus.Subscribe(&failingHandler{})
	r := graph.NewResolverWithMarketRepo(nil, bus, &mockUserRepo{}, &mockClaimsSetter{}, marketRepo)

	ctx := managerCtx("caller-mgr")
	result, err := r.Mutation().AssignManager(ctx, "mgr-1", "market-a")
	if err != nil {
		t.Fatalf("handler failure should not cause resolver error: %v", err)
	}
	if !result {
		t.Error("expected true result despite handler failure")
	}

	// Verify assignment persisted despite handler failure (caller-mgr + mgr-1)
	if len(marketRepo.assignments) != 2 {
		t.Errorf("expected 2 assignments, got %d", len(marketRepo.assignments))
	}
}

// --- Test 1.4.3: Two managers see same shared state ---

func TestTwoManagers_SameMarket_BothAccessible(t *testing.T) {
	r, repo, _ := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
		{ManagerID: domain.UserID("mgr-2"), MarketID: domain.MarketID("market-a")},
	}

	// Both managers should pass scope check for market-a
	for _, mgrID := range []string{"mgr-1", "mgr-2"} {
		ctx := managerCtx(mgrID)
		result, err := r.Query().Market(ctx, "market-a")
		if err != nil {
			t.Fatalf("unexpected error for manager %s: %v", mgrID, err)
		}
		if result == nil {
			t.Fatalf("expected non-nil market result for manager %s", mgrID)
		}
	}
}

// --- Story 2.1: CreateMarket tests ---

func TestCreateMarket_Success(t *testing.T) {
	r, _, handler := newMarketTestResolver()
	ctx := managerCtx("mgr-1")

	result, err := r.Mutation().CreateMarket(ctx, model.CreateMarketInput{
		Name:            "Riverside Market",
		Address:         "123 River St",
		Latitude:        40.7128,
		Longitude:       -74.0060,
		ContactEmail:    "info@riverside.com",
		RecoveryContact: "recovery@example.com",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil market result")
	}
	if result.Name != "Riverside Market" {
		t.Errorf("expected name Riverside Market, got %s", result.Name)
	}
	if result.ContactEmail != "info@riverside.com" {
		t.Errorf("expected email info@riverside.com, got %s", result.ContactEmail)
	}

	// Verify MarketCreated event was published
	if len(handler.events) == 0 {
		t.Fatal("expected MarketCreated event to be published")
	}
	if handler.events[0].EventType() != "market.created" {
		t.Errorf("expected market.created event, got %s", handler.events[0].EventType())
	}
}

func TestCreateMarket_NonManager_Forbidden(t *testing.T) {
	r, _, _ := newMarketTestResolver()
	ctx := context.Background()
	ctx = auth.WithUser(ctx, "customer-1", "customer")

	_, err := r.Mutation().CreateMarket(ctx, model.CreateMarketInput{
		Name:            "Test",
		Address:         "123 St",
		Latitude:        40.0,
		Longitude:       -74.0,
		ContactEmail:    "a@b.com",
		RecoveryContact: "r@b.com",
	})
	if err == nil {
		t.Fatal("expected error for non-manager role")
	}
	if !hasExtensionCode(err, "FORBIDDEN") {
		t.Errorf("expected FORBIDDEN, got: %v", err)
	}
}

func TestCreateMarket_InvalidInput(t *testing.T) {
	r, _, _ := newMarketTestResolver()
	ctx := managerCtx("mgr-1")

	_, err := r.Mutation().CreateMarket(ctx, model.CreateMarketInput{
		Name:            "", // empty name should fail validation
		Address:         "123 St",
		Latitude:        40.0,
		Longitude:       -74.0,
		ContactEmail:    "a@b.com",
		RecoveryContact: "r@b.com",
	})
	if err == nil {
		t.Fatal("expected validation error for empty name")
	}
	if !hasExtensionCode(err, "VALIDATION_ERROR") {
		t.Errorf("expected VALIDATION_ERROR, got: %v", err)
	}
}

// --- Story 2.1: UpdateMarket tests ---

func TestUpdateMarket_Success(t *testing.T) {
	r, repo, handler := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	ctx := managerCtx("mgr-1")

	newName := "Updated Market"
	result, err := r.Mutation().UpdateMarket(ctx, "market-a", model.UpdateMarketInput{
		Name: &newName,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}
	if result.Name != "Updated Market" {
		t.Errorf("expected Updated Market, got %s", result.Name)
	}

	// Verify MarketUpdated event
	found := false
	for _, e := range handler.events {
		if e.EventType() == "market.updated" {
			found = true
		}
	}
	if !found {
		t.Error("expected market.updated event to be published")
	}
}

func TestUpdateMarket_NotAssigned_Forbidden(t *testing.T) {
	r, repo, _ := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	ctx := managerCtx("mgr-1")

	newName := "Hacked"
	_, err := r.Mutation().UpdateMarket(ctx, "market-b", model.UpdateMarketInput{
		Name: &newName,
	})
	if err == nil {
		t.Fatal("expected FORBIDDEN for unassigned market")
	}
	if !hasExtensionCode(err, "FORBIDDEN") {
		t.Errorf("expected FORBIDDEN, got: %v", err)
	}
}

// --- Story 2.1: MyMarkets tests ---

func TestMyMarkets_ReturnsAssigned(t *testing.T) {
	r, repo, _ := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-b")},
		{ManagerID: domain.UserID("mgr-2"), MarketID: domain.MarketID("market-c")},
	}
	ctx := managerCtx("mgr-1")

	result, err := r.Query().MyMarkets(ctx)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("expected 2 markets for mgr-1, got %d", len(result))
	}
}

func TestMyMarkets_NonManager_Forbidden(t *testing.T) {
	r, _, _ := newMarketTestResolver()
	ctx := context.Background()
	ctx = auth.WithUser(ctx, "customer-1", "customer")

	_, err := r.Query().MyMarkets(ctx)
	if err == nil {
		t.Fatal("expected FORBIDDEN for non-manager")
	}
	if !hasExtensionCode(err, "FORBIDDEN") {
		t.Errorf("expected FORBIDDEN, got: %v", err)
	}
}

// --- Mock vendor repo for market resolver tests (Epic 5) ---

type mockVendorRepoForMarket struct {
	vendors  []*vendor.VendorRecord
	products []*vendor.ProductRecord
	checkIns []*vendor.CheckInRecord
}

func (m *mockVendorRepoForMarket) CreateVendor(_ context.Context, v *vendor.VendorRecord) (*vendor.VendorRecord, error) {
	return v, nil
}
func (m *mockVendorRepoForMarket) UpdateVendor(_ context.Context, v *vendor.VendorRecord) (*vendor.VendorRecord, error) {
	return v, nil
}
func (m *mockVendorRepoForMarket) FindVendorByID(_ context.Context, id domain.VendorID) (*vendor.VendorRecord, error) {
	for _, v := range m.vendors {
		if v.ID == id {
			return v, nil
		}
	}
	return nil, vendor.ErrVendorNotFound
}
func (m *mockVendorRepoForMarket) FindVendorByUserID(_ context.Context, userID domain.UserID) (*vendor.VendorRecord, error) {
	for _, v := range m.vendors {
		if v.UserID == userID {
			return v, nil
		}
	}
	return nil, vendor.ErrVendorNotFound
}
func (m *mockVendorRepoForMarket) CreateProduct(_ context.Context, p *vendor.ProductRecord) (*vendor.ProductRecord, error) {
	return p, nil
}
func (m *mockVendorRepoForMarket) UpdateProduct(_ context.Context, p *vendor.ProductRecord) (*vendor.ProductRecord, error) {
	return p, nil
}
func (m *mockVendorRepoForMarket) FindProductByID(_ context.Context, _ domain.ProductID) (*vendor.ProductRecord, error) {
	return nil, vendor.ErrProductNotFound
}
func (m *mockVendorRepoForMarket) FindProductsByVendorID(_ context.Context, _ domain.VendorID) ([]*vendor.ProductRecord, error) {
	return nil, nil
}
func (m *mockVendorRepoForMarket) DeleteProduct(_ context.Context, _ domain.ProductID) error {
	return nil
}
func (m *mockVendorRepoForMarket) SearchMarkets(_ context.Context, _ string, _, _, _ *float64, _, _ *int32) ([]vendor.MarketSearchRow, error) {
	return nil, nil
}
func (m *mockVendorRepoForMarket) GetVendorMarketDates(_ context.Context, _ domain.UserID) ([]vendor.VendorMarketDateRow, error) {
	return nil, nil
}
func (m *mockVendorRepoForMarket) CreateCheckIn(_ context.Context, c *vendor.CheckInRecord) (*vendor.CheckInRecord, error) {
	return c, nil
}
func (m *mockVendorRepoForMarket) UpdateCheckIn(_ context.Context, c *vendor.CheckInRecord) (*vendor.CheckInRecord, error) {
	return c, nil
}
func (m *mockVendorRepoForMarket) FindCheckInByID(_ context.Context, _ domain.CheckInID) (*vendor.CheckInRecord, error) {
	return nil, vendor.ErrCheckInNotFound
}
func (m *mockVendorRepoForMarket) FindActiveCheckInsByVendor(_ context.Context, _ domain.VendorID) ([]*vendor.CheckInRecord, error) {
	return nil, nil
}
func (m *mockVendorRepoForMarket) FindCheckInsByVendor(_ context.Context, _ domain.VendorID) ([]*vendor.CheckInRecord, error) {
	return nil, nil
}
func (m *mockVendorRepoForMarket) FindCheckInsByMarketAndDate(_ context.Context, marketID domain.MarketID, _ string) ([]*vendor.CheckInRecord, error) {
	var result []*vendor.CheckInRecord
	for _, ci := range m.checkIns {
		if ci.MarketID == marketID {
			result = append(result, ci)
		}
	}
	return result, nil
}
func (m *mockVendorRepoForMarket) FindActiveCheckInsByMarket(_ context.Context, marketID domain.MarketID) ([]*vendor.CheckInRecord, error) {
	var result []*vendor.CheckInRecord
	for _, ci := range m.checkIns {
		if ci.MarketID == marketID && ci.Status == vendor.StatusCheckedIn {
			result = append(result, ci)
		}
	}
	return result, nil
}
func (m *mockVendorRepoForMarket) BatchCheckOut(_ context.Context, marketID domain.MarketID) (int, error) {
	count := 0
	now := time.Now()
	for _, ci := range m.checkIns {
		if ci.MarketID == marketID && ci.Status == vendor.StatusCheckedIn {
			ci.Status = vendor.StatusCheckedOut
			ci.CheckedOutAt = &now
			count++
		}
	}
	return count, nil
}

// --- Full test resolver (market + vendor repos) ---

func newFullTestResolver() (*graph.Resolver, *mockMarketRepo, *mockVendorRepoForMarket, *testEventHandler) {
	marketRepo := &mockMarketRepo{}
	vendorRepo := &mockVendorRepoForMarket{}
	bus := events.NewBus()
	handler := &testEventHandler{}
	bus.Subscribe(handler)
	r := graph.NewResolverWithVendorRepo(nil, bus, &mockUserRepo{}, &mockClaimsSetter{}, marketRepo, vendorRepo)
	return r, marketRepo, vendorRepo, handler
}

// --- Epic 5 Tests ---

func TestPublishMarketUpdate_Success(t *testing.T) {
	r, marketRepo, _, handler := newFullTestResolver()
	marketRepo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	ctx := managerCtx("mgr-1")

	result, err := r.Mutation().PublishMarketUpdate(ctx, "market-a", "Rain delay, opening at 10am")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}
	if result.ID != "generated-update-id" {
		t.Errorf("expected generated-update-id, got %q", result.ID)
	}
	if result.MarketID != "market-a" {
		t.Errorf("expected market-a, got %q", result.MarketID)
	}
	if result.Message != "Rain delay, opening at 10am" {
		t.Errorf("unexpected message: %q", result.Message)
	}
	if result.SenderID != "mgr-1" {
		t.Errorf("expected sender mgr-1, got %q", result.SenderID)
	}

	// Verify event published
	if len(handler.events) == 0 {
		t.Fatal("expected MarketUpdatePublished event")
	}
	if handler.events[0].EventType() != "market.update_published" {
		t.Errorf("expected market.update_published event, got %s", handler.events[0].EventType())
	}
}

func TestPublishMarketUpdate_NonManager_Forbidden(t *testing.T) {
	r, _, _, _ := newFullTestResolver()
	ctx := context.Background()
	ctx = auth.WithUser(ctx, "customer-1", "customer")

	_, err := r.Mutation().PublishMarketUpdate(ctx, "market-a", "Hello")
	if err == nil {
		t.Fatal("expected FORBIDDEN error for non-manager")
	}
	if !hasExtensionCode(err, "FORBIDDEN") {
		t.Errorf("expected FORBIDDEN, got: %v", err)
	}
}

func TestPublishMarketUpdate_EmptyMessage(t *testing.T) {
	r, marketRepo, _, _ := newFullTestResolver()
	marketRepo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	ctx := managerCtx("mgr-1")

	_, err := r.Mutation().PublishMarketUpdate(ctx, "market-a", "")
	if err == nil {
		t.Fatal("expected validation error for empty message")
	}
	if !hasExtensionCode(err, "VALIDATION_ERROR") {
		t.Errorf("expected VALIDATION_ERROR, got: %v", err)
	}
}

func TestRequestVendorConfirmation_Success(t *testing.T) {
	r, marketRepo, _, handler := newFullTestResolver()
	marketRepo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	ctx := managerCtx("mgr-1")

	result, err := r.Mutation().RequestVendorConfirmation(ctx, "market-a", []string{"v-1", "v-2"})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !result {
		t.Error("expected true result")
	}

	// Verify event published
	if len(handler.events) == 0 {
		t.Fatal("expected VendorConfirmationRequested event")
	}
	if handler.events[0].EventType() != "vendor.confirmation_requested" {
		t.Errorf("expected vendor.confirmation_requested event, got %s", handler.events[0].EventType())
	}
}

func TestRequestVendorConfirmation_EmptyVendorIDs(t *testing.T) {
	r, marketRepo, _, _ := newFullTestResolver()
	marketRepo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	ctx := managerCtx("mgr-1")

	_, err := r.Mutation().RequestVendorConfirmation(ctx, "market-a", []string{})
	if err == nil {
		t.Fatal("expected validation error for empty vendor IDs")
	}
	if !hasExtensionCode(err, "VALIDATION_ERROR") {
		t.Errorf("expected VALIDATION_ERROR, got: %v", err)
	}
}

func TestAutoCheckoutMarket_Success(t *testing.T) {
	r, marketRepo, vendorRepo, handler := newFullTestResolver()
	marketRepo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	vendorRepo.checkIns = []*vendor.CheckInRecord{
		{ID: domain.CheckInID("ci-1"), VendorID: domain.VendorID("v-1"), MarketID: domain.MarketID("market-a"), Status: vendor.StatusCheckedIn, CheckedInAt: time.Now()},
		{ID: domain.CheckInID("ci-2"), VendorID: domain.VendorID("v-2"), MarketID: domain.MarketID("market-a"), Status: vendor.StatusCheckedIn, CheckedInAt: time.Now()},
	}
	ctx := managerCtx("mgr-1")

	count, err := r.Mutation().AutoCheckoutMarket(ctx, "market-a")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if count != 2 {
		t.Errorf("expected 2 checkouts, got %d", count)
	}

	// Verify event published
	if len(handler.events) == 0 {
		t.Fatal("expected MarketAutoCheckoutCompleted event")
	}
	if handler.events[0].EventType() != "market.auto_checkout_completed" {
		t.Errorf("expected market.auto_checkout_completed event, got %s", handler.events[0].EventType())
	}
}

func TestAutoCheckoutMarket_NoActiveCheckIns(t *testing.T) {
	r, marketRepo, _, handler := newFullTestResolver()
	marketRepo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	ctx := managerCtx("mgr-1")

	count, err := r.Mutation().AutoCheckoutMarket(ctx, "market-a")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if count != 0 {
		t.Errorf("expected 0 checkouts, got %d", count)
	}

	// No event should be published when count is 0
	if len(handler.events) != 0 {
		t.Errorf("expected 0 events when no checkouts, got %d", len(handler.events))
	}
}

func TestMarketAttendance_Success(t *testing.T) {
	r, marketRepo, vendorRepo, _ := newFullTestResolver()
	marketRepo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}
	vendorRepo.checkIns = []*vendor.CheckInRecord{
		{ID: domain.CheckInID("ci-1"), VendorID: domain.VendorID("v-1"), MarketID: domain.MarketID("market-a"), Status: vendor.StatusCheckedIn, CheckedInAt: time.Now()},
	}
	ctx := managerCtx("mgr-1")

	result, err := r.Query().MarketAttendance(ctx, "market-a", "2026-03-29")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil attendance result")
	}
	if result.MarketID != "market-a" {
		t.Errorf("expected market-a, got %q", result.MarketID)
	}
	if result.Date != "2026-03-29" {
		t.Errorf("expected 2026-03-29, got %q", result.Date)
	}
}

func TestMarketUpdates_Success(t *testing.T) {
	r, _, _, _ := newFullTestResolver()
	ctx := managerCtx("mgr-1")

	result, err := r.Query().MarketUpdates(ctx, "market-a", nil, nil)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result == nil {
		t.Fatal("expected non-nil result")
	}
	if len(result) != 0 {
		t.Errorf("expected 0 updates from empty repo, got %d", len(result))
	}
}
