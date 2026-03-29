package realtime

import (
	"context"
	"testing"
	"time"

	"github.com/petry-projects/markets-api/internal/events"
)

// mockDatabaseClient records calls to Set.
type mockDatabaseClient struct {
	setPath string
	setData interface{}
	err     error
}

func (m *mockDatabaseClient) Set(_ context.Context, path string, data interface{}) error {
	m.setPath = path
	m.setData = data
	return m.err
}

func TestHandler_VendorCheckedInWritesCorrectPath(t *testing.T) {
	db := &mockDatabaseClient{}
	handler := NewHandler(db)

	event := events.VendorCheckedIn{
		VendorID:  "vendor-abc",
		MarketID:  "market-xyz",
		Timestamp: time.Date(2026, 3, 28, 10, 0, 0, 0, time.UTC),
	}

	err := handler.Handle(context.Background(), event)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expectedPath := "/markets/market-xyz/vendors/vendor-abc/status"
	if db.setPath != expectedPath {
		t.Errorf("expected path '%s', got '%s'", expectedPath, db.setPath)
	}

	data, ok := db.setData.(map[string]interface{})
	if !ok {
		t.Fatal("expected data to be map[string]interface{}")
	}
	if data["status"] != "checked_in" {
		t.Errorf("expected status 'checked_in', got '%v'", data["status"])
	}
}

func TestHandler_IrrelevantEventTypesIgnored(t *testing.T) {
	db := &mockDatabaseClient{}
	handler := NewHandler(db)

	event := events.UserCreated{UserID: "u1", Role: "customer"}

	err := handler.Handle(context.Background(), event)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if db.setPath != "" {
		t.Error("expected no database write for irrelevant event")
	}
}
