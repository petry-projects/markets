// Package notify handles FCM push notification dispatch via domain events.
package notify

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/petry-projects/markets-api/internal/events"
)

// FCMClient abstracts Firebase Cloud Messaging operations for testability.
type FCMClient interface {
	// SendToTopic sends a push notification to a topic.
	SendToTopic(ctx context.Context, topic string, title string, body string, data map[string]string) error
}

// Handler implements events.Handler to dispatch FCM push notifications.
type Handler struct {
	fcm FCMClient
}

// NewHandler creates a new FCM notification handler.
func NewHandler(fcm FCMClient) *Handler {
	return &Handler{fcm: fcm}
}

// Handle processes domain events and dispatches push notifications for relevant types.
// Irrelevant event types are ignored gracefully.
func (h *Handler) Handle(ctx context.Context, event events.Event) error {
	switch e := event.(type) {
	case events.VendorCheckedIn:
		topic := fmt.Sprintf("market-%s", e.MarketID)
		title := "Vendor Checked In"
		body := fmt.Sprintf("A vendor has checked in at the market")
		data := map[string]string{
			"vendor_id": e.VendorID,
			"market_id": e.MarketID,
			"type":      "vendor.checked_in",
		}
		if err := h.fcm.SendToTopic(ctx, topic, title, body, data); err != nil {
			return fmt.Errorf("send FCM notification: %w", err)
		}
		slog.Info("push notification sent",
			"topic", topic,
			"event", event.EventType(),
		)
	default:
		// Irrelevant event types are ignored gracefully
	}
	return nil
}
