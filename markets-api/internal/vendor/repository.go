package vendor

import (
	"context"

	"github.com/petry-projects/markets-api/internal/domain"
)

// Repository defines the port for vendor persistence operations.
type Repository interface {
	// CreateVendor inserts a new vendor profile.
	CreateVendor(ctx context.Context, v *VendorRecord) (*VendorRecord, error)

	// UpdateVendor persists changes to a vendor profile.
	UpdateVendor(ctx context.Context, v *VendorRecord) (*VendorRecord, error)

	// FindVendorByID returns a vendor by ID.
	FindVendorByID(ctx context.Context, id domain.VendorID) (*VendorRecord, error)

	// FindVendorByUserID returns a vendor by user ID.
	FindVendorByUserID(ctx context.Context, userID domain.UserID) (*VendorRecord, error)

	// CreateProduct inserts a new product for a vendor.
	CreateProduct(ctx context.Context, p *ProductRecord) (*ProductRecord, error)

	// UpdateProduct persists changes to a product.
	UpdateProduct(ctx context.Context, p *ProductRecord) (*ProductRecord, error)

	// FindProductByID returns a product by ID.
	FindProductByID(ctx context.Context, id domain.ProductID) (*ProductRecord, error)

	// FindProductsByVendorID returns all products for a vendor.
	FindProductsByVendorID(ctx context.Context, vendorID domain.VendorID) ([]*ProductRecord, error)

	// DeleteProduct soft-deletes a product.
	DeleteProduct(ctx context.Context, id domain.ProductID) error

	// SearchMarkets searches markets with optional distance filtering.
	SearchMarkets(ctx context.Context, searchTerm string, lat, lng, radiusKm *float64, limit, offset *int32) ([]MarketSearchRow, error)

	// GetVendorMarketDates returns roster entries for a vendor (by user ID, since vendor_roster references users).
	GetVendorMarketDates(ctx context.Context, userID domain.UserID) ([]VendorMarketDateRow, error)

	// CreateCheckIn inserts a new check-in record.
	CreateCheckIn(ctx context.Context, c *CheckInRecord) (*CheckInRecord, error)

	// UpdateCheckIn persists changes to a check-in record (status, checked_out_at, exception_reason).
	UpdateCheckIn(ctx context.Context, c *CheckInRecord) (*CheckInRecord, error)

	// FindCheckInByID returns a check-in by its ID.
	FindCheckInByID(ctx context.Context, id domain.CheckInID) (*CheckInRecord, error)

	// FindActiveCheckInsByVendor returns all active (status=checked_in) check-ins for a vendor.
	FindActiveCheckInsByVendor(ctx context.Context, vendorID domain.VendorID) ([]*CheckInRecord, error)

	// FindCheckInsByVendor returns all check-ins for a vendor (for the Vendor.checkIns field).
	FindCheckInsByVendor(ctx context.Context, vendorID domain.VendorID) ([]*CheckInRecord, error)

	// FindCheckInsByMarketAndDate returns all check-ins for a market on a specific date.
	FindCheckInsByMarketAndDate(ctx context.Context, marketID domain.MarketID, date string) ([]*CheckInRecord, error)

	// FindActiveCheckInsByMarket returns all active (checked_in) check-ins for a market.
	FindActiveCheckInsByMarket(ctx context.Context, marketID domain.MarketID) ([]*CheckInRecord, error)

	// BatchCheckOut checks out all active check-ins for a market. Returns the count.
	BatchCheckOut(ctx context.Context, marketID domain.MarketID) (int, error)
}

// MarketSearchRow is a database result for market search queries.
type MarketSearchRow struct {
	MarketID    domain.MarketID
	DistanceKm  *float64
	VendorCount int
}

// VendorMarketDateRow is a database result for vendor market date queries.
type VendorMarketDateRow struct {
	ID       string
	MarketID domain.MarketID
	Date     string
	Status   string
}
