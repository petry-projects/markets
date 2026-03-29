package events

import (
	"context"
	"log/slog"
	"sync"
)

// Handler is the interface for event handlers that process domain events.
type Handler interface {
	Handle(ctx context.Context, event Event) error
}

// Bus is the domain event bus that manages handler subscriptions and event publishing.
// Events are processed synchronously in-request (no external message broker at pilot scale).
// Subscribe and Publish are thread-safe via sync.RWMutex.
type Bus struct {
	mu       sync.RWMutex
	handlers []Handler
}

// NewBus creates a new event bus.
func NewBus() *Bus {
	return &Bus{}
}

// Subscribe registers an event handler to receive published events.
func (b *Bus) Subscribe(h Handler) {
	b.mu.Lock()
	defer b.mu.Unlock()
	b.handlers = append(b.handlers, h)
}

// Publish dispatches an event to all subscribed handlers.
// Handler failures are logged via slog but do NOT roll back the originating DB write.
func (b *Bus) Publish(ctx context.Context, event Event) {
	b.mu.RLock()
	handlers := make([]Handler, len(b.handlers))
	copy(handlers, b.handlers)
	b.mu.RUnlock()

	for _, h := range handlers {
		if err := h.Handle(ctx, event); err != nil {
			slog.Error("event handler failed",
				"event", event.EventType(),
				"error", err,
			)
			// Handler failure is logged but does NOT roll back the DB write
		}
	}
}
