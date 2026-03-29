package gqlerr

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestUnauthenticated_WritesCorrectResponse(t *testing.T) {
	rec := httptest.NewRecorder()
	Unauthenticated(rec, "missing token")

	if rec.Code != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", rec.Code)
	}

	assertErrorResponse(t, rec, "UNAUTHENTICATED", "missing token")
}

func TestForbidden_WritesCorrectResponse(t *testing.T) {
	rec := httptest.NewRecorder()
	Forbidden(rec, "insufficient permissions")

	if rec.Code != http.StatusForbidden {
		t.Errorf("expected status 403, got %d", rec.Code)
	}

	assertErrorResponse(t, rec, "FORBIDDEN", "insufficient permissions")
}

func TestWriteError_SetsContentType(t *testing.T) {
	rec := httptest.NewRecorder()
	WriteError(rec, CodeUnauthenticated, "test", http.StatusUnauthorized)

	ct := rec.Header().Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("expected Content-Type 'application/json', got '%s'", ct)
	}
}

// Test: FORBIDDEN resolver error has correct GraphQL error extension code
func TestForbiddenError_HasCorrectExtensionCode(t *testing.T) {
	err := ForbiddenError("access denied")

	if err.Message != "access denied" {
		t.Errorf("expected message 'access denied', got '%s'", err.Message)
	}

	code, ok := err.Extensions["code"].(string)
	if !ok {
		t.Fatal("expected 'code' key in extensions")
	}
	if code != "FORBIDDEN" {
		t.Errorf("expected code 'FORBIDDEN', got '%s'", code)
	}
}

// Test: NewError creates error with consistent extension format
func TestNewError_ExtensionCodeFormat(t *testing.T) {
	tests := []struct {
		code    Code
		message string
	}{
		{CodeForbidden, "access denied"},
		{CodeUnauthenticated, "authentication required"},
		{CodeValidationError, "invalid input"},
		{CodeConflict, "already exists"},
		{CodeInternal, "internal error"},
	}

	for _, tc := range tests {
		t.Run(string(tc.code), func(t *testing.T) {
			err := NewError(tc.code, tc.message)
			code, ok := err.Extensions["code"].(string)
			if !ok {
				t.Fatal("expected 'code' in extensions")
			}
			if code != string(tc.code) {
				t.Errorf("expected code '%s', got '%s'", tc.code, code)
			}
			if err.Message != tc.message {
				t.Errorf("expected message '%s', got '%s'", tc.message, err.Message)
			}
		})
	}
}

func assertErrorResponse(t *testing.T, rec *httptest.ResponseRecorder, expectedCode, expectedMsg string) {
	t.Helper()

	var resp struct {
		Errors []struct {
			Message    string                 `json:"message"`
			Extensions map[string]interface{} `json:"extensions"`
		} `json:"errors"`
	}

	if err := json.NewDecoder(rec.Body).Decode(&resp); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}

	if len(resp.Errors) != 1 {
		t.Fatalf("expected 1 error, got %d", len(resp.Errors))
	}

	if resp.Errors[0].Message != expectedMsg {
		t.Errorf("expected message '%s', got '%s'", expectedMsg, resp.Errors[0].Message)
	}

	code, ok := resp.Errors[0].Extensions["code"].(string)
	if !ok || code != expectedCode {
		t.Errorf("expected code '%s', got '%s'", expectedCode, code)
	}
}
