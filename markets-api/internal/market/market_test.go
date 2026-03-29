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
