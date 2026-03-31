package notify

import (
	"context"
	"errors"

	"github.com/petry-projects/markets-api/internal/domain"
)

var (
	// ErrPrefsNotFound is returned when notification preferences do not exist for a user.
	ErrPrefsNotFound = errors.New("notification preferences not found")
)

// Repository defines the port for notification persistence operations.
// Domain code depends only on this interface; the infrastructure adapter
// (PgNotifyRepository) implements it in internal/db/.
type Repository interface {
	// RegisterDeviceToken stores a push notification token for a user.
	RegisterDeviceToken(ctx context.Context, userID domain.UserID, token string, platform string) error

	// UnregisterDeviceToken removes a push notification token for a user.
	UnregisterDeviceToken(ctx context.Context, userID domain.UserID, token string) error

	// GetDeviceTokensByUserID returns all device tokens for a user.
	GetDeviceTokensByUserID(ctx context.Context, userID domain.UserID) ([]DeviceTokenRecord, error)

	// GetDeviceTokensForFollowers returns device tokens for all followers of a given target.
	// It joins the follows table with device_tokens to find follower tokens.
	GetDeviceTokensForFollowers(ctx context.Context, targetType string, targetID string) ([]DeviceTokenRecord, error)

	// GetNotificationPrefs returns a user's notification preferences.
	GetNotificationPrefs(ctx context.Context, userID domain.UserID) (*NotificationPrefsRecord, error)

	// UpdateNotificationPrefs upserts notification preferences for a user.
	UpdateNotificationPrefs(ctx context.Context, userID domain.UserID, prefs *NotificationPrefsRecord) (*NotificationPrefsRecord, error)

	// CreateActivityFeedItem inserts a new activity feed entry.
	CreateActivityFeedItem(ctx context.Context, item *ActivityFeedItem) error

	// GetActivityFeed returns activity feed items for a user, ordered by newest first.
	GetActivityFeed(ctx context.Context, userID domain.UserID, limit, offset int32) ([]ActivityFeedItem, error)

	// GetMarketActivityFeed returns activity feed items for a specific market.
	GetMarketActivityFeed(ctx context.Context, marketID domain.MarketID, limit, offset int32) ([]ActivityFeedItem, error)
}
