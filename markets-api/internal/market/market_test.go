package market

import (
	"errors"
	"testing"

	"github.com/petry-projects/markets-api/internal/domain"
)

func TestRemoveManager_BelowMinimum(t *testing.T) {
	m := &Market{
		ID: domain.MarketID("market-1"),
		Managers: []ManagerAssignment{
			{ManagerID: domain.UserID("mgr-1")},
			{ManagerID: domain.UserID("mgr-2")},
		},
	}

	err := m.RemoveManager(domain.UserID("mgr-1"))
	if err == nil {
		t.Fatal("expected error when removing manager would leave fewer than 2")
	}
	if !errors.Is(err, ErrMinimumManagersRequired) {
		t.Errorf("expected ErrMinimumManagersRequired, got: %v", err)
	}
	// Managers should remain unchanged
	if len(m.Managers) != 2 {
		t.Errorf("expected 2 managers to remain, got %d", len(m.Managers))
	}
}

func TestRemoveManager_ThreeManagers_Success(t *testing.T) {
	m := &Market{
		ID: domain.MarketID("market-1"),
		Managers: []ManagerAssignment{
			{ManagerID: domain.UserID("mgr-1")},
			{ManagerID: domain.UserID("mgr-2")},
			{ManagerID: domain.UserID("mgr-3")},
		},
	}

	err := m.RemoveManager(domain.UserID("mgr-2"))
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(m.Managers) != 2 {
		t.Fatalf("expected 2 managers after removal, got %d", len(m.Managers))
	}

	// Verify the correct manager was removed
	for _, ma := range m.Managers {
		if ma.ManagerID == domain.UserID("mgr-2") {
			t.Error("mgr-2 should have been removed")
		}
	}
}

func TestRemoveManager_NotAssigned(t *testing.T) {
	m := &Market{
		ID: domain.MarketID("market-1"),
		Managers: []ManagerAssignment{
			{ManagerID: domain.UserID("mgr-1")},
			{ManagerID: domain.UserID("mgr-2")},
			{ManagerID: domain.UserID("mgr-3")},
		},
	}

	err := m.RemoveManager(domain.UserID("mgr-999"))
	if err == nil {
		t.Fatal("expected error for unassigned manager")
	}
	if !errors.Is(err, ErrManagerNotAssigned) {
		t.Errorf("expected ErrManagerNotAssigned, got: %v", err)
	}
}

// --- NewMarket tests ---

func TestNewMarket_Success(t *testing.T) {
	m, err := NewMarket(NewMarketParams{
		Name:         "Riverside Farmers Market",
		Address:      "123 River St",
		Latitude:     40.7128,
		Longitude:    -74.0060,
		ContactEmail: "info@riverside.com",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if m.Name != "Riverside Farmers Market" {
		t.Errorf("expected name Riverside Farmers Market, got %s", m.Name)
	}
	if m.ContactEmail != "info@riverside.com" {
		t.Errorf("expected email info@riverside.com, got %s", m.ContactEmail)
	}
}

func TestNewMarket_EmptyName(t *testing.T) {
	_, err := NewMarket(NewMarketParams{
		Name:         "",
		Address:      "123 River St",
		Latitude:     40.7128,
		Longitude:    -74.0060,
		ContactEmail: "info@riverside.com",
	})
	if !errors.Is(err, ErrInvalidMarketName) {
		t.Errorf("expected ErrInvalidMarketName, got: %v", err)
	}
}

func TestNewMarket_EmptyAddress(t *testing.T) {
	_, err := NewMarket(NewMarketParams{
		Name:         "Test Market",
		Address:      "",
		Latitude:     40.7128,
		Longitude:    -74.0060,
		ContactEmail: "info@test.com",
	})
	if !errors.Is(err, ErrInvalidAddress) {
		t.Errorf("expected ErrInvalidAddress, got: %v", err)
	}
}

func TestNewMarket_InvalidCoordinates(t *testing.T) {
	tests := []struct {
		name string
		lat  float64
		lng  float64
	}{
		{"latitude too high", 91.0, 0},
		{"latitude too low", -91.0, 0},
		{"longitude too high", 0, 181.0},
		{"longitude too low", 0, -181.0},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := NewMarket(NewMarketParams{
				Name:         "Test",
				Address:      "123 St",
				Latitude:     tt.lat,
				Longitude:    tt.lng,
				ContactEmail: "a@b.com",
			})
			if !errors.Is(err, ErrInvalidCoordinates) {
				t.Errorf("expected ErrInvalidCoordinates, got: %v", err)
			}
		})
	}
}

func TestNewMarket_InvalidEmail(t *testing.T) {
	_, err := NewMarket(NewMarketParams{
		Name:         "Test",
		Address:      "123 St",
		Latitude:     40.0,
		Longitude:    -74.0,
		ContactEmail: "not-an-email",
	})
	if !errors.Is(err, ErrInvalidContactEmail) {
		t.Errorf("expected ErrInvalidContactEmail, got: %v", err)
	}
}

func TestNewMarket_WithSocialLinks(t *testing.T) {
	m, err := NewMarket(NewMarketParams{
		Name:         "Test",
		Address:      "123 St",
		Latitude:     40.0,
		Longitude:    -74.0,
		ContactEmail: "a@b.com",
		SocialLinks: SocialLinks{
			Instagram: "@testmarket",
			Website:   "https://test.com",
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if m.SocialLinks.Instagram != "@testmarket" {
		t.Errorf("expected instagram @testmarket, got %s", m.SocialLinks.Instagram)
	}
}

// --- Update tests ---

func TestUpdate_PartialFields(t *testing.T) {
	m := &MarketRecord{
		Name:         "Original",
		Address:      "Old St",
		Latitude:     40.0,
		Longitude:    -74.0,
		ContactEmail: "a@b.com",
	}

	newName := "Updated Name"
	err := m.Update(UpdateParams{Name: &newName})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if m.Name != "Updated Name" {
		t.Errorf("expected Updated Name, got %s", m.Name)
	}
	if m.Address != "Old St" {
		t.Errorf("expected unchanged address Old St, got %s", m.Address)
	}
}

func TestUpdate_InvalidEmptyName(t *testing.T) {
	m := &MarketRecord{Name: "Original", Address: "St", Latitude: 40, Longitude: -74, ContactEmail: "a@b.com"}
	empty := ""
	err := m.Update(UpdateParams{Name: &empty})
	if !errors.Is(err, ErrInvalidMarketName) {
		t.Errorf("expected ErrInvalidMarketName, got: %v", err)
	}
}

func TestUpdate_InvalidCoordinates(t *testing.T) {
	m := &MarketRecord{Name: "Test", Address: "St", Latitude: 40, Longitude: -74, ContactEmail: "a@b.com"}
	badLat := 100.0
	err := m.Update(UpdateParams{Latitude: &badLat})
	if !errors.Is(err, ErrInvalidCoordinates) {
		t.Errorf("expected ErrInvalidCoordinates, got: %v", err)
	}
}

func TestUpdate_InvalidEmail(t *testing.T) {
	m := &MarketRecord{Name: "Test", Address: "St", Latitude: 40, Longitude: -74, ContactEmail: "a@b.com"}
	bad := "not-email"
	err := m.Update(UpdateParams{ContactEmail: &bad})
	if !errors.Is(err, ErrInvalidContactEmail) {
		t.Errorf("expected ErrInvalidContactEmail, got: %v", err)
	}
}

// --- RemoveManager tests ---

func TestRemoveManager_ExactlyTwoManagers_Rejected(t *testing.T) {
	// Specifically tests AC: "Given an attempt to reduce a market below 2 managers"
	m := &Market{
		ID: domain.MarketID("market-1"),
		Managers: []ManagerAssignment{
			{ManagerID: domain.UserID("mgr-1")},
			{ManagerID: domain.UserID("mgr-2")},
		},
	}

	err := m.RemoveManager(domain.UserID("mgr-1"))
	if !errors.Is(err, ErrMinimumManagersRequired) {
		t.Errorf("expected ErrMinimumManagersRequired, got: %v", err)
	}
}
