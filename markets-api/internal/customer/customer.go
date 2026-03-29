// Package customer provides the Customer aggregate root and domain logic.
package customer

import (
	"errors"
	"time"

	"github.com/petry-projects/markets-api/internal/domain"
)

var (
	// ErrCustomerNotFound is returned when a customer record does not exist.
	ErrCustomerNotFound = errors.New("customer not found")
	// ErrAlreadyFollowing is returned when the customer already follows the target.
	ErrAlreadyFollowing = errors.New("already following this target")
	// ErrNotFollowing is returned when trying to unfollow a target not being followed.
	ErrNotFollowing = errors.New("not following this target")
	// ErrInvalidUserID is returned when user ID is empty.
	ErrInvalidUserID = errors.New("user ID is required")
)

// CustomerRecord holds the full persisted state of a customer profile.
type CustomerRecord struct {
	ID                  domain.CustomerID
	UserID              domain.UserID
	DisplayName         string
	LocationLatitude    *float64
	LocationLongitude   *float64
	Preferences         []string
	OnboardingCompleted bool
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

// FollowRecord represents a customer's follow relationship.
type FollowRecord struct {
	ID         string
	CustomerID domain.CustomerID
	TargetType string
	TargetID   string
	CreatedAt  time.Time
}

// FollowingFeedItem represents a single item in the customer's following feed.
type FollowingFeedItem struct {
	ID        string
	Type      string // "vendor" or "market"
	VendorID  *string
	MarketID  *string
	Timestamp time.Time
	Message   string
}

// DiscoveredMarket represents a market result from discovery with distance.
type DiscoveredMarket struct {
	ID         domain.MarketID
	DistanceMi float64
}

// DiscoveredVendor represents a vendor found at a market.
type DiscoveredVendor struct {
	ID           domain.VendorID
	UserID       domain.UserID
	BusinessName string
	Description  string
	ImageURL     string
}

// NewCustomerParams holds parameters for creating a new customer.
type NewCustomerParams struct {
	UserID      domain.UserID
	DisplayName string
}

// NewCustomer validates inputs and returns a new CustomerRecord.
func NewCustomer(p NewCustomerParams) (*CustomerRecord, error) {
	if p.UserID == "" {
		return nil, ErrInvalidUserID
	}

	return &CustomerRecord{
		UserID:      p.UserID,
		DisplayName: p.DisplayName,
		Preferences: []string{},
	}, nil
}

// UpdateCustomerParams holds optional fields for updating a customer.
type UpdateCustomerParams struct {
	DisplayName         *string
	LocationLatitude    *float64
	LocationLongitude   *float64
	Preferences         []string
	OnboardingCompleted *bool
}

// Update applies partial updates to a CustomerRecord.
func (c *CustomerRecord) Update(p UpdateCustomerParams) {
	if p.DisplayName != nil {
		c.DisplayName = *p.DisplayName
	}
	if p.LocationLatitude != nil {
		c.LocationLatitude = p.LocationLatitude
	}
	if p.LocationLongitude != nil {
		c.LocationLongitude = p.LocationLongitude
	}
	if p.Preferences != nil {
		c.Preferences = p.Preferences
	}
	if p.OnboardingCompleted != nil {
		c.OnboardingCompleted = *p.OnboardingCompleted
	}
}
