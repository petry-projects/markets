package auth

import (
	"context"
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

func TestMiddleware_ValidJWTPopulatesContext(t *testing.T) {
	verifier := &mockVerifier{
		token: &firebaseauth.Token{
			UID: "user-123",
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

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer valid-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Errorf("expected status 200, got %d", rec.Code)
	}
	if capturedUID != "user-123" {
		t.Errorf("expected uid 'user-123', got '%s'", capturedUID)
	}
	if capturedRole != "vendor" {
		t.Errorf("expected role 'vendor', got '%s'", capturedRole)
	}
}

func TestMiddleware_ExpiredJWTReturnsUnauthenticated(t *testing.T) {
	verifier := &mockVerifier{
		err: errors.New("token expired"),
	}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called for expired token")
	}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "Bearer expired-token")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
}

func TestMiddleware_MissingAuthorizationHeader(t *testing.T) {
	verifier := &mockVerifier{}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called without auth header")
	}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
}

func TestMiddleware_MalformedTokenReturnsUnauthenticated(t *testing.T) {
	verifier := &mockVerifier{}

	handler := NewMiddleware(verifier)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		t.Fatal("handler should not be called for malformed token")
	}))

	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "NotBearer something")
	rec := httptest.NewRecorder()

	handler.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}
}
