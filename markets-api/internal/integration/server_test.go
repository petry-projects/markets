package integration_test

import (
	"io"
	"net/http"
	"testing"
)

func TestHealthCheck(t *testing.T) {
	server, _ := testServer(t)

	resp, err := http.Get(server.URL + "/healthz")
	if err != nil {
		t.Fatalf("GET /healthz: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	body, _ := io.ReadAll(resp.Body)
	expected := `{"status":"ok"}`
	if string(body) != expected {
		t.Errorf("expected body %q, got %q", expected, string(body))
	}

	ct := resp.Header.Get("Content-Type")
	if ct != "application/json" {
		t.Errorf("expected Content-Type application/json, got %q", ct)
	}
}

func TestCORSPreflight(t *testing.T) {
	server, _ := testServer(t)

	req, err := http.NewRequest("OPTIONS", server.URL+"/query", nil)
	if err != nil {
		t.Fatalf("create request: %v", err)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("OPTIONS /query: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	allowOrigin := resp.Header.Get("Access-Control-Allow-Origin")
	if allowOrigin != "*" {
		t.Errorf("expected Access-Control-Allow-Origin *, got %q", allowOrigin)
	}

	allowMethods := resp.Header.Get("Access-Control-Allow-Methods")
	if allowMethods == "" {
		t.Error("expected Access-Control-Allow-Methods to be set")
	}

	allowHeaders := resp.Header.Get("Access-Control-Allow-Headers")
	if allowHeaders == "" {
		t.Error("expected Access-Control-Allow-Headers to be set")
	}
}

func TestUnauthenticatedRequest(t *testing.T) {
	server, _ := testServer(t)

	// Send request without auth headers
	resp := graphqlRequest(t, server, `{ __typename }`, nil, "", "")

	if resp.StatusCode != http.StatusUnauthorized {
		t.Errorf("expected status 401, got %d", resp.StatusCode)
	}

	result := parseResponse(t, resp)
	if len(result.Errors) == 0 {
		t.Fatal("expected errors in response")
	}

	code, _ := result.Errors[0].Extensions["code"].(string)
	if code != "UNAUTHENTICATED" {
		t.Errorf("expected error code UNAUTHENTICATED, got %q", code)
	}
}

func TestAuthenticatedQuery(t *testing.T) {
	server, _ := testServer(t)

	resp := graphqlRequest(t, server, `{ __typename }`, nil, "test-uid-123", "manager")

	if resp.StatusCode != http.StatusOK {
		t.Errorf("expected status 200, got %d", resp.StatusCode)
	}

	result := parseResponse(t, resp)
	if len(result.Errors) > 0 {
		t.Fatalf("unexpected errors: %v", result.Errors)
	}

	typename, ok := result.Data["__typename"].(string)
	if !ok || typename != "Query" {
		t.Errorf("expected __typename to be 'Query', got %v", result.Data["__typename"])
	}
}
