package integration_test

import (
	"testing"

	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/user"
)

func TestCreateVendorProfile(t *testing.T) {
	server, deps := testServer(t)

	// Seed a vendor user
	vendorUID := "vendor-uid-1"
	deps.UserRepo.Users[vendorUID] = &user.User{
		ID:          domain.UserID(vendorUID),
		FirebaseUID: vendorUID,
		Role:        "vendor",
		Name:        "Test Vendor",
		Email:       "vendor@test.com",
	}

	mutation := `
		mutation CreateVendorProfile($input: CreateVendorProfileInput!) {
			createVendorProfile(input: $input) {
				id
				businessName
			}
		}
	`

	variables := map[string]interface{}{
		"input": map[string]interface{}{
			"businessName": "Fresh Farms LLC",
		},
	}

	resp := graphqlRequest(t, server, mutation, variables, vendorUID, "vendor")
	result := parseResponse(t, resp)

	if len(result.Errors) > 0 {
		t.Fatalf("unexpected errors: %+v", result.Errors)
	}

	createVendor, ok := result.Data["createVendorProfile"].(map[string]interface{})
	if !ok {
		t.Fatal("expected createVendorProfile in response data")
	}

	if name, _ := createVendor["businessName"].(string); name != "Fresh Farms LLC" {
		t.Errorf("expected business name 'Fresh Farms LLC', got %q", name)
	}

	id, _ := createVendor["id"].(string)
	if id == "" {
		t.Error("expected non-empty vendor ID")
	}
}
