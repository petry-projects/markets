package customer

import (
	"context"

	"github.com/petry-projects/markets-api/internal/domain"
)

// Repository defines the port for customer persistence operations.
// Domain code depends only on this interface; the infrastructure adapter
// (PgCustomerRepository) implements it in internal/db/.
type Repository interface {
	// CreateCustomer inserts a new customer profile.
	CreateCustomer(ctx context.Context, c *CustomerRecord) (*CustomerRecord, error)

	// FindCustomerByUserID returns a customer by their user ID.
	FindCustomerByUserID(ctx context.Context, userID domain.UserID) (*CustomerRecord, error)

	// UpdateCustomer persists changes to an existing customer profile.
	UpdateCustomer(ctx context.Context, c *CustomerRecord) (*CustomerRecord, error)

	// Follow creates a follow relationship between a customer and a target.
	Follow(ctx context.Context, customerID domain.CustomerID, targetType string, targetID string) (*FollowRecord, error)

	// Unfollow removes a follow relationship.
	Unfollow(ctx context.Context, customerID domain.CustomerID, targetType string, targetID string) error

	// GetFollows returns all follow records for a customer.
	GetFollows(ctx context.Context, customerID domain.CustomerID) ([]*FollowRecord, error)

	// GetFollowerCount returns the number of followers for a given target.
	GetFollowerCount(ctx context.Context, targetType string, targetID string) (int, error)

	// DiscoverMarkets finds markets near the given coordinates within a radius.
	DiscoverMarkets(ctx context.Context, lat, lng, radiusMiles float64, limit, offset int32) ([]*DiscoveredMarket, error)

	// DiscoverVendors returns vendors associated with a specific market.
	DiscoverVendors(ctx context.Context, marketID domain.MarketID, limit, offset int32) ([]*DiscoveredVendor, error)

	// GetFollowingFeed returns activity feed items for a customer's followed entities.
	GetFollowingFeed(ctx context.Context, customerID domain.CustomerID, limit, offset int32) ([]*FollowingFeedItem, error)
}
