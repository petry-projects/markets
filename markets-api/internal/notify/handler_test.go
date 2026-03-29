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
