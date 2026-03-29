// Package notify handles FCM push notification dispatch via domain events.
package notify

import (
	"context"
	"fmt"
	"log/slog"

	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/events"
)

// FCMClient abstracts Firebase Cloud Messaging operations for testability.
type FCMClient interface {
	// SendToTopic sends a push notification to a topic.
	SendToTopic(ctx context.Context, topic string, title string, body string, data map[string]string) error
}

// Handler implements events.Handler to dispatch FCM push notifications
// and create activity feed entries for relevant domain events.
type Handler struct {
	fcm  FCMClient
	repo Repository
}

// NewHandler creates a new FCM notification handler.
func NewHandler(fcm FCMClient) *Handler {
	return &Handler{fcm: fcm}
}

// NewHandlerWithRepo creates a new notification handler with repository for activity feed.
func NewHandlerWithRepo(fcm FCMClient, repo Repository) *Handler {
	return &Handler{fcm: fcm, repo: repo}
}

// Handle processes domain events and dispatches push notifications for relevant types.
// For each event it: resolves followers, checks prefs, dispatches FCM, creates activity feed items.
// Irrelevant event types are ignored gracefully.
func (h *Handler) Handle(ctx context.Context, event events.Event) error {
	switch e := event.(type) {
	case events.VendorCheckedIn:
		return h.handleVendorCheckedIn(ctx, e)
	case events.VendorCheckedOut:
		return h.handleVendorCheckedOut(ctx, e)
	case events.VendorExceptionReported:
		return h.handleVendorException(ctx, e)
	case events.MarketUpdatePublished:
		return h.handleMarketUpdate(ctx, e)
	default:
		// Irrelevant event types are ignored gracefully
	}
	return nil
}

func (h *Handler) handleVendorCheckedIn(ctx context.Context, e events.VendorCheckedIn) error {
	topic := fmt.Sprintf("market-%s", e.MarketID)
	title := "Vendor Checked In"
	body := "A vendor has checked in at the market"
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
		"event", e.EventType(),
	)

	// Create activity feed items for followers
	if h.repo != nil {
		h.dispatchToFollowers(ctx, "vendor", e.VendorID, "check_in", "vendor", e.VendorID, &e.MarketID, body)
	}

	return nil
}

func (h *Handler) handleVendorCheckedOut(ctx context.Context, e events.VendorCheckedOut) error {
	topic := fmt.Sprintf("market-%s", e.MarketID)
	title := "Vendor Checked Out"
	body := "A vendor has checked out of the market"
	data := map[string]string{
		"vendor_id": e.VendorID,
		"market_id": e.MarketID,
		"type":      "vendor.checked_out",
	}
	if err := h.fcm.SendToTopic(ctx, topic, title, body, data); err != nil {
		return fmt.Errorf("send FCM notification: %w", err)
	}
	slog.Info("push notification sent",
		"topic", topic,
		"event", e.EventType(),
	)

	if h.repo != nil {
		h.dispatchToFollowers(ctx, "vendor", e.VendorID, "check_out", "vendor", e.VendorID, &e.MarketID, body)
	}

	return nil
}

func (h *Handler) handleVendorException(ctx context.Context, e events.VendorExceptionReported) error {
	topic := fmt.Sprintf("market-%s", e.MarketID)
	title := "Vendor Exception"
	body := fmt.Sprintf("A vendor reported an exception: %s", e.Reason)
	data := map[string]string{
		"vendor_id": e.VendorID,
		"market_id": e.MarketID,
		"type":      "vendor.exception_reported",
	}
	if err := h.fcm.SendToTopic(ctx, topic, title, body, data); err != nil {
		return fmt.Errorf("send FCM notification: %w", err)
	}
	slog.Info("push notification sent",
		"topic", topic,
		"event", e.EventType(),
	)

	if h.repo != nil {
		// Notify vendor followers
		h.dispatchToFollowers(ctx, "vendor", e.VendorID, "exception", "vendor", e.VendorID, &e.MarketID, body)
		// Also notify market followers
		h.dispatchToFollowers(ctx, "market", e.MarketID, "exception", "vendor", e.VendorID, &e.MarketID, body)
	}

	return nil
}

func (h *Handler) handleMarketUpdate(ctx context.Context, e events.MarketUpdatePublished) error {
	topic := fmt.Sprintf("market-%s", e.MarketID)
	title := "Market Update"
	body := e.Message
	data := map[string]string{
		"market_id": e.MarketID,
		"sender_id": e.SenderID,
		"type":      "market.update_published",
	}
	if err := h.fcm.SendToTopic(ctx, topic, title, body, data); err != nil {
		return fmt.Errorf("send FCM notification: %w", err)
	}
	slog.Info("push notification sent",
		"topic", topic,
		"event", e.EventType(),
	)

	if h.repo != nil {
		h.dispatchToFollowers(ctx, "market", e.MarketID, "market_update", "market", e.MarketID, &e.MarketID, body)
	}

	return nil
}

// dispatchToFollowers resolves followers of a target, checks their notification preferences,
// logs the dispatch (actual FCM per-device dispatch is a future enhancement), and creates
// activity feed items for each eligible follower.
func (h *Handler) dispatchToFollowers(ctx context.Context, followTargetType, followTargetID, actionType, targetType, targetID string, marketID *string, message string) {
	tokens, err := h.repo.GetDeviceTokensForFollowers(ctx, followTargetType, followTargetID)
	if err != nil {
		slog.Error("failed to get follower device tokens",
			"error", err,
			"targetType", followTargetType,
			"targetID", followTargetID,
		)
		return
	}

	// Deduplicate users from tokens
	seenUsers := make(map[domain.UserID]bool)
	for _, t := range tokens {
		if seenUsers[t.UserID] {
			continue
		}
		seenUsers[t.UserID] = true

		// Check notification preferences
		if !h.shouldNotify(ctx, t.UserID, actionType) {
			continue
		}

		slog.Info("dispatching notification to follower",
			"userID", t.UserID,
			"actionType", actionType,
			"targetType", targetType,
			"targetID", targetID,
			"deviceTokenCount", len(tokens),
		)

		// Create activity feed item
		item := &ActivityFeedItem{
			UserID:     t.UserID,
			ActorID:    targetID,
			ActionType: actionType,
			TargetType: targetType,
			TargetID:   targetID,
			MarketID:   marketID,
			Message:    message,
		}
		if err := h.repo.CreateActivityFeedItem(ctx, item); err != nil {
			slog.Error("failed to create activity feed item",
				"error", err,
				"userID", t.UserID,
				"actionType", actionType,
			)
		}
	}
}

// shouldNotify checks a user's notification preferences for the given action type.
func (h *Handler) shouldNotify(ctx context.Context, userID domain.UserID, actionType string) bool {
	prefs, err := h.repo.GetNotificationPrefs(ctx, userID)
	if err != nil {
		// If no prefs exist, default to notifying
		return true
	}

	switch actionType {
	case "check_in":
		return prefs.CheckInAlerts
	case "check_out":
		return prefs.CheckoutAlerts
	case "exception":
		return prefs.ExceptionAlerts
	case "market_update":
		return prefs.MarketUpdates
	default:
		return true
	}
}
