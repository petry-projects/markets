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
