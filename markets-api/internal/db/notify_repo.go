package db

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/notify"
)

// PgNotifyRepository implements notify.Repository using pgx.
type PgNotifyRepository struct {
	pool *pgxpool.Pool
}

// NewPgNotifyRepository creates a new PgNotifyRepository.
func NewPgNotifyRepository(pool *pgxpool.Pool) *PgNotifyRepository {
	return &PgNotifyRepository{pool: pool}
}

// RegisterDeviceToken stores a push notification token for a user.
func (r *PgNotifyRepository) RegisterDeviceToken(ctx context.Context, userID domain.UserID, token string, platform string) error {
	query := `
		INSERT INTO device_tokens (user_id, token, platform)
		VALUES ($1, $2, $3)
		ON CONFLICT (user_id, token) DO UPDATE SET
			platform = EXCLUDED.platform,
			updated_at = NOW()
	`
	_, err := r.pool.Exec(ctx, query, userID.String(), token, platform)
	if err != nil {
		return fmt.Errorf("register device token: %w", err)
	}
	return nil
}

// UnregisterDeviceToken removes a push notification token for a user.
func (r *PgNotifyRepository) UnregisterDeviceToken(ctx context.Context, userID domain.UserID, token string) error {
	query := `DELETE FROM device_tokens WHERE user_id = $1 AND token = $2`
	result, err := r.pool.Exec(ctx, query, userID.String(), token)
	if err != nil {
		return fmt.Errorf("unregister device token: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("device token not found")
	}
	return nil
}

// GetDeviceTokensByUserID returns all device tokens for a user.
func (r *PgNotifyRepository) GetDeviceTokensByUserID(ctx context.Context, userID domain.UserID) ([]notify.DeviceTokenRecord, error) {
	query := `
		SELECT id, user_id, token, platform, created_at, updated_at
		FROM device_tokens
		WHERE user_id = $1
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, userID.String())
	if err != nil {
		return nil, fmt.Errorf("get device tokens: %w", err)
	}
	defer rows.Close()

	var tokens []notify.DeviceTokenRecord
	for rows.Next() {
		var t notify.DeviceTokenRecord
		if err := rows.Scan(&t.ID, &t.UserID, &t.Token, &t.Platform, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan device token: %w", err)
		}
		tokens = append(tokens, t)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate device tokens: %w", err)
	}

	return tokens, nil
}

// GetDeviceTokensForFollowers returns device tokens for all followers of a given target.
// Joins follows → customers → device_tokens to find follower push tokens.
func (r *PgNotifyRepository) GetDeviceTokensForFollowers(ctx context.Context, targetType string, targetID string) ([]notify.DeviceTokenRecord, error) {
	query := `
		SELECT dt.id, dt.user_id, dt.token, dt.platform, dt.created_at, dt.updated_at
		FROM follows f
		JOIN customers c ON c.id = f.customer_id
		JOIN device_tokens dt ON dt.user_id = c.user_id
		WHERE f.target_type = $1 AND f.target_id = $2::uuid
		ORDER BY dt.created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, targetType, targetID)
	if err != nil {
		return nil, fmt.Errorf("get follower device tokens: %w", err)
	}
	defer rows.Close()

	var tokens []notify.DeviceTokenRecord
	for rows.Next() {
		var t notify.DeviceTokenRecord
		if err := rows.Scan(&t.ID, &t.UserID, &t.Token, &t.Platform, &t.CreatedAt, &t.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan follower device token: %w", err)
		}
		tokens = append(tokens, t)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate follower device tokens: %w", err)
	}

	return tokens, nil
}

// GetNotificationPrefs returns a user's notification preferences.
func (r *PgNotifyRepository) GetNotificationPrefs(ctx context.Context, userID domain.UserID) (*notify.NotificationPrefsRecord, error) {
	query := `
		SELECT id, user_id, check_in_alerts, checkout_alerts, exception_alerts, market_updates,
		       created_at, updated_at
		FROM notification_prefs
		WHERE user_id = $1
	`
	var p notify.NotificationPrefsRecord
	err := r.pool.QueryRow(ctx, query, userID.String()).Scan(
		&p.ID, &p.UserID, &p.CheckInAlerts, &p.CheckoutAlerts, &p.ExceptionAlerts, &p.MarketUpdates,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, notify.ErrPrefsNotFound
		}
		return nil, fmt.Errorf("get notification prefs: %w", err)
	}
	return &p, nil
}

// UpdateNotificationPrefs upserts notification preferences for a user.
func (r *PgNotifyRepository) UpdateNotificationPrefs(ctx context.Context, userID domain.UserID, prefs *notify.NotificationPrefsRecord) (*notify.NotificationPrefsRecord, error) {
	query := `
		INSERT INTO notification_prefs (user_id, check_in_alerts, checkout_alerts, exception_alerts, market_updates)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (user_id) DO UPDATE SET
			check_in_alerts = EXCLUDED.check_in_alerts,
			checkout_alerts = EXCLUDED.checkout_alerts,
			exception_alerts = EXCLUDED.exception_alerts,
			market_updates = EXCLUDED.market_updates,
			updated_at = NOW()
		RETURNING id, user_id, check_in_alerts, checkout_alerts, exception_alerts, market_updates,
		          created_at, updated_at
	`
	var p notify.NotificationPrefsRecord
	err := r.pool.QueryRow(ctx, query,
		userID.String(), prefs.CheckInAlerts, prefs.CheckoutAlerts, prefs.ExceptionAlerts, prefs.MarketUpdates,
	).Scan(
		&p.ID, &p.UserID, &p.CheckInAlerts, &p.CheckoutAlerts, &p.ExceptionAlerts, &p.MarketUpdates,
		&p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("update notification prefs: %w", err)
	}
	return &p, nil
}

// CreateActivityFeedItem inserts a new activity feed entry.
func (r *PgNotifyRepository) CreateActivityFeedItem(ctx context.Context, item *notify.ActivityFeedItem) error {
	query := `
		INSERT INTO activity_feed (user_id, actor_id, action_type, target_type, target_id, market_id, message)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	_, err := r.pool.Exec(ctx, query,
		item.UserID.String(), item.ActorID, item.ActionType, item.TargetType,
		item.TargetID, nilIfEmpty(item.MarketID), item.Message,
	)
	if err != nil {
		return fmt.Errorf("create activity feed item: %w", err)
	}
	return nil
}

// GetActivityFeed returns activity feed items for a user, ordered by newest first.
func (r *PgNotifyRepository) GetActivityFeed(ctx context.Context, userID domain.UserID, limit, offset int32) ([]notify.ActivityFeedItem, error) {
	query := `
		SELECT id, user_id, actor_id, action_type, target_type, target_id, market_id, message, created_at
		FROM activity_feed
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.pool.Query(ctx, query, userID.String(), limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get activity feed: %w", err)
	}
	defer rows.Close()

	var items []notify.ActivityFeedItem
	for rows.Next() {
		var item notify.ActivityFeedItem
		if err := rows.Scan(
			&item.ID, &item.UserID, &item.ActorID, &item.ActionType, &item.TargetType,
			&item.TargetID, &item.MarketID, &item.Message, &item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan activity feed item: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate activity feed: %w", err)
	}

	return items, nil
}

// GetMarketActivityFeed returns activity feed items for a specific market.
func (r *PgNotifyRepository) GetMarketActivityFeed(ctx context.Context, marketID domain.MarketID, limit, offset int32) ([]notify.ActivityFeedItem, error) {
	query := `
		SELECT id, user_id, actor_id, action_type, target_type, target_id, market_id, message, created_at
		FROM activity_feed
		WHERE market_id = $1
		ORDER BY created_at DESC
		LIMIT $2 OFFSET $3
	`
	rows, err := r.pool.Query(ctx, query, marketID.String(), limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get market activity feed: %w", err)
	}
	defer rows.Close()

	var items []notify.ActivityFeedItem
	for rows.Next() {
		var item notify.ActivityFeedItem
		if err := rows.Scan(
			&item.ID, &item.UserID, &item.ActorID, &item.ActionType, &item.TargetType,
			&item.TargetID, &item.MarketID, &item.Message, &item.CreatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan market activity feed item: %w", err)
		}
		items = append(items, item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate market activity feed: %w", err)
	}

	return items, nil
}

// nilIfEmpty returns nil if the string pointer is nil or empty.
func nilIfEmpty(s *string) interface{} {
	if s == nil || *s == "" {
		return nil
	}
	return *s
}
