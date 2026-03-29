package events

import (
	"bytes"
	"context"
	"errors"
	"log/slog"
	"strings"
	"testing"
	"time"
)

// mockHandler records calls and optionally returns an error.
type mockHandler struct {
	received []Event
	err      error
}

func (m *mockHandler) Handle(_ context.Context, event Event) error {
	m.received = append(m.received, event)
	return m.err
}

func TestBus_PublishedEventIsReceivedByHandler(t *testing.T) {
	bus := NewBus()
	handler := &mockHandler{}
	bus.Subscribe(handler)

	event := VendorCheckedIn{
		VendorID:  "v1",
		MarketID:  "m1",
		Timestamp: time.Now(),
	}
	bus.Publish(context.Background(), event)

	if len(handler.received) != 1 {
		t.Fatalf("expected 1 event, got %d", len(handler.received))
	}
	if handler.received[0].EventType() != "vendor.checked_in" {
		t.Errorf("expected event type 'vendor.checked_in', got '%s'", handler.received[0].EventType())
	}
}

func TestBus_MultipleHandlersReceiveSameEvent(t *testing.T) {
	bus := NewBus()
	h1 := &mockHandler{}
	h2 := &mockHandler{}
	bus.Subscribe(h1)
	bus.Subscribe(h2)

	event := UserCreated{UserID: "u1", Role: "customer"}
	bus.Publish(context.Background(), event)

	if len(h1.received) != 1 {
		t.Fatalf("handler1: expected 1 event, got %d", len(h1.received))
	}
	if len(h2.received) != 1 {
		t.Fatalf("handler2: expected 1 event, got %d", len(h2.received))
	}
}

func TestBus_HandlerFailureDoesNotAffectOtherHandlers(t *testing.T) {
	bus := NewBus()
	failingHandler := &mockHandler{err: errors.New("handler failed")}
	successHandler := &mockHandler{}
	bus.Subscribe(failingHandler)
	bus.Subscribe(successHandler)

	event := ManagerAssigned{UserID: "u1", MarketID: "m1"}
	bus.Publish(context.Background(), event)

	if len(failingHandler.received) != 1 {
		t.Fatalf("failing handler: expected 1 event, got %d", len(failingHandler.received))
	}
	if len(successHandler.received) != 1 {
		t.Fatalf("success handler: expected 1 event, got %d", len(successHandler.received))
	}
}

func TestBus_HandlerFailureIsLogged(t *testing.T) {
	var buf bytes.Buffer
	logger := slog.New(slog.NewTextHandler(&buf, nil))
	slog.SetDefault(logger)

	bus := NewBus()
	failingHandler := &mockHandler{err: errors.New("test error")}
	bus.Subscribe(failingHandler)

	event := VendorCheckedIn{VendorID: "v1", MarketID: "m1", Timestamp: time.Now()}
	bus.Publish(context.Background(), event)

	logOutput := buf.String()
	if !strings.Contains(logOutput, "event handler failed") {
		t.Errorf("expected log to contain 'event handler failed', got: %s", logOutput)
	}
	if !strings.Contains(logOutput, "vendor.checked_in") {
		t.Errorf("expected log to contain event type 'vendor.checked_in', got: %s", logOutput)
	}
}
