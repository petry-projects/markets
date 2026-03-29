package auth

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	firebaseauth "firebase.google.com/go/v4/auth"
)

// mockVerifier implements TokenVerifier for testing.
type mockVerifier struct {
	token *firebaseauth.Token
	err   error
}

func (m *mockVerifier) VerifyIDToken(_ context.Context, _ string) (*firebaseauth.Token, error) {
	return m.token, m.err
}

// Test case 1.2.1: Valid Google JWT accepted
func TestMiddleware_ValidGoogleJWTPopulatesContext(t *testing.T) {
	verifier := &mockVerifier{
		token: &firebaseauth.Token{
			UID: "google-user-123",
			Claims: map[string]interface{}{
				"role": "customer",
			},
		},
	}

	var capturedUID, capturedRole string
	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedUID = UserIDFromContext(r.Context())
		capturedRole = RoleFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer valid-google-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
	if capturedUID != "google-user-123" {
		t.Errorf("expected uid 'google-user-123', got '%s'", capturedUID)
	}
	if capturedRole != "customer" {
		t.Errorf("expected role 'customer', got '%s'", capturedRole)
	}
}

// Test case 1.2.2: Valid Apple JWT accepted
func TestMiddleware_ValidAppleJWTPopulatesContext(t *testing.T) {
	verifier := &mockVerifier{
		token: &firebaseauth.Token{
			UID: "apple-user-456",
			Claims: map[string]interface{}{
				"role": "vendor",
			},
		},
	}

	var capturedUID, capturedRole string
	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedUID = UserIDFromContext(r.Context())
		capturedRole = RoleFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer valid-apple-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
	if capturedUID != "apple-user-456" {
		t.Errorf("expected uid 'apple-user-456', got '%s'", capturedUID)
	}
	if capturedRole != "vendor" {
		t.Errorf("expected role 'vendor', got '%s'", capturedRole)
	}
}

// Test case 1.2.3: Expired JWT rejected
func TestMiddleware_ExpiredJWTReturnsUnauthenticated(t *testing.T) {
	verifier := &mockVerifier{
		err: errors.New("token expired"),
	}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called for expired token")
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer expired-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
	assertUnauthenticatedErrorCode(t, rec)
}

// Test case 1.2.4: Malformed JWT rejected
func TestMiddleware_MalformedTokenReturnsUnauthenticated(t *testing.T) {
	verifier := &mockVerifier{}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called for malformed token")
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "NotBearer something")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
	assertUnauthenticatedErrorCode(t, rec)
}

// Test case 1.2.5: Missing Authorization header
func TestMiddleware_MissingAuthorizationHeader(t *testing.T) {
	verifier := &mockVerifier{}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called without auth header")
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
	assertUnauthenticatedErrorCode(t, rec)
}

// Test case 1.2.6: JWT with wrong issuer
func TestMiddleware_WrongIssuerJWTReturnsUnauthenticated(t *testing.T) {
	verifier := &mockVerifier{
		err: errors.New("token has invalid issuer"),
	}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called for wrong-issuer token")
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer wrong-issuer-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
	assertUnauthenticatedErrorCode(t, rec)
}

// TestMiddleware_ValidJWTWithManagerRole verifies manager role extraction.
func TestMiddleware_ValidJWTWithManagerRole(t *testing.T) {
	verifier := &mockVerifier{
		token: &firebaseauth.Token{
			UID: "manager-789",
			Claims: map[string]interface{}{
				"role": "manager",
			},
		},
	}

	var capturedRole string
	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedRole = RoleFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer valid-manager-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
	if capturedRole != "manager" {
		t.Errorf("expected role 'manager', got '%s'", capturedRole)
	}
}

// TestMiddleware_ValidJWTWithNoRole handles tokens without a role claim gracefully.
func TestMiddleware_ValidJWTWithNoRole(t *testing.T) {
	verifier := &mockVerifier{
		token: &firebaseauth.Token{
			UID:    "new-user-000",
			Claims: map[string]interface{}{},
		},
	}

	var capturedRole string
	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedRole = RoleFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer valid-no-role-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
	if capturedRole != "" {
		t.Errorf("expected empty role, got '%s'", capturedRole)
	}
}

// TestMiddleware_EmptyBearerToken ensures empty bearer token is rejected.
func TestMiddleware_EmptyBearerToken(t *testing.T) {
	verifier := &mockVerifier{}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called for empty bearer token")
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer ")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
	assertUnauthenticatedErrorCode(t, rec)
}

// Test 1.5.9: Tampered JWT (modified role claim after signing) returns UNAUTHENTICATED.
// Firebase JWT middleware validates signature — tampered tokens fail signature verification.
func TestMiddleware_TamperedJWTReturnsUnauthenticated(t *testing.T) {
	verifier := &mockVerifier{
		err: errors.New("token has been tampered with: signature is invalid"),
	}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called for tampered token")
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer tampered-jwt-with-modified-role")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
	assertUnauthenticatedErrorCode(t, rec)
}

// Test 1.5.10: JWT with role="" passes middleware but RequireRole rejects it.
// The middleware allows it through (since the token is valid), but role-based
// checks at the resolver level will reject it. This test verifies the middleware
// side: empty role is set in context as "".
func TestMiddleware_EmptyRolePassesThroughMiddleware(t *testing.T) {
	verifier := &mockVerifier{
		token: &firebaseauth.Token{
			UID: "user-empty-role",
			Claims: map[string]interface{}{
				"role": "",
			},
		},
	}

	var capturedRole string
	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedRole = RoleFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer valid-token-empty-role")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
	// Empty role is not in validRoles, so ExtractUser returns ""
	if capturedRole != "" {
		t.Errorf("expected empty role, got '%s'", capturedRole)
	}
}

// Test 1.5.11: JWT with compound role "customer,vendor" passes middleware
// but ExtractUser rejects it (not in validRoles map) and sets role="".
func TestMiddleware_CompoundRoleRejectedByExtractUser(t *testing.T) {
	verifier := &mockVerifier{
		token: &firebaseauth.Token{
			UID: "user-compound-role",
			Claims: map[string]interface{}{
				"role": "customer,vendor",
			},
		},
	}

	var capturedRole string
	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedRole = RoleFromContext(r.Context())
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodPost, "/query", nil)
	req.Header.Set("Authorization", "Bearer valid-token-compound-role")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
	// "customer,vendor" is not in validRoles, so ExtractUser returns ""
	if capturedRole != "" {
		t.Errorf("expected empty role for compound role, got '%s'", capturedRole)
	}
}

// assertUnauthenticatedErrorCode validates the response contains an UNAUTHENTICATED GraphQL error.
func assertUnauthenticatedErrorCode(t *testing.T, rec *httptest.ResponseRecorder) {
	t.Helper()

	var resp struct {
		Errors []struct {
			Message    string                 `json:"message"`
			Extensions map[string]interface{} `json:"extensions"`
		} `json:"errors"`
	}

	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response body: %v", err)
	}

	if len(resp.Errors) == 0 {
		t.Fatal("expected at least one error in response")
	}

	code, ok := resp.Errors[0].Extensions["code"].(string)
	if !ok || code != "UNAUTHENTICATED" {
		t.Errorf("expected error code 'UNAUTHENTICATED', got '%s'", code)
	}
}
