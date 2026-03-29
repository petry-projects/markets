package auth

import (
	"context"
	"testing"

	"github.com/vektah/gqlparser/v2/gqlerror"
)

// Test: RequireRole returns nil for allowed role
func TestRequireRole_AllowedRole_ReturnsNil(t *testing.T) {
	ctx := WithUser(context.Background(), "user-123", "customer")

	err := RequireRole(ctx, "customer")
	if err != nil {
		t.Errorf("expected nil, got error: %v", err)
	}
}

// Test: RequireRole returns nil when role is one of multiple allowed roles
func TestRequireRole_MultipleAllowed_ReturnsNil(t *testing.T) {
	ctx := WithUser(context.Background(), "user-123", "vendor")

	err := RequireRole(ctx, "vendor", "manager")
	if err != nil {
		t.Errorf("expected nil, got error: %v", err)
	}
}

// Test: RequireRole returns FORBIDDEN for disallowed role
func TestRequireRole_DisallowedRole_ReturnsForbidden(t *testing.T) {
	ctx := WithUser(context.Background(), "user-123", "customer")

	err := RequireRole(ctx, "manager")
	if err == nil {
		t.Fatal("expected FORBIDDEN error, got nil")
	}

	assertGQLErrorCode(t, err, "FORBIDDEN")
}

// Test: RequireRole returns FORBIDDEN when no role in context (empty role)
func TestRequireRole_EmptyRole_ReturnsForbidden(t *testing.T) {
	ctx := WithUser(context.Background(), "user-123", "")

	err := RequireRole(ctx, "customer")
	if err == nil {
		t.Fatal("expected FORBIDDEN error, got nil")
	}

	assertGQLErrorCode(t, err, "FORBIDDEN")
}

// Test: RequireRole returns FORBIDDEN when no user in context at all
func TestRequireRole_NoContext_ReturnsForbidden(t *testing.T) {
	err := RequireRole(context.Background(), "customer")
	if err == nil {
		t.Fatal("expected FORBIDDEN error, got nil")
	}

	assertGQLErrorCode(t, err, "FORBIDDEN")
}

// Test: FORBIDDEN error does not leak role information
func TestRequireRole_ForbiddenMessage_NoRoleLeak(t *testing.T) {
	ctx := WithUser(context.Background(), "user-123", "customer")

	err := RequireRole(ctx, "manager")
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	gqlErr, ok := err.(*gqlerror.Error)
	if !ok {
		t.Fatal("expected *gqlerror.Error type")
	}

	// Message must be generic - not reveal the required role
	if gqlErr.Message != "access denied" {
		t.Errorf("expected generic 'access denied' message, got '%s'", gqlErr.Message)
	}
}

// Test: RequireAuth returns uid for authenticated user
func TestRequireAuth_AuthenticatedUser_ReturnsUID(t *testing.T) {
	ctx := WithUser(context.Background(), "user-123", "customer")

	uid, err := RequireAuth(ctx)
	if err != nil {
		t.Errorf("expected nil error, got: %v", err)
	}
	if uid != "user-123" {
		t.Errorf("expected uid 'user-123', got '%s'", uid)
	}
}

// Test: RequireAuth returns UNAUTHENTICATED for no user
func TestRequireAuth_NoUser_ReturnsUnauthenticated(t *testing.T) {
	_, err := RequireAuth(context.Background())
	if err == nil {
		t.Fatal("expected UNAUTHENTICATED error, got nil")
	}

	assertGQLErrorCode(t, err, "UNAUTHENTICATED")
}

// Test 1.5.10: Empty role string rejected
func TestRequireRole_EmptyRoleString_ReturnsForbidden(t *testing.T) {
	ctx := WithUser(context.Background(), "user-empty-role", "")

	err := RequireRole(ctx, "customer", "vendor", "manager")
	if err == nil {
		t.Fatal("expected FORBIDDEN error for empty role, got nil")
	}

	assertGQLErrorCode(t, err, "FORBIDDEN")
}

// Test 1.5.11: Multiple/compound roles not supported
func TestRequireRole_CompoundRole_ReturnsForbidden(t *testing.T) {
	ctx := WithUser(context.Background(), "user-compound", "customer,vendor")

	err := RequireRole(ctx, "customer", "vendor", "manager")
	if err == nil {
		t.Fatal("expected FORBIDDEN error for compound role, got nil")
	}

	assertGQLErrorCode(t, err, "FORBIDDEN")
}

// Test: FORBIDDEN error has correct GraphQL error extension code
func TestRequireRole_ForbiddenHasCorrectExtensionCode(t *testing.T) {
	ctx := WithUser(context.Background(), "user-123", "customer")

	err := RequireRole(ctx, "manager")
	if err == nil {
		t.Fatal("expected error, got nil")
	}

	gqlErr, ok := err.(*gqlerror.Error)
	if !ok {
		t.Fatal("expected *gqlerror.Error type")
	}

	code, exists := gqlErr.Extensions["code"]
	if !exists {
		t.Fatal("expected 'code' in error extensions")
	}

	if code != "FORBIDDEN" {
		t.Errorf("expected extension code 'FORBIDDEN', got '%s'", code)
	}
}

// assertGQLErrorCode checks that an error is a *gqlerror.Error with the expected extension code.
func assertGQLErrorCode(t *testing.T, err error, expectedCode string) {
	t.Helper()
	gqlErr, ok := err.(*gqlerror.Error)
	if !ok {
		t.Fatalf("expected *gqlerror.Error, got %T", err)
	}

	code, _ := gqlErr.Extensions["code"].(string)
	if code != expectedCode {
		t.Errorf("expected code '%s', got '%s'", expectedCode, code)
	}
}
