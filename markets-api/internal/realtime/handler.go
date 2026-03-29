// Package realtime handles Firebase Realtime Database writes for live vendor status.
package realtime

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/petry-projects/markets-api/internal/events"
)

// DatabaseClient abstracts Firebase Realtime Database operations for testability.
type DatabaseClient interface {
	// Set writes data to the specified path in the Realtime Database.
	Set(ctx context.Context, path string, data interface{}) error
}

// Handler implements events.Handler to write vendor status to Firebase Realtime Database.
type Handler struct {
	db DatabaseClient
}

// NewHandler creates a new realtime handler with the given Firebase Realtime Database client.
func NewHandler(db DatabaseClient) *Handler {
	return &Handler{db: db}
}

// Handle processes domain events and writes relevant data to Firebase Realtime Database.
// Currently handles VendorCheckedIn events by writing status to the vendor's market path.
// Irrelevant event types are ignored gracefully.
func (h *Handler) Handle(ctx context.Context, event events.Event) error {
	switch e := event.(type) {
	case events.VendorCheckedIn:
		path := fmt.Sprintf("/markets/%s/vendors/%s/status", e.MarketID, e.VendorID)
		data := map[string]interface{}{
			"status":      "checked_in",
			"checkedInAt": e.Timestamp.Unix(),
		}
		if err := h.db.Set(ctx, path, data); err != nil {
			return fmt.Errorf("write vendor status to realtime db: %w", err)
		}
		slog.Info("vendor status written to realtime db",
			"vendor_id", e.VendorID,
			"market_id", e.MarketID,
			"path", path,
		)
	default:
		// Irrelevant event types are ignored gracefully
	}
	return nil
}
