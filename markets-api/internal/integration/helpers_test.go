package integration_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/handler/extension"
	"github.com/99designs/gqlgen/graphql/handler/transport"
	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/events"
	"github.com/petry-projects/markets-api/internal/graph"
	"github.com/petry-projects/markets-api/internal/graph/generated"
	"github.com/petry-projects/markets-api/internal/middleware"
	"github.com/petry-projects/markets-api/internal/testutil"
)

// testDeps holds the mocks used by a test server.
type testDeps struct {
	UserRepo     *testutil.MockUserRepo
	MarketRepo   *testutil.MockMarketRepo
	VendorRepo   *testutil.MockVendorRepo
	CustomerRepo *testutil.MockCustomerRepo
	NotifyRepo   *testutil.MockNotifyRepo
	ClaimsSetter *testutil.MockClaimsSetter
	EventBus     *events.Bus
}

// testServer creates an httptest.Server with real gqlgen wired to mock repos.
// It uses a test auth middleware that reads X-Test-UID, X-Test-Role, X-Test-Email headers.
func testServer(t *testing.T) (*httptest.Server, *testDeps) {
	t.Helper()

	deps := &testDeps{
		UserRepo:     testutil.NewMockUserRepo(),
		MarketRepo:   testutil.NewMockMarketRepo(),
		VendorRepo:   testutil.NewMockVendorRepo(),
		CustomerRepo: testutil.NewMockCustomerRepo(),
		NotifyRepo:   testutil.NewMockNotifyRepo(),
		ClaimsSetter: testutil.NewMockClaimsSetter(),
		EventBus:     events.NewBus(),
	}

	resolver := graph.NewFullResolver(
		nil, // no real DB pool needed for mock tests
		deps.EventBus,
		deps.UserRepo,
		deps.ClaimsSetter,
		deps.MarketRepo,
		deps.VendorRepo,
		deps.CustomerRepo,
		deps.NotifyRepo,
		nil, // no audit querier needed for mock tests
	)

	schema := generated.NewExecutableSchema(generated.Config{
		Resolvers: resolver,
	})

	gqlHandler := handler.New(schema)
	gqlHandler.AddTransport(transport.Options{})
	gqlHandler.AddTransport(transport.POST{})
	gqlHandler.Use(extension.Introspection{})

	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	// GraphQL endpoint with test auth middleware
	testAuthMW := testAuthMiddleware()
	gqlWithMiddleware := middleware.CORS(middleware.RequestLogger(testAuthMW(gqlHandler)))
	mux.Handle("POST /query", gqlWithMiddleware)

	// OPTIONS for CORS preflight
	mux.HandleFunc("OPTIONS /query", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.WriteHeader(http.StatusOK)
	})

	server := httptest.NewServer(mux)
	t.Cleanup(server.Close)

	return server, deps
}

// testAuthMiddleware creates an HTTP middleware that reads X-Test-UID, X-Test-Role,
// and X-Test-Email headers instead of verifying Firebase JWTs.
// If X-Test-UID is missing, it returns an UNAUTHENTICATED error.
func testAuthMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			uid := r.Header.Get("X-Test-UID")
			if uid == "" {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusUnauthorized)
				_, _ = w.Write([]byte(`{"errors":[{"message":"missing authorization","extensions":{"code":"UNAUTHENTICATED"}}]}`))
				return
			}

			role := r.Header.Get("X-Test-Role")
			email := r.Header.Get("X-Test-Email")

			ctx := auth.WithUser(r.Context(), uid, role)
			ctx = auth.WithEmail(ctx, email)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// graphqlRequest sends a GraphQL query to the test server.
func graphqlRequest(t *testing.T, server *httptest.Server, query string, variables map[string]interface{}, uid, role string) *http.Response {
	t.Helper()

	body := map[string]interface{}{
		"query": query,
	}
	if variables != nil {
		body["variables"] = variables
	}

	jsonBody, err := json.Marshal(body)
	if err != nil {
		t.Fatalf("marshal request body: %v", err)
	}

	req, err := http.NewRequest("POST", server.URL+"/query", bytes.NewReader(jsonBody))
	if err != nil {
		t.Fatalf("create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	if uid != "" {
		req.Header.Set("X-Test-UID", uid)
	}
	if role != "" {
		req.Header.Set("X-Test-Role", role)
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatalf("send request: %v", err)
	}

	return resp
}

// graphqlResponse represents a parsed GraphQL response.
type graphqlResponse struct {
	Data   map[string]interface{} `json:"data"`
	Errors []struct {
		Message    string                 `json:"message"`
		Extensions map[string]interface{} `json:"extensions"`
	} `json:"errors"`
}

// parseResponse reads and parses the HTTP response body as a GraphQL response.
func parseResponse(t *testing.T, resp *http.Response) graphqlResponse {
	t.Helper()

	defer resp.Body.Close()
	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read response body: %v", err)
	}

	var result graphqlResponse
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		t.Fatalf("unmarshal response: %v\nbody: %s", err, string(bodyBytes))
	}

	return result
}
