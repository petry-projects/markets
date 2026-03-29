package events

import (
	"testing"
)

func TestManagerAssigned_EventType(t *testing.T) {
	evt := ManagerAssigned{UserID: "mgr-1", MarketID: "market-a"}
	if evt.EventType() != "manager.assigned" {
		t.Errorf("expected 'manager.assigned', got %s", evt.EventType())
	}
}

func TestManagerRemoved_EventType(t *testing.T) {
	evt := ManagerRemoved{UserID: "mgr-1", MarketID: "market-a"}
	if evt.EventType() != "manager.removed" {
		t.Errorf("expected 'manager.removed', got %s", evt.EventType())
	}
}

func TestManagerAssigned_ImplementsEvent(t *testing.T) {
	var _ Event = ManagerAssigned{}
}

func TestManagerRemoved_ImplementsEvent(t *testing.T) {
	var _ Event = ManagerRemoved{}
}
