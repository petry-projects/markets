//go:build integration

package integration_test

import (
	"testing"
	"time"

	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/user"
	"github.com/petry-projects/markets-api/internal/vendor"
)

// ---------------------------------------------------------------------------
// FR10e: Cancel Market — manager cancels a market and it returns CANCELLED status.
// ---------------------------------------------------------------------------

func TestFR10e_CancelMarket(t *testing.T) {
	server, deps := testServer(t)

	managerUID := "mgr-cancel-1"
	deps.UserRepo.Users[managerUID] = &user.User{
		ID:          domain.UserID(managerUID),
		FirebaseUID: managerUID,
		Role:        "manager",
		Name:        "Cancel Manager",
		Email:       "cancel@test.com",
	}

	// Step 1: Create a market so there is something to cancel.
	createMut := `
		mutation CreateMarket($input: CreateMarketInput!) {
			createMarket(input: $input) { id name status }
		}
	`
	createVars := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "Cancellable Market",
			"address":         "100 Cancel Ave",
			"latitude":        40.0,
			"longitude":       -74.0,
			"contactEmail":    "cancel@market.com",
			"recoveryContact": "recovery@cancel.com",
		},
	}

	resp := graphqlRequest(t, server, createMut, createVars, managerUID, "manager")
	createResult := parseResponse(t, resp)
	if len(createResult.Errors) > 0 {
		t.Fatalf("create market errors: %+v", createResult.Errors)
	}
	marketData, _ := createResult.Data["createMarket"].(map[string]interface{})
	marketID, _ := marketData["id"].(string)
	if marketID == "" {
		t.Fatal("expected non-empty market ID from createMarket")
	}

	// Step 2: Cancel the market.
	cancelMut := `
		mutation CancelMarket($marketID: ID!, $reason: CancellationReason!, $message: String) {
			cancelMarket(marketID: $marketID, reason: $reason, message: $message) {
				id
				status
				cancellationReason
				cancellationMessage
				cancelledAt
			}
		}
	`
	cancelVars := map[string]interface{}{
		"marketID": marketID,
		"reason":   "WEATHER",
		"message":  "Severe thunderstorm warning",
	}

	resp = graphqlRequest(t, server, cancelMut, cancelVars, managerUID, "manager")
	cancelResult := parseResponse(t, resp)
	if len(cancelResult.Errors) > 0 {
		t.Fatalf("cancelMarket errors: %+v", cancelResult.Errors)
	}

	cancelled, ok := cancelResult.Data["cancelMarket"].(map[string]interface{})
	if !ok {
		t.Fatal("expected cancelMarket in response data")
	}

	if status, _ := cancelled["status"].(string); status != "CANCELLED" {
		t.Errorf("expected status CANCELLED, got %q", status)
	}
	if reason, _ := cancelled["cancellationReason"].(string); reason != "WEATHER" {
		t.Errorf("expected cancellationReason WEATHER, got %q", reason)
	}
	if msg, _ := cancelled["cancellationMessage"].(string); msg != "Severe thunderstorm warning" {
		t.Errorf("expected cancellationMessage 'Severe thunderstorm warning', got %q", msg)
	}
	if at, _ := cancelled["cancelledAt"].(string); at == "" {
		t.Error("expected cancelledAt to be set")
	}
}

// ---------------------------------------------------------------------------
// FR20a: Manager Check-In on Behalf — manager checks in a vendor.
// ---------------------------------------------------------------------------

func TestFR20a_ManagerCheckInOnBehalf(t *testing.T) {
	server, deps := testServer(t)

	managerUID := "mgr-checkin-1"
	deps.UserRepo.Users[managerUID] = &user.User{
		ID:          domain.UserID(managerUID),
		FirebaseUID: managerUID,
		Role:        "manager",
		Name:        "CheckIn Manager",
		Email:       "checkin-mgr@test.com",
	}

	// Create a market for scope validation.
	createMut := `
		mutation CreateMarket($input: CreateMarketInput!) {
			createMarket(input: $input) { id }
		}
	`
	createVars := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "CheckIn Market",
			"address":         "200 CheckIn St",
			"latitude":        41.0,
			"longitude":       -75.0,
			"contactEmail":    "checkin@market.com",
			"recoveryContact": "recovery@checkin.com",
		},
	}
	resp := graphqlRequest(t, server, createMut, createVars, managerUID, "manager")
	createResult := parseResponse(t, resp)
	if len(createResult.Errors) > 0 {
		t.Fatalf("create market errors: %+v", createResult.Errors)
	}
	marketData, _ := createResult.Data["createMarket"].(map[string]interface{})
	marketID, _ := marketData["id"].(string)

	// Seed a vendor in the mock repo so the resolver can look it up.
	vendorID := domain.VendorID("vendor-checkin-1")
	deps.VendorRepo.Vendors[vendorID] = &vendor.VendorRecord{
		ID:           vendorID,
		UserID:       domain.UserID("vendor-user-1"),
		BusinessName: "Test Vendor Biz",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	// Manager checks in vendor on their behalf (Story 5.3).
	checkInMut := `
		mutation CheckIn($input: CheckInInput!) {
			checkIn(input: $input) {
				id
				vendorID
				marketID
				status
				checkedInAt
			}
		}
	`
	checkInVars := map[string]interface{}{
		"input": map[string]interface{}{
			"marketID": marketID,
			"vendorID": string(vendorID),
		},
	}

	resp = graphqlRequest(t, server, checkInMut, checkInVars, managerUID, "manager")
	ciResult := parseResponse(t, resp)
	if len(ciResult.Errors) > 0 {
		t.Fatalf("checkIn errors: %+v", ciResult.Errors)
	}

	checkIn, ok := ciResult.Data["checkIn"].(map[string]interface{})
	if !ok {
		t.Fatal("expected checkIn in response data")
	}

	if ciVendorID, _ := checkIn["vendorID"].(string); ciVendorID != string(vendorID) {
		t.Errorf("expected vendorID %q, got %q", vendorID, ciVendorID)
	}
	if ciMarketID, _ := checkIn["marketID"].(string); ciMarketID != marketID {
		t.Errorf("expected marketID %q, got %q", marketID, ciMarketID)
	}
	if status, _ := checkIn["status"].(string); status != "CHECKED_IN" {
		t.Errorf("expected status CHECKED_IN, got %q", status)
	}
	if ciID, _ := checkIn["id"].(string); ciID == "" {
		t.Error("expected non-empty check-in ID")
	}
}

// ---------------------------------------------------------------------------
// FR20c: Auto-Checkout — batch auto-checkout of all checked-in vendors.
// ---------------------------------------------------------------------------

func TestFR20c_AutoCheckoutVendors(t *testing.T) {
	server, deps := testServer(t)

	managerUID := "mgr-autocheckout-1"
	deps.UserRepo.Users[managerUID] = &user.User{
		ID:          domain.UserID(managerUID),
		FirebaseUID: managerUID,
		Role:        "manager",
		Name:        "AutoCheckout Manager",
		Email:       "autocheckout@test.com",
	}

	// Create a market.
	createMut := `
		mutation CreateMarket($input: CreateMarketInput!) {
			createMarket(input: $input) { id }
		}
	`
	createVars := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "Auto-Checkout Market",
			"address":         "300 Checkout Blvd",
			"latitude":        42.0,
			"longitude":       -76.0,
			"contactEmail":    "checkout@market.com",
			"recoveryContact": "recovery@checkout.com",
		},
	}
	resp := graphqlRequest(t, server, createMut, createVars, managerUID, "manager")
	createResult := parseResponse(t, resp)
	if len(createResult.Errors) > 0 {
		t.Fatalf("create market errors: %+v", createResult.Errors)
	}
	marketData, _ := createResult.Data["createMarket"].(map[string]interface{})
	marketID, _ := marketData["id"].(string)

	// Seed two checked-in vendors directly in the mock repo.
	v1 := domain.VendorID("vendor-ac-1")
	v2 := domain.VendorID("vendor-ac-2")
	deps.VendorRepo.Vendors[v1] = &vendor.VendorRecord{
		ID: v1, UserID: domain.UserID("vu-1"), BusinessName: "V1", CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}
	deps.VendorRepo.Vendors[v2] = &vendor.VendorRecord{
		ID: v2, UserID: domain.UserID("vu-2"), BusinessName: "V2", CreatedAt: time.Now(), UpdatedAt: time.Now(),
	}

	ci1 := &vendor.CheckInRecord{
		ID: domain.CheckInID("ci-ac-1"), VendorID: v1, MarketID: domain.MarketID(marketID),
		Status: vendor.StatusCheckedIn, CheckedInAt: time.Now().Add(-2 * time.Hour),
	}
	ci2 := &vendor.CheckInRecord{
		ID: domain.CheckInID("ci-ac-2"), VendorID: v2, MarketID: domain.MarketID(marketID),
		Status: vendor.StatusCheckedIn, CheckedInAt: time.Now().Add(-1 * time.Hour),
	}
	deps.VendorRepo.CheckIns[ci1.ID] = ci1
	deps.VendorRepo.CheckIns[ci2.ID] = ci2

	// Call autoCheckoutMarket.
	autoCheckoutMut := `
		mutation AutoCheckoutMarket($marketID: ID!) {
			autoCheckoutMarket(marketID: $marketID)
		}
	`
	autoVars := map[string]interface{}{
		"marketID": marketID,
	}

	resp = graphqlRequest(t, server, autoCheckoutMut, autoVars, managerUID, "manager")
	acResult := parseResponse(t, resp)
	if len(acResult.Errors) > 0 {
		t.Fatalf("autoCheckoutMarket errors: %+v", acResult.Errors)
	}

	// The mutation returns an Int! with the count of checked-out vendors.
	countRaw, ok := acResult.Data["autoCheckoutMarket"]
	if !ok {
		t.Fatal("expected autoCheckoutMarket in response data")
	}
	count, ok := countRaw.(float64) // JSON numbers are float64
	if !ok {
		t.Fatalf("expected numeric count, got %T: %v", countRaw, countRaw)
	}
	if int(count) != 2 {
		t.Errorf("expected 2 vendors auto-checked-out, got %d", int(count))
	}

	// Verify the check-in records were updated in the mock repo.
	if ci1.Status != vendor.StatusCheckedOut {
		t.Errorf("expected ci1 status CHECKED_OUT, got %q", ci1.Status)
	}
	if ci2.Status != vendor.StatusCheckedOut {
		t.Errorf("expected ci2 status CHECKED_OUT, got %q", ci2.Status)
	}
	if ci1.CheckedOutAt == nil {
		t.Error("expected ci1 CheckedOutAt to be set")
	}
	if ci2.CheckedOutAt == nil {
		t.Error("expected ci2 CheckedOutAt to be set")
	}
}

// ---------------------------------------------------------------------------
// FR40/41: Account Deletion (Soft-Delete) — deleteAccount requires DB pool.
// Because the test server uses nil for the DB pool (mock-only),
// we verify the auth guard rejects manager role and allows vendor/customer.
// The actual soft-delete logic requires a real DB integration test.
// ---------------------------------------------------------------------------

func TestFR40_DeleteAccount_ManagerForbidden(t *testing.T) {
	server, deps := testServer(t)

	managerUID := "mgr-delete-1"
	deps.UserRepo.Users[managerUID] = &user.User{
		ID:          domain.UserID(managerUID),
		FirebaseUID: managerUID,
		Role:        "manager",
		Name:        "Delete Manager",
		Email:       "del-mgr@test.com",
	}

	deleteMut := `
		mutation { deleteAccount }
	`

	resp := graphqlRequest(t, server, deleteMut, nil, managerUID, "manager")
	result := parseResponse(t, resp)

	// Manager role should be rejected by auth.RequireRole(ctx, "customer", "vendor").
	if len(result.Errors) == 0 {
		t.Fatal("expected error for manager calling deleteAccount")
	}

	errMsg := result.Errors[0].Message
	code, _ := result.Errors[0].Extensions["code"].(string)
	if code != "FORBIDDEN" {
		t.Errorf("expected FORBIDDEN error code, got %q (message: %s)", code, errMsg)
	}
}

func TestFR40_DeleteAccount_VendorHitsDBLayer(t *testing.T) {
	// Verify vendor can pass auth but fails at DB layer (Pool is nil).
	// This confirms the auth guard allows vendor role through.
	server, deps := testServer(t)

	vendorUID := "vendor-delete-1"
	deps.UserRepo.Users[vendorUID] = &user.User{
		ID:          domain.UserID(vendorUID),
		FirebaseUID: vendorUID,
		Role:        "vendor",
		Name:        "Delete Vendor",
		Email:       "del-vendor@test.com",
	}

	deleteMut := `
		mutation { deleteAccount }
	`

	resp := graphqlRequest(t, server, deleteMut, nil, vendorUID, "vendor")
	result := parseResponse(t, resp)

	// Should get an internal error (nil pool), not a FORBIDDEN error.
	if len(result.Errors) == 0 {
		t.Fatal("expected error due to nil DB pool")
	}

	code, _ := result.Errors[0].Extensions["code"].(string)
	if code == "FORBIDDEN" {
		t.Error("vendor should pass auth check; got FORBIDDEN instead of INTERNAL")
	}
}

// ---------------------------------------------------------------------------
// FR41a: 2-Manager Minimum — removing a manager fails when it would leave
// fewer than 2 managers.
// ---------------------------------------------------------------------------

func TestFR41a_RemoveManager_MinimumTwoManagers(t *testing.T) {
	server, deps := testServer(t)

	// Seed the calling manager.
	callerUID := "mgr-rm-caller"
	deps.UserRepo.Users[callerUID] = &user.User{
		ID:          domain.UserID(callerUID),
		FirebaseUID: callerUID,
		Role:        "manager",
		Name:        "Caller Manager",
		Email:       "caller@test.com",
	}

	// Create a market (this assigns callerUID as the first manager).
	createMut := `
		mutation CreateMarket($input: CreateMarketInput!) {
			createMarket(input: $input) { id }
		}
	`
	createVars := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "Min-Manager Market",
			"address":         "500 Manager Way",
			"latitude":        43.0,
			"longitude":       -77.0,
			"contactEmail":    "min-mgr@market.com",
			"recoveryContact": "recovery@min-mgr.com",
		},
	}
	resp := graphqlRequest(t, server, createMut, createVars, callerUID, "manager")
	createResult := parseResponse(t, resp)
	if len(createResult.Errors) > 0 {
		t.Fatalf("create market errors: %+v", createResult.Errors)
	}
	marketData, _ := createResult.Data["createMarket"].(map[string]interface{})
	marketID, _ := marketData["id"].(string)

	// Assign a second manager so we have exactly 2.
	secondMgrUID := "mgr-rm-second"
	deps.UserRepo.Users[secondMgrUID] = &user.User{
		ID:          domain.UserID(secondMgrUID),
		FirebaseUID: secondMgrUID,
		Role:        "manager",
		Name:        "Second Manager",
		Email:       "second@test.com",
	}

	assignMut := `
		mutation AssignManager($managerID: ID!, $marketID: ID!) {
			assignManager(managerID: $managerID, marketID: $marketID)
		}
	`
	assignVars := map[string]interface{}{
		"managerID": secondMgrUID,
		"marketID":  marketID,
	}
	resp = graphqlRequest(t, server, assignMut, assignVars, callerUID, "manager")
	assignResult := parseResponse(t, resp)
	if len(assignResult.Errors) > 0 {
		t.Fatalf("assignManager errors: %+v", assignResult.Errors)
	}

	// Now try to remove one manager — should fail because it leaves only 1.
	removeMut := `
		mutation RemoveManager($managerID: ID!, $marketID: ID!) {
			removeManager(managerID: $managerID, marketID: $marketID)
		}
	`
	removeVars := map[string]interface{}{
		"managerID": secondMgrUID,
		"marketID":  marketID,
	}
	resp = graphqlRequest(t, server, removeMut, removeVars, callerUID, "manager")
	removeResult := parseResponse(t, resp)

	if len(removeResult.Errors) == 0 {
		t.Fatal("expected error when removing manager would leave fewer than 2")
	}

	errMsg := removeResult.Errors[0].Message
	if errMsg != "Market requires minimum 2 managers" {
		t.Errorf("expected 'Market requires minimum 2 managers' error, got %q", errMsg)
	}
}

func TestFR41a_RemoveManager_ThreeManagers_Succeeds(t *testing.T) {
	server, deps := testServer(t)

	callerUID := "mgr-rm3-caller"
	deps.UserRepo.Users[callerUID] = &user.User{
		ID:          domain.UserID(callerUID),
		FirebaseUID: callerUID,
		Role:        "manager",
		Name:        "Caller Manager 3",
		Email:       "caller3@test.com",
	}

	// Create market (assigns callerUID as manager #1).
	createMut := `
		mutation CreateMarket($input: CreateMarketInput!) {
			createMarket(input: $input) { id }
		}
	`
	createVars := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "Three-Manager Market",
			"address":         "600 Three Way",
			"latitude":        44.0,
			"longitude":       -78.0,
			"contactEmail":    "three@market.com",
			"recoveryContact": "recovery@three.com",
		},
	}
	resp := graphqlRequest(t, server, createMut, createVars, callerUID, "manager")
	createResult := parseResponse(t, resp)
	if len(createResult.Errors) > 0 {
		t.Fatalf("create market errors: %+v", createResult.Errors)
	}
	marketData, _ := createResult.Data["createMarket"].(map[string]interface{})
	marketID, _ := marketData["id"].(string)

	// Assign manager #2 and #3.
	assignMut := `
		mutation AssignManager($managerID: ID!, $marketID: ID!) {
			assignManager(managerID: $managerID, marketID: $marketID)
		}
	`
	for _, uid := range []string{"mgr-rm3-second", "mgr-rm3-third"} {
		deps.UserRepo.Users[uid] = &user.User{
			ID:          domain.UserID(uid),
			FirebaseUID: uid,
			Role:        "manager",
			Name:        "Manager " + uid,
			Email:       uid + "@test.com",
		}
		assignVars := map[string]interface{}{
			"managerID": uid,
			"marketID":  marketID,
		}
		resp = graphqlRequest(t, server, assignMut, assignVars, callerUID, "manager")
		assignResult := parseResponse(t, resp)
		if len(assignResult.Errors) > 0 {
			t.Fatalf("assignManager(%s) errors: %+v", uid, assignResult.Errors)
		}
	}

	// Remove one manager — should succeed (3 -> 2).
	removeMut := `
		mutation RemoveManager($managerID: ID!, $marketID: ID!) {
			removeManager(managerID: $managerID, marketID: $marketID)
		}
	`
	removeVars := map[string]interface{}{
		"managerID": "mgr-rm3-third",
		"marketID":  marketID,
	}
	resp = graphqlRequest(t, server, removeMut, removeVars, callerUID, "manager")
	removeResult := parseResponse(t, resp)

	if len(removeResult.Errors) > 0 {
		t.Fatalf("expected removeManager to succeed with 3 managers, got errors: %+v", removeResult.Errors)
	}

	removed, ok := removeResult.Data["removeManager"].(bool)
	if !ok || !removed {
		t.Error("expected removeManager to return true")
	}
}

// ---------------------------------------------------------------------------
// FR30: Status Change Notification — publishMarketUpdate creates an update
// and does not error.
// ---------------------------------------------------------------------------

func TestFR30_PublishMarketUpdate(t *testing.T) {
	server, deps := testServer(t)

	managerUID := "mgr-update-1"
	deps.UserRepo.Users[managerUID] = &user.User{
		ID:          domain.UserID(managerUID),
		FirebaseUID: managerUID,
		Role:        "manager",
		Name:        "Update Manager",
		Email:       "update@test.com",
	}

	// Create a market.
	createMut := `
		mutation CreateMarket($input: CreateMarketInput!) {
			createMarket(input: $input) { id }
		}
	`
	createVars := map[string]interface{}{
		"input": map[string]interface{}{
			"name":            "Update Market",
			"address":         "700 Update Ln",
			"latitude":        45.0,
			"longitude":       -79.0,
			"contactEmail":    "update@market.com",
			"recoveryContact": "recovery@update.com",
		},
	}
	resp := graphqlRequest(t, server, createMut, createVars, managerUID, "manager")
	createResult := parseResponse(t, resp)
	if len(createResult.Errors) > 0 {
		t.Fatalf("create market errors: %+v", createResult.Errors)
	}
	marketData, _ := createResult.Data["createMarket"].(map[string]interface{})
	marketID, _ := marketData["id"].(string)

	// Publish a market update.
	publishMut := `
		mutation PublishMarketUpdate($marketID: ID!, $message: String!) {
			publishMarketUpdate(marketID: $marketID, message: $message) {
				id
				marketID
				senderID
				message
				createdAt
			}
		}
	`
	publishVars := map[string]interface{}{
		"marketID": marketID,
		"message":  "Market layout changed — stalls moved to east side.",
	}

	resp = graphqlRequest(t, server, publishMut, publishVars, managerUID, "manager")
	pubResult := parseResponse(t, resp)
	if len(pubResult.Errors) > 0 {
		t.Fatalf("publishMarketUpdate errors: %+v", pubResult.Errors)
	}

	update, ok := pubResult.Data["publishMarketUpdate"].(map[string]interface{})
	if !ok {
		t.Fatal("expected publishMarketUpdate in response data")
	}

	if id, _ := update["id"].(string); id == "" {
		t.Error("expected non-empty update ID")
	}
	if mid, _ := update["marketID"].(string); mid != marketID {
		t.Errorf("expected marketID %q, got %q", marketID, mid)
	}
	if sid, _ := update["senderID"].(string); sid != managerUID {
		t.Errorf("expected senderID %q, got %q", managerUID, sid)
	}
	if msg, _ := update["message"].(string); msg != "Market layout changed — stalls moved to east side." {
		t.Errorf("expected message to match, got %q", msg)
	}
	if ca, _ := update["createdAt"].(string); ca == "" {
		t.Error("expected createdAt to be set")
	}

	// Verify the update is persisted in the mock repo.
	if len(deps.MarketRepo.Updates) != 1 {
		t.Fatalf("expected 1 stored update, got %d", len(deps.MarketRepo.Updates))
	}
	if deps.MarketRepo.Updates[0].Message != "Market layout changed — stalls moved to east side." {
		t.Errorf("stored update message mismatch: %q", deps.MarketRepo.Updates[0].Message)
	}
}
