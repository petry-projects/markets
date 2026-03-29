package graph_test

import (
	"context"
	"errors"
	"sync"
	"testing"

	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/db"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/events"
	"github.com/petry-projects/markets-api/internal/graph"
	"github.com/petry-projects/markets-api/internal/graph/model"
	"github.com/petry-projects/markets-api/internal/user"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// --- Test doubles ---

type mockUserRepo struct {
	mu    sync.Mutex
	users []*user.User
	err   error
}

func (m *mockUserRepo) Create(_ context.Context, u *user.User) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.err != nil {
		return m.err
	}
	// Check for duplicate
	for _, existing := range m.users {
		if existing.FirebaseUID == u.FirebaseUID {
			return db.ErrDuplicateUser
		}
	}
	u.ID = domain.UserID("generated-uuid")
	m.users = append(m.users, u)
	return nil
}

func (m *mockUserRepo) FindByFirebaseUID(_ context.Context, firebaseUID string) (*user.User, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	for _, u := range m.users {
		if u.FirebaseUID == firebaseUID {
			return u, nil
		}
	}
	return nil, db.ErrUserNotFound
}

type mockClaimsSetter struct {
	mu     sync.Mutex
	calls  []claimsCall
	err    error
}

type claimsCall struct {
	UID    string
	Claims map[string]interface{}
}

func (m *mockClaimsSetter) SetCustomUserClaims(_ context.Context, uid string, claims map[string]interface{}) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.calls = append(m.calls, claimsCall{UID: uid, Claims: claims})
	return m.err
}

type testEventHandler struct {
	mu     sync.Mutex
	events []events.Event
}

func (h *testEventHandler) Handle(_ context.Context, event events.Event) error {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.events = append(h.events, event)
	return nil
}

func newTestResolver() (*graph.Resolver, *mockUserRepo, *mockClaimsSetter, *testEventHandler) {
	repo := &mockUserRepo{}
	claims := &mockClaimsSetter{}
	bus := events.NewBus()
	handler := &testEventHandler{}
	bus.Subscribe(handler)
	r := graph.NewResolver(nil, bus, repo, claims)
	return r, repo, claims, handler
}

func authenticatedCtx(uid, email string) context.Context {
	ctx := context.Background()
	ctx = auth.WithUser(ctx, uid, "")
	ctx = auth.WithEmail(ctx, email)
	return ctx
}

// --- Tests ---

// Test case 1.3.1: Create user with customer role
func TestCreateUser_CustomerRole(t *testing.T) {
	r, repo, claims, handler := newTestResolver()
	ctx := authenticatedCtx("firebase-uid-1", "test@example.com")

	input := model.CreateUserInput{
		Role: model.RoleCustomer,
		Name: "Test User",
	}

	result, err := r.Mutation().CreateUser(ctx, input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.User.Role != model.RoleCustomer {
		t.Errorf("expected role CUSTOMER, got %s", result.User.Role)
	}
	if result.User.DisplayName != "Test User" {
		t.Errorf("expected name 'Test User', got %s", result.User.DisplayName)
	}
	if result.User.Email != "test@example.com" {
		t.Errorf("expected email 'test@example.com', got %s", result.User.Email)
	}

	// Verify repo was called
	if len(repo.users) != 1 {
		t.Fatalf("expected 1 user in repo, got %d", len(repo.users))
	}
	if repo.users[0].Role != "customer" {
		t.Errorf("expected repo role 'customer', got %s", repo.users[0].Role)
	}

	// Verify claims were set
	if len(claims.calls) != 1 {
		t.Fatalf("expected 1 claims call, got %d", len(claims.calls))
	}
	if claims.calls[0].Claims["role"] != "customer" {
		t.Errorf("expected claim role 'customer', got %v", claims.calls[0].Claims["role"])
	}

	// Verify domain event published
	if len(handler.events) != 1 {
		t.Fatalf("expected 1 event, got %d", len(handler.events))
	}
	uc, ok := handler.events[0].(events.UserCreated)
	if !ok {
		t.Fatal("expected UserCreated event")
	}
	if uc.Role != "customer" {
		t.Errorf("expected event role 'customer', got %s", uc.Role)
	}
}

// Test case 1.3.2: Create user with vendor role
func TestCreateUser_VendorRole(t *testing.T) {
	r, _, _, _ := newTestResolver()
	ctx := authenticatedCtx("firebase-uid-2", "vendor@example.com")

	input := model.CreateUserInput{
		Role: model.RoleVendor,
		Name: "Vendor User",
	}

	result, err := r.Mutation().CreateUser(ctx, input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.User.Role != model.RoleVendor {
		t.Errorf("expected role VENDOR, got %s", result.User.Role)
	}
}

// Test case 1.3.3: Create user with manager role
func TestCreateUser_ManagerRole(t *testing.T) {
	r, _, _, _ := newTestResolver()
	ctx := authenticatedCtx("firebase-uid-3", "manager@example.com")

	input := model.CreateUserInput{
		Role: model.RoleManager,
		Name: "Manager User",
	}

	result, err := r.Mutation().CreateUser(ctx, input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if result.User.Role != model.RoleManager {
		t.Errorf("expected role MANAGER, got %s", result.User.Role)
	}
}

// Test case 1.3.4: Reject duplicate user creation (CONFLICT)
func TestCreateUser_DuplicateUser(t *testing.T) {
	r, _, _, _ := newTestResolver()
	ctx := authenticatedCtx("firebase-uid-dup", "dup@example.com")

	input := model.CreateUserInput{
		Role: model.RoleCustomer,
		Name: "First User",
	}

	// First creation should succeed
	_, err := r.Mutation().CreateUser(ctx, input)
	if err != nil {
		t.Fatalf("first creation failed: %v", err)
	}

	// Second creation with same UID should fail with CONFLICT
	_, err = r.Mutation().CreateUser(ctx, model.CreateUserInput{
		Role: model.RoleVendor,
		Name: "Second User",
	})
	if err == nil {
		t.Fatal("expected error for duplicate user")
	}
	if !hasExtensionCode(err, "CONFLICT") {
		t.Errorf("expected CONFLICT error, got: %v", err)
	}
}

// Test case 1.3.5: Reject invalid role (VALIDATION_ERROR)
func TestCreateUser_InvalidRole(t *testing.T) {
	r, _, _, _ := newTestResolver()
	ctx := authenticatedCtx("firebase-uid-invalid", "invalid@example.com")

	input := model.CreateUserInput{
		Role: model.Role("INVALID"),
		Name: "Invalid Role User",
	}

	_, err := r.Mutation().CreateUser(ctx, input)
	if err == nil {
		t.Fatal("expected error for invalid role")
	}
	if !hasExtensionCode(err, "VALIDATION_ERROR") {
		t.Errorf("expected VALIDATION_ERROR, got: %v", err)
	}
}

// Test case 1.3.6: Audit log entry on user creation.
// This test requires a real database to verify audit log writes and is
// deferred to integration testing. Unit tests cannot meaningfully assert
// on database-level audit triggers or log table entries.

// Test case 1.3.7: User record includes all required fields, deleted_at is NULL
func TestCreateUser_RequiredFields(t *testing.T) {
	r, repo, _, _ := newTestResolver()
	ctx := authenticatedCtx("firebase-uid-fields", "fields@example.com")

	input := model.CreateUserInput{
		Role: model.RoleCustomer,
		Name: "Fields User",
	}

	result, err := r.Mutation().CreateUser(ctx, input)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	// Verify GraphQL response has all required fields
	if result.User.ID == "" {
		t.Error("expected non-empty ID")
	}
	if result.User.FirebaseUID != "firebase-uid-fields" {
		t.Errorf("expected firebaseUID 'firebase-uid-fields', got %s", result.User.FirebaseUID)
	}
	if result.User.CreatedAt == "" {
		t.Error("expected non-empty createdAt")
	}

	// Verify domain user has no deleted_at
	if len(repo.users) != 1 {
		t.Fatalf("expected 1 user, got %d", len(repo.users))
	}
	if repo.users[0].DeletedAt != nil {
		t.Error("expected deleted_at to be nil")
	}
}

// Test: Unauthenticated request returns error
func TestCreateUser_Unauthenticated(t *testing.T) {
	r, _, _, _ := newTestResolver()
	ctx := context.Background() // No auth context

	input := model.CreateUserInput{
		Role: model.RoleCustomer,
		Name: "Unauth User",
	}

	_, err := r.Mutation().CreateUser(ctx, input)
	if err == nil {
		t.Fatal("expected error for unauthenticated request")
	}
	if !hasExtensionCode(err, "UNAUTHENTICATED") {
		t.Errorf("expected UNAUTHENTICATED error, got: %v", err)
	}
}

// Test: Domain event NOT published when DB write fails
func TestCreateUser_NoEventOnDBFailure(t *testing.T) {
	repo := &mockUserRepo{err: errors.New("db connection failed")}
	claims := &mockClaimsSetter{}
	bus := events.NewBus()
	handler := &testEventHandler{}
	bus.Subscribe(handler)
	r := graph.NewResolver(nil, bus, repo, claims)

	ctx := authenticatedCtx("firebase-uid-fail", "fail@example.com")
	input := model.CreateUserInput{
		Role: model.RoleCustomer,
		Name: "Fail User",
	}

	_, err := r.Mutation().CreateUser(ctx, input)
	if err == nil {
		t.Fatal("expected error")
	}

	// Verify NO event was published
	if len(handler.events) != 0 {
		t.Errorf("expected 0 events when DB fails, got %d", len(handler.events))
	}
}

// Test: Claims setter failure does not prevent success response
func TestCreateUser_ClaimsFailureStillSucceeds(t *testing.T) {
	repo := &mockUserRepo{}
	claims := &mockClaimsSetter{err: errors.New("firebase unavailable")}
	bus := events.NewBus()
	r := graph.NewResolver(nil, bus, repo, claims)

	ctx := authenticatedCtx("firebase-uid-claims-fail", "claimsfail@example.com")
	input := model.CreateUserInput{
		Role: model.RoleCustomer,
		Name: "Claims Fail User",
	}

	result, err := r.Mutation().CreateUser(ctx, input)
	if err != nil {
		t.Fatalf("expected success even when claims fail, got: %v", err)
	}
	if result.User.DisplayName != "Claims Fail User" {
		t.Errorf("unexpected name: %s", result.User.DisplayName)
	}
}

// Test: Empty name returns VALIDATION_ERROR
func TestCreateUser_EmptyName(t *testing.T) {
	r, _, _, _ := newTestResolver()
	ctx := authenticatedCtx("firebase-uid-empty-name", "empty@example.com")

	input := model.CreateUserInput{
		Role: model.RoleCustomer,
		Name: "   ",
	}

	_, err := r.Mutation().CreateUser(ctx, input)
	if err == nil {
		t.Fatal("expected error for empty name")
	}
	if !hasExtensionCode(err, "VALIDATION_ERROR") {
		t.Errorf("expected VALIDATION_ERROR, got: %v", err)
	}
}

// Test: Name exceeding 200 characters returns VALIDATION_ERROR
func TestCreateUser_NameTooLong(t *testing.T) {
	r, _, _, _ := newTestResolver()
	ctx := authenticatedCtx("firebase-uid-long-name", "long@example.com")

	longName := ""
	for i := 0; i < 201; i++ {
		longName += "a"
	}

	input := model.CreateUserInput{
		Role: model.RoleCustomer,
		Name: longName,
	}

	_, err := r.Mutation().CreateUser(ctx, input)
	if err == nil {
		t.Fatal("expected error for name too long")
	}
	if !hasExtensionCode(err, "VALIDATION_ERROR") {
		t.Errorf("expected VALIDATION_ERROR, got: %v", err)
	}
}

func hasExtensionCode(err error, code string) bool {
	var gqlErr *gqlerror.Error
	if errors.As(err, &gqlErr) {
		if c, ok := gqlErr.Extensions["code"].(string); ok {
			return c == code
		}
	}
	return false
}
