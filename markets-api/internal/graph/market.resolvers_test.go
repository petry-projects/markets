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
	// The resolver will panic with "not implemented" after scope check passes,
	// so we recover from the panic to verify scope check passed.
	func() {
		defer func() {
			r := recover()
			if r == nil {
				t.Fatal("expected panic from not-implemented resolver")
			}
			// If we got here, scope check passed successfully
		}()
		_, _ = r.Query().Market(ctx, "market-a")
	}()
}

// --- Test 1.4.2: Unassigned manager receives FORBIDDEN ---

func TestScopeCheck_UnassignedManager_Forbidden(t *testing.T) {
	r, repo, _ := newMarketTestResolver()
	repo.assignments = []market.ManagerAssignment{
		{ManagerID: domain.UserID("mgr-1"), MarketID: domain.MarketID("market-a")},
	}

	ctx := managerCtx("mgr-1")

	// Try to access market-b (not assigned)
	_, err := r.Query().Market(ctx, "market-b")
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

	// UpdateMarket should pass scope check (then panic with not-implemented)
	func() {
		defer func() {
			r := recover()
			if r == nil {
				t.Fatal("expected panic from not-implemented resolver")
			}
		}()
		_, _ = r.Mutation().UpdateMarket(ctx, "market-a", model.UpdateMarketInput{})
	}()
}

// --- Test: Non-manager role bypasses scope check ---

func TestScopeCheck_NonManagerRole_Bypasses(t *testing.T) {
	r, _, _ := newMarketTestResolver()

	// Customer role should not be subject to scope check
	ctx := context.Background()
	ctx = auth.WithUser(ctx, "customer-1", "customer")

	// Should panic with not-implemented (scope check passed)
	func() {
		defer func() {
			r := recover()
			if r == nil {
				t.Fatal("expected panic from not-implemented resolver")
			}
		}()
		_, _ = r.Query().Market(ctx, "any-market")
	}()
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
		func() {
			defer func() {
				r := recover()
				if r == nil {
					t.Fatalf("expected panic from not-implemented resolver for manager %s", mgrID)
				}
				// Scope check passed for this manager
			}()
			_, _ = r.Query().Market(ctx, "market-a")
		}()
	}
}

