package notify

import (
	"time"

	"github.com/petry-projects/markets-api/internal/domain"
)

// DeviceTokenRecord holds the persisted state of a device push token.
type DeviceTokenRecord struct {
	ID        string
	UserID    domain.UserID
	Token     string
	Platform  string
	CreatedAt time.Time
	UpdatedAt time.Time
}

// NotificationPrefsRecord holds the persisted notification preferences for a user.
type NotificationPrefsRecord struct {
	ID              string
	UserID          domain.UserID
	CheckInAlerts   bool
	CheckoutAlerts  bool
	ExceptionAlerts bool
	MarketUpdates   bool
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// ActivityFeedItem holds a single activity feed entry for a user.
type ActivityFeedItem struct {
	ID         string
	UserID     domain.UserID
	ActorID    string
	ActionType string
	TargetType string
	TargetID   string
	MarketID   *string
	Message    string
	CreatedAt  time.Time
}
