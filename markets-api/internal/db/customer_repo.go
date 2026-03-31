package db

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petry-projects/markets-api/internal/customer"
	"github.com/petry-projects/markets-api/internal/domain"
)

// PgCustomerRepository implements customer.Repository using pgx.
type PgCustomerRepository struct {
	pool *pgxpool.Pool
}

// NewPgCustomerRepository creates a new PgCustomerRepository.
func NewPgCustomerRepository(pool *pgxpool.Pool) *PgCustomerRepository {
	return &PgCustomerRepository{pool: pool}
}

// CreateCustomer inserts a new customer profile.
func (r *PgCustomerRepository) CreateCustomer(ctx context.Context, c *customer.CustomerRecord) (*customer.CustomerRecord, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_id = $1", c.UserID.String()); err != nil {
		return nil, fmt.Errorf("set actor_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_role = 'customer'"); err != nil {
		return nil, fmt.Errorf("set actor_role: %w", err)
	}

	query := `
		INSERT INTO customers (user_id, display_name, location_latitude, location_longitude,
		                       preferences, onboarding_completed)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, display_name, location_latitude, location_longitude,
		          preferences, onboarding_completed, created_at, updated_at
	`
	err = tx.QueryRow(ctx, query,
		c.UserID, c.DisplayName, c.LocationLatitude, c.LocationLongitude,
		c.Preferences, c.OnboardingCompleted,
	).Scan(
		&c.ID, &c.UserID, &c.DisplayName, &c.LocationLatitude, &c.LocationLongitude,
		&c.Preferences, &c.OnboardingCompleted, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, fmt.Errorf("customer already exists for this user")
		}
		return nil, fmt.Errorf("insert customer: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return c, nil
}

// FindCustomerByUserID returns a customer by their user ID.
func (r *PgCustomerRepository) FindCustomerByUserID(ctx context.Context, userID domain.UserID) (*customer.CustomerRecord, error) {
	query := `
		SELECT id, user_id, display_name, location_latitude, location_longitude,
		       preferences, onboarding_completed, created_at, updated_at
		FROM customers
		WHERE user_id = $1 AND deleted_at IS NULL
	`

	var c customer.CustomerRecord
	err := r.pool.QueryRow(ctx, query, userID.String()).Scan(
		&c.ID, &c.UserID, &c.DisplayName, &c.LocationLatitude, &c.LocationLongitude,
		&c.Preferences, &c.OnboardingCompleted, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, customer.ErrCustomerNotFound
		}
		return nil, fmt.Errorf("find customer by user ID: %w", err)
	}

	return &c, nil
}

// UpdateCustomer persists changes to an existing customer profile.
func (r *PgCustomerRepository) UpdateCustomer(ctx context.Context, c *customer.CustomerRecord) (*customer.CustomerRecord, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_id = $1", c.UserID.String()); err != nil {
		return nil, fmt.Errorf("set actor_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_role = 'customer'"); err != nil {
		return nil, fmt.Errorf("set actor_role: %w", err)
	}

	query := `
		UPDATE customers
		SET display_name = $2,
		    location_latitude = $3,
		    location_longitude = $4,
		    preferences = $5,
		    onboarding_completed = $6,
		    updated_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
		RETURNING id, user_id, display_name, location_latitude, location_longitude,
		          preferences, onboarding_completed, created_at, updated_at
	`
	err = tx.QueryRow(ctx, query,
		c.ID, c.DisplayName, c.LocationLatitude, c.LocationLongitude,
		c.Preferences, c.OnboardingCompleted,
	).Scan(
		&c.ID, &c.UserID, &c.DisplayName, &c.LocationLatitude, &c.LocationLongitude,
		&c.Preferences, &c.OnboardingCompleted, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, customer.ErrCustomerNotFound
		}
		return nil, fmt.Errorf("update customer: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}

	return c, nil
}

// Follow creates a follow relationship between a customer and a target.
func (r *PgCustomerRepository) Follow(ctx context.Context, customerID domain.CustomerID, targetType string, targetID string) (*customer.FollowRecord, error) {
	query := `
		INSERT INTO follows (customer_id, target_type, target_id)
		VALUES ($1, $2, $3)
		ON CONFLICT (customer_id, target_type, target_id) DO NOTHING
		RETURNING id, customer_id, target_type, target_id, created_at
	`

	var f customer.FollowRecord
	err := r.pool.QueryRow(ctx, query, customerID.String(), targetType, targetID).Scan(
		&f.ID, &f.CustomerID, &f.TargetType, &f.TargetID, &f.CreatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, customer.ErrAlreadyFollowing
		}
		return nil, fmt.Errorf("follow: %w", err)
	}

	return &f, nil
}

// Unfollow removes a follow relationship.
func (r *PgCustomerRepository) Unfollow(ctx context.Context, customerID domain.CustomerID, targetType string, targetID string) error {
	query := `DELETE FROM follows WHERE customer_id = $1 AND target_type = $2 AND target_id = $3`

	result, err := r.pool.Exec(ctx, query, customerID.String(), targetType, targetID)
	if err != nil {
		return fmt.Errorf("unfollow: %w", err)
	}
	if result.RowsAffected() == 0 {
		return customer.ErrNotFollowing
	}

	return nil
}

// GetFollows returns all follow records for a customer.
func (r *PgCustomerRepository) GetFollows(ctx context.Context, customerID domain.CustomerID) ([]*customer.FollowRecord, error) {
	query := `
		SELECT id, customer_id, target_type, target_id, created_at
		FROM follows
		WHERE customer_id = $1
		ORDER BY created_at DESC
	`

	rows, err := r.pool.Query(ctx, query, customerID.String())
	if err != nil {
		return nil, fmt.Errorf("get follows: %w", err)
	}
	defer rows.Close()

	var follows []*customer.FollowRecord
	for rows.Next() {
		var f customer.FollowRecord
		if err := rows.Scan(&f.ID, &f.CustomerID, &f.TargetType, &f.TargetID, &f.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan follow: %w", err)
		}
		follows = append(follows, &f)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate follows: %w", err)
	}

	return follows, nil
}

// GetFollowerCount returns the number of followers for a given target.
func (r *PgCustomerRepository) GetFollowerCount(ctx context.Context, targetType string, targetID string) (int, error) {
	query := `SELECT COUNT(*) FROM follows WHERE target_type = $1 AND target_id = $2`

	var count int
	err := r.pool.QueryRow(ctx, query, targetType, targetID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("get follower count: %w", err)
	}

	return count, nil
}

// DiscoverMarkets finds markets near the given coordinates within a radius in miles.
func (r *PgCustomerRepository) DiscoverMarkets(ctx context.Context, lat, lng, radiusMiles float64, limit, offset int32) ([]*customer.DiscoveredMarket, error) {
	query := `
		SELECT m.id,
		       (3959 * acos(LEAST(1.0, GREATEST(-1.0,
		        cos(radians($1)) * cos(radians(m.latitude))
		        * cos(radians(m.longitude) - radians($2))
		        + sin(radians($1)) * sin(radians(m.latitude)))))) AS distance_mi
		FROM markets m
		WHERE m.deleted_at IS NULL
		  AND m.status = 'active'
		  AND (3959 * acos(LEAST(1.0, GREATEST(-1.0,
		       cos(radians($1)) * cos(radians(m.latitude))
		       * cos(radians(m.longitude) - radians($2))
		       + sin(radians($1)) * sin(radians(m.latitude)))))) <= $3
		ORDER BY distance_mi
		LIMIT $4 OFFSET $5
	`

	rows, err := r.pool.Query(ctx, query, lat, lng, radiusMiles, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("discover markets: %w", err)
	}
	defer rows.Close()

	var results []*customer.DiscoveredMarket
	for rows.Next() {
		var dm customer.DiscoveredMarket
		if err := rows.Scan(&dm.ID, &dm.DistanceMi); err != nil {
			return nil, fmt.Errorf("scan discovered market: %w", err)
		}
		results = append(results, &dm)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate discovered markets: %w", err)
	}

	return results, nil
}

// DiscoverVendors returns vendors associated with a specific market via the roster.
func (r *PgCustomerRepository) DiscoverVendors(ctx context.Context, marketID domain.MarketID, limit, offset int32) ([]*customer.DiscoveredVendor, error) {
	query := `
		SELECT DISTINCT v.id, v.user_id, v.business_name, v.description, v.image_url
		FROM vendors v
		JOIN vendor_roster vr ON vr.vendor_id = v.user_id
		WHERE vr.market_id = $1
		  AND vr.status IN ('approved', 'committed')
		  AND vr.deleted_at IS NULL
		  AND v.deleted_at IS NULL
		ORDER BY v.business_name
		LIMIT $2 OFFSET $3
	`

	rows, err := r.pool.Query(ctx, query, marketID.String(), limit, offset)
	if err != nil {
		return nil, fmt.Errorf("discover vendors: %w", err)
	}
	defer rows.Close()

	var results []*customer.DiscoveredVendor
	for rows.Next() {
		var dv customer.DiscoveredVendor
		if err := rows.Scan(&dv.ID, &dv.UserID, &dv.BusinessName, &dv.Description, &dv.ImageURL); err != nil {
			return nil, fmt.Errorf("scan discovered vendor: %w", err)
		}
		results = append(results, &dv)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate discovered vendors: %w", err)
	}

	return results, nil
}

// GetFollowingFeed returns activity feed items for a customer's followed entities.
func (r *PgCustomerRepository) GetFollowingFeed(ctx context.Context, customerID domain.CustomerID, limit, offset int32) ([]*customer.FollowingFeedItem, error) {
	// Build a union query: followed vendors with their latest check-in status,
	// and followed markets with their latest updates.
	query := `
		SELECT * FROM (
			SELECT f.id,
			       'vendor' AS type,
			       f.target_id AS vendor_id,
			       NULL AS market_id,
			       COALESCE(ci.checked_in_at, f.created_at) AS timestamp,
			       CASE
			           WHEN ci.id IS NOT NULL AND ci.checked_out_at IS NULL THEN 'Vendor is currently checked in'
			           ELSE 'You are following this vendor'
			       END AS message
			FROM follows f
			LEFT JOIN LATERAL (
				SELECT ci2.id, ci2.checked_in_at, ci2.checked_out_at
				FROM check_ins ci2
				WHERE ci2.vendor_id = f.target_id
				ORDER BY ci2.checked_in_at DESC
				LIMIT 1
			) ci ON true
			WHERE f.customer_id = $1 AND f.target_type = 'vendor'

			UNION ALL

			SELECT f.id,
			       'market' AS type,
			       NULL AS vendor_id,
			       f.target_id AS market_id,
			       COALESCE(mu.created_at, f.created_at) AS timestamp,
			       CASE
			           WHEN mu.id IS NOT NULL THEN mu.message
			           ELSE 'You are following this market'
			       END AS message
			FROM follows f
			LEFT JOIN LATERAL (
				SELECT mu2.id, mu2.message, mu2.created_at
				FROM market_updates mu2
				WHERE mu2.market_id = f.target_id::uuid
				ORDER BY mu2.created_at DESC
				LIMIT 1
			) mu ON true
			WHERE f.customer_id = $1 AND f.target_type = 'market'
		) feed
		ORDER BY timestamp DESC
		LIMIT $2 OFFSET $3
	`

	rows, err := r.pool.Query(ctx, query, customerID.String(), limit, offset)
	if err != nil {
		return nil, fmt.Errorf("get following feed: %w", err)
	}
	defer rows.Close()

	var items []*customer.FollowingFeedItem
	for rows.Next() {
		var item customer.FollowingFeedItem
		if err := rows.Scan(
			&item.ID, &item.Type, &item.VendorID, &item.MarketID,
			&item.Timestamp, &item.Message,
		); err != nil {
			return nil, fmt.Errorf("scan feed item: %w", err)
		}
		items = append(items, &item)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate feed items: %w", err)
	}

	return items, nil
}
