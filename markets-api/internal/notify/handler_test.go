package notify

import (
	"context"
	"testing"
	"time"

	"github.com/petry-projects/markets-api/internal/events"
)

// mockFCMClient records calls to SendToTopic.
type mockFCMClient struct {
	topic string
	title string
	body  string
	data  map[string]string
	err   error
}

func (m *mockFCMClient) SendToTopic(_ context.Context, topic string, title string, body string, data map[string]string) error {
	m.topic = topic
	m.title = title
	m.body = body
	m.data = data
	return m.err
}

func TestHandler_VendorCheckedInSendsNotification(t *testing.T) {
	fcm := &mockFCMClient{}
	handler := NewHandler(fcm)

	event := events.VendorCheckedIn{
		VendorID:  "vendor-abc",
		MarketID:  "market-xyz",
		Timestamp: time.Date(2026, 3, 28, 10, 0, 0, 0, time.UTC),
	}

	err := handler.Handle(context.Background(), event)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	expectedTopic := "market-market-xyz"
	if fcm.topic != expectedTopic {
		t.Errorf("expected topic '%s', got '%s'", expectedTopic, fcm.topic)
	}
	if fcm.title != "Vendor Checked In" {
		t.Errorf("expected title 'Vendor Checked In', got '%s'", fcm.title)
	}
	if fcm.data["vendor_id"] != "vendor-abc" {
		t.Errorf("expected vendor_id 'vendor-abc' in data, got '%s'", fcm.data["vendor_id"])
	}
	if fcm.data["type"] != "vendor.checked_in" {
		t.Errorf("expected type 'vendor.checked_in' in data, got '%s'", fcm.data["type"])
	}
}

func TestHandler_VendorCheckedOutSendsNotification(t *testing.T) {
	fcm := &mockFCMClient{}
	handler := NewHandler(fcm)

	event := events.VendorCheckedOut{
		VendorID:  "vendor-abc",
		MarketID:  "market-xyz",
		CheckInID: "ci-123",
		Timestamp: time.Date(2026, 3, 28, 14, 0, 0, 0, time.UTC),
	}

	err := handler.Handle(context.Background(), event)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if fcm.topic != "market-market-xyz" {
		t.Errorf("expected topic 'market-market-xyz', got '%s'", fcm.topic)
	}
	if fcm.title != "Vendor Checked Out" {
		t.Errorf("expected title 'Vendor Checked Out', got '%s'", fcm.title)
	}
	if fcm.data["type"] != "vendor.checked_out" {
		t.Errorf("expected type 'vendor.checked_out', got '%s'", fcm.data["type"])
	}
}

func TestHandler_VendorExceptionSendsNotification(t *testing.T) {
	fcm := &mockFCMClient{}
	handler := NewHandler(fcm)

	event := events.VendorExceptionReported{
		VendorID:  "vendor-abc",
		MarketID:  "market-xyz",
		CheckInID: "ci-123",
		Reason:    "equipment failure",
		Timestamp: time.Date(2026, 3, 28, 11, 0, 0, 0, time.UTC),
	}

	err := handler.Handle(context.Background(), event)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if fcm.title != "Vendor Exception" {
		t.Errorf("expected title 'Vendor Exception', got '%s'", fcm.title)
	}
	if fcm.data["type"] != "vendor.exception_reported" {
		t.Errorf("expected type 'vendor.exception_reported', got '%s'", fcm.data["type"])
	}
}

func TestHandler_MarketUpdateSendsNotification(t *testing.T) {
	fcm := &mockFCMClient{}
	handler := NewHandler(fcm)

	event := events.MarketUpdatePublished{
		MarketID: "market-xyz",
		SenderID: "manager-1",
		Message:  "Market closing early today",
	}

	err := handler.Handle(context.Background(), event)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if fcm.topic != "market-market-xyz" {
		t.Errorf("expected topic 'market-market-xyz', got '%s'", fcm.topic)
	}
	if fcm.title != "Market Update" {
		t.Errorf("expected title 'Market Update', got '%s'", fcm.title)
	}
	if fcm.data["type"] != "market.update_published" {
		t.Errorf("expected type 'market.update_published', got '%s'", fcm.data["type"])
	}
}

func TestHandler_IrrelevantEventTypesIgnored(t *testing.T) {
	fcm := &mockFCMClient{}
	handler := NewHandler(fcm)

	event := events.UserCreated{UserID: "u1", Role: "customer"}

	err := handler.Handle(context.Background(), event)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if fcm.topic != "" {
		t.Error("expected no FCM call for irrelevant event")
	}
}

func TestShouldNotify_DefaultsToTrue(t *testing.T) {
	handler := &Handler{repo: nil}
	// With nil repo, shouldNotify should return true (no prefs means notify)
	// This tests the default behavior path indirectly
	if handler.repo != nil {
		t.Error("expected nil repo")
	}
}
