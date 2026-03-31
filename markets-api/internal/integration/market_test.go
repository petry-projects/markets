package integration_test

import (
	"testing"

	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/user"
)

func TestCreateMarket(t *testing.T) {
	server, deps := testServer(t)

	// Seed a manager user so the resolver can look them up
	managerUID := "manager-uid-1"
	deps.UserRepo.Users[managerUID] = &user.User{
		ID:          domain.UserID(managerUID),
		FirebaseUID: managerUID,
		Role:        "manager",
		Name:        "Test Manager",
		Email:       "manager@test.com",
	}

	mutation := `
		mutation CreateMarket($input: CreateMarketInput!) {
			createMarket(input: $input) {
				id
				name
				address
				contactEmail
				status
			}
		}
	`

	variables := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "Downtown Farmers Market",
			"address":         "123 Main St",
			"latitude":        40.7128,
			"longitude":       -74.006,
			"contactEmail":    "market@test.com",
			"recoveryContact": "recovery@test.com",
		},
	}

	resp := graphqlRequest(t, server, mutation, variables, managerUID, "manager")
	result := parseResponse(t, resp)

	if len(result.Errors) > 0 {
		t.Fatalf("unexpected errors: %+v", result.Errors)
	}

	createMarket, ok := result.Data["createMarket"].(map[string]interface{})
	if !ok {
		t.Fatal("expected createMarket in response data")
	}

	if name, _ := createMarket["name"].(string); name != "Downtown Farmers Market" {
		t.Errorf("expected market name 'Downtown Farmers Market', got %q", name)
	}

	if status, _ := createMarket["status"].(string); status != "ACTIVE" {
		t.Errorf("expected market status 'ACTIVE', got %q", status)
	}

	id, _ := createMarket["id"].(string)
	if id == "" {
		t.Error("expected non-empty market ID")
	}
}

func TestMyMarkets(t *testing.T) {
	server, deps := testServer(t)

	// Seed a manager user
	managerUID := "manager-uid-2"
	deps.UserRepo.Users[managerUID] = &user.User{
		ID:          domain.UserID(managerUID),
		FirebaseUID: managerUID,
		Role:        "manager",
		Name:        "Test Manager 2",
		Email:       "manager2@test.com",
	}

	// First create a market
	createMutation := `
		mutation CreateMarket($input: CreateMarketInput!) {
			createMarket(input: $input) {
				id
				name
			}
		}
	`
	variables := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "Test Market",
			"address":         "456 Oak Ave",
			"latitude":        41.8781,
			"longitude":       -87.6298,
			"contactEmail":    "market2@test.com",
			"recoveryContact": "recovery2@test.com",
		},
	}

	resp := graphqlRequest(t, server, createMutation, variables, managerUID, "manager")
	createResult := parseResponse(t, resp)
	if len(createResult.Errors) > 0 {
		t.Fatalf("create market errors: %+v", createResult.Errors)
	}

	// Now query myMarkets
	query := `
		query {
			myMarkets {
				id
				name
			}
		}
	`

	resp = graphqlRequest(t, server, query, nil, managerUID, "manager")
	result := parseResponse(t, resp)

	if len(result.Errors) > 0 {
		t.Fatalf("myMarkets errors: %+v", result.Errors)
	}

	myMarkets, ok := result.Data["myMarkets"].([]interface{})
	if !ok {
		t.Fatal("expected myMarkets array in response data")
	}

	if len(myMarkets) != 1 {
		t.Fatalf("expected 1 market, got %d", len(myMarkets))
	}

	m, _ := myMarkets[0].(map[string]interface{})
	if name, _ := m["name"].(string); name != "Test Market" {
		t.Errorf("expected market name 'Test Market', got %q", name)
	}
}
