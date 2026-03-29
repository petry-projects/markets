package db

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/vendor"
)

// ErrVendorNotFound is returned when a vendor lookup finds no record.
var ErrVendorNotFound = vendor.ErrVendorNotFound

// ErrProductNotFound is returned when a product lookup finds no record.
var ErrProductNotFound = vendor.ErrProductNotFound

// PgVendorRepository implements vendor.Repository using pgx.
type PgVendorRepository struct {
	pool *pgxpool.Pool
}

// NewPgVendorRepository creates a new PgVendorRepository.
func NewPgVendorRepository(pool *pgxpool.Pool) *PgVendorRepository {
	return &PgVendorRepository{pool: pool}
}

// CreateVendor inserts a new vendor profile.
func (r *PgVendorRepository) CreateVendor(ctx context.Context, v *vendor.VendorRecord) (*vendor.VendorRecord, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_id = $1", v.UserID.String()); err != nil {
		return nil, fmt.Errorf("set actor_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_role = 'vendor'"); err != nil {
		return nil, fmt.Errorf("set actor_role: %w", err)
	}

	query := `
		INSERT INTO vendors (user_id, business_name, description, contact_info,
		                     instagram_handle, facebook_url, website_url, image_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, user_id, business_name, description, contact_info,
		          instagram_handle, facebook_url, website_url, image_url,
		          created_at, updated_at
	`
	err = tx.QueryRow(ctx, query,
		v.UserID, v.BusinessName, v.Description, v.ContactInfo,
		v.InstagramHandle, v.FacebookURL, v.WebsiteURL, v.ImageURL,
	).Scan(
		&v.ID, &v.UserID, &v.BusinessName, &v.Description, &v.ContactInfo,
		&v.InstagramHandle, &v.FacebookURL, &v.WebsiteURL, &v.ImageURL,
		&v.CreatedAt, &v.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("insert vendor: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return v, nil
}

// UpdateVendor persists changes to a vendor profile.
func (r *PgVendorRepository) UpdateVendor(ctx context.Context, v *vendor.VendorRecord) (*vendor.VendorRecord, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_id = $1", v.UserID.String()); err != nil {
		return nil, fmt.Errorf("set actor_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_role = 'vendor'"); err != nil {
		return nil, fmt.Errorf("set actor_role: %w", err)
	}

	query := `
		UPDATE vendors SET
			business_name = $1, description = $2, contact_info = $3,
			instagram_handle = $4, facebook_url = $5, website_url = $6,
			image_url = $7, updated_at = NOW()
		WHERE id = $8 AND deleted_at IS NULL
		RETURNING id, user_id, business_name, description, contact_info,
		          instagram_handle, facebook_url, website_url, image_url,
		          created_at, updated_at
	`
	err = tx.QueryRow(ctx, query,
		v.BusinessName, v.Description, v.ContactInfo,
		v.InstagramHandle, v.FacebookURL, v.WebsiteURL,
		v.ImageURL, v.ID,
	).Scan(
		&v.ID, &v.UserID, &v.BusinessName, &v.Description, &v.ContactInfo,
		&v.InstagramHandle, &v.FacebookURL, &v.WebsiteURL, &v.ImageURL,
		&v.CreatedAt, &v.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, vendor.ErrVendorNotFound
		}
		return nil, fmt.Errorf("update vendor: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return v, nil
}

// FindVendorByID returns a vendor by ID.
func (r *PgVendorRepository) FindVendorByID(ctx context.Context, id domain.VendorID) (*vendor.VendorRecord, error) {
	query := `
		SELECT id, user_id, business_name, description, contact_info,
		       instagram_handle, facebook_url, website_url, image_url,
		       created_at, updated_at
		FROM vendors
		WHERE id = $1 AND deleted_at IS NULL
	`
	v := &vendor.VendorRecord{}
	err := r.pool.QueryRow(ctx, query, id.String()).Scan(
		&v.ID, &v.UserID, &v.BusinessName, &v.Description, &v.ContactInfo,
		&v.InstagramHandle, &v.FacebookURL, &v.WebsiteURL, &v.ImageURL,
		&v.CreatedAt, &v.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, vendor.ErrVendorNotFound
		}
		return nil, fmt.Errorf("find vendor by id: %w", err)
	}
	return v, nil
}

// FindVendorByUserID returns a vendor by user ID.
func (r *PgVendorRepository) FindVendorByUserID(ctx context.Context, userID domain.UserID) (*vendor.VendorRecord, error) {
	query := `
		SELECT id, user_id, business_name, description, contact_info,
		       instagram_handle, facebook_url, website_url, image_url,
		       created_at, updated_at
		FROM vendors
		WHERE user_id = $1 AND deleted_at IS NULL
	`
	v := &vendor.VendorRecord{}
	err := r.pool.QueryRow(ctx, query, userID.String()).Scan(
		&v.ID, &v.UserID, &v.BusinessName, &v.Description, &v.ContactInfo,
		&v.InstagramHandle, &v.FacebookURL, &v.WebsiteURL, &v.ImageURL,
		&v.CreatedAt, &v.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, vendor.ErrVendorNotFound
		}
		return nil, fmt.Errorf("find vendor by user_id: %w", err)
	}
	return v, nil
}

// CreateProduct inserts a new product for a vendor.
func (r *PgVendorRepository) CreateProduct(ctx context.Context, p *vendor.ProductRecord) (*vendor.ProductRecord, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Look up user_id from vendor for audit
	var userID string
	if err := tx.QueryRow(ctx, "SELECT user_id FROM vendors WHERE id = $1", p.VendorID.String()).Scan(&userID); err != nil {
		return nil, fmt.Errorf("lookup vendor user_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_id = $1", userID); err != nil {
		return nil, fmt.Errorf("set actor_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_role = 'vendor'"); err != nil {
		return nil, fmt.Errorf("set actor_role: %w", err)
	}

	query := `
		INSERT INTO vendor_products (vendor_id, name, description, category, image_url, is_available)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, vendor_id, name, description, category, image_url, is_available, created_at, updated_at
	`
	err = tx.QueryRow(ctx, query,
		p.VendorID, p.Name, p.Description, p.Category, p.ImageURL, p.IsAvailable,
	).Scan(
		&p.ID, &p.VendorID, &p.Name, &p.Description, &p.Category,
		&p.ImageURL, &p.IsAvailable, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("insert product: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return p, nil
}

// UpdateProduct persists changes to a product.
func (r *PgVendorRepository) UpdateProduct(ctx context.Context, p *vendor.ProductRecord) (*vendor.ProductRecord, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Look up user_id from vendor for audit
	var userID string
	if err := tx.QueryRow(ctx, "SELECT v.user_id FROM vendors v JOIN vendor_products vp ON vp.vendor_id = v.id WHERE vp.id = $1", p.ID.String()).Scan(&userID); err != nil {
		return nil, fmt.Errorf("lookup vendor user_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_id = $1", userID); err != nil {
		return nil, fmt.Errorf("set actor_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_role = 'vendor'"); err != nil {
		return nil, fmt.Errorf("set actor_role: %w", err)
	}

	query := `
		UPDATE vendor_products SET
			name = $1, description = $2, category = $3, image_url = $4,
			is_available = $5, updated_at = NOW()
		WHERE id = $6 AND deleted_at IS NULL
		RETURNING id, vendor_id, name, description, category, image_url, is_available, created_at, updated_at
	`
	err = tx.QueryRow(ctx, query,
		p.Name, p.Description, p.Category, p.ImageURL, p.IsAvailable, p.ID,
	).Scan(
		&p.ID, &p.VendorID, &p.Name, &p.Description, &p.Category,
		&p.ImageURL, &p.IsAvailable, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, vendor.ErrProductNotFound
		}
		return nil, fmt.Errorf("update product: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit: %w", err)
	}
	return p, nil
}

// FindProductByID returns a product by ID.
func (r *PgVendorRepository) FindProductByID(ctx context.Context, id domain.ProductID) (*vendor.ProductRecord, error) {
	query := `
		SELECT id, vendor_id, name, description, category, image_url, is_available, created_at, updated_at
		FROM vendor_products
		WHERE id = $1 AND deleted_at IS NULL
	`
	p := &vendor.ProductRecord{}
	err := r.pool.QueryRow(ctx, query, id.String()).Scan(
		&p.ID, &p.VendorID, &p.Name, &p.Description, &p.Category,
		&p.ImageURL, &p.IsAvailable, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, vendor.ErrProductNotFound
		}
		return nil, fmt.Errorf("find product by id: %w", err)
	}
	return p, nil
}

// FindProductsByVendorID returns all products for a vendor.
func (r *PgVendorRepository) FindProductsByVendorID(ctx context.Context, vendorID domain.VendorID) ([]*vendor.ProductRecord, error) {
	query := `
		SELECT id, vendor_id, name, description, category, image_url, is_available, created_at, updated_at
		FROM vendor_products
		WHERE vendor_id = $1 AND deleted_at IS NULL
		ORDER BY name
	`
	rows, err := r.pool.Query(ctx, query, vendorID.String())
	if err != nil {
		return nil, fmt.Errorf("find products by vendor_id: %w", err)
	}
	defer rows.Close()

	var products []*vendor.ProductRecord
	for rows.Next() {
		p := &vendor.ProductRecord{}
		if err := rows.Scan(
			&p.ID, &p.VendorID, &p.Name, &p.Description, &p.Category,
			&p.ImageURL, &p.IsAvailable, &p.CreatedAt, &p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan product: %w", err)
		}
		products = append(products, p)
	}
	return products, nil
}

// DeleteProduct soft-deletes a product.
func (r *PgVendorRepository) DeleteProduct(ctx context.Context, id domain.ProductID) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	// Look up user_id from vendor for audit
	var userID string
	if err := tx.QueryRow(ctx, "SELECT v.user_id FROM vendors v JOIN vendor_products vp ON vp.vendor_id = v.id WHERE vp.id = $1", id.String()).Scan(&userID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return vendor.ErrProductNotFound
		}
		return fmt.Errorf("lookup vendor user_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_id = $1", userID); err != nil {
		return fmt.Errorf("set actor_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_role = 'vendor'"); err != nil {
		return fmt.Errorf("set actor_role: %w", err)
	}

	result, err := tx.Exec(ctx, "UPDATE vendor_products SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL", id.String())
	if err != nil {
		return fmt.Errorf("delete product: %w", err)
	}
	if result.RowsAffected() == 0 {
		return vendor.ErrProductNotFound
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("commit: %w", err)
	}
	return nil
}

// SearchMarkets searches markets with optional distance filtering.
func (r *PgVendorRepository) SearchMarkets(ctx context.Context, searchTerm string, lat, lng, radiusKm *float64, limit, offset *int32) ([]vendor.MarketSearchRow, error) {
	// Build query with optional distance calculation
	hasCoords := lat != nil && lng != nil
	var query string

	if hasCoords {
		query = `
			SELECT m.id,
			       (6371 * acos(cos(radians($4)) * cos(radians(m.latitude))
			        * cos(radians(m.longitude) - radians($5))
			        + sin(radians($4)) * sin(radians(m.latitude)))) AS distance_km,
			       COALESCE(vc.vendor_count, 0) AS vendor_count
			FROM markets m
			LEFT JOIN (
				SELECT market_id, COUNT(DISTINCT vendor_id) AS vendor_count
				FROM vendor_roster WHERE deleted_at IS NULL AND status IN ('approved', 'committed')
				GROUP BY market_id
			) vc ON vc.market_id = m.id
			WHERE m.deleted_at IS NULL
			  AND m.status = 'active'
			  AND ($1 = '' OR m.name ILIKE '%' || $1 || '%' OR m.address ILIKE '%' || $1 || '%')
		`
		if radiusKm != nil {
			query += " AND (6371 * acos(cos(radians($4)) * cos(radians(m.latitude)) * cos(radians(m.longitude) - radians($5)) + sin(radians($4)) * sin(radians(m.latitude)))) <= $6"
		}
		query += " ORDER BY distance_km"
	} else {
		query = `
			SELECT m.id,
			       NULL::float8 AS distance_km,
			       COALESCE(vc.vendor_count, 0) AS vendor_count
			FROM markets m
			LEFT JOIN (
				SELECT market_id, COUNT(DISTINCT vendor_id) AS vendor_count
				FROM vendor_roster WHERE deleted_at IS NULL AND status IN ('approved', 'committed')
				GROUP BY market_id
			) vc ON vc.market_id = m.id
			WHERE m.deleted_at IS NULL
			  AND m.status = 'active'
			  AND ($1 = '' OR m.name ILIKE '%' || $1 || '%' OR m.address ILIKE '%' || $1 || '%')
			ORDER BY m.name
		`
	}

	lim := int32(20)
	if limit != nil {
		lim = *limit
	}
	off := int32(0)
	if offset != nil {
		off = *offset
	}

	// Build args list and add parameterized LIMIT/OFFSET
	var args []any
	var rows pgx.Rows
	var qerr error
	if hasCoords {
		if radiusKm != nil {
			query += " LIMIT $7 OFFSET $8"
			args = []any{searchTerm, nil, nil, *lat, *lng, *radiusKm, lim, off}
		} else {
			query += " LIMIT $6 OFFSET $7"
			args = []any{searchTerm, nil, nil, *lat, *lng, lim, off}
		}
	} else {
		query += " LIMIT $2 OFFSET $3"
		args = []any{searchTerm, lim, off}
	}
	rows, qerr = r.pool.Query(ctx, query, args...)
	if qerr != nil {
		return nil, fmt.Errorf("search markets: %w", qerr)
	}
	defer rows.Close()

	var results []vendor.MarketSearchRow
	for rows.Next() {
		var row vendor.MarketSearchRow
		if err := rows.Scan(&row.MarketID, &row.DistanceKm, &row.VendorCount); err != nil {
			return nil, fmt.Errorf("scan market search row: %w", err)
		}
		results = append(results, row)
	}
	return results, nil
}

// GetVendorMarketDates returns roster entries for a vendor (by user ID, since vendor_roster references users).
func (r *PgVendorRepository) GetVendorMarketDates(ctx context.Context, userID domain.UserID) ([]vendor.VendorMarketDateRow, error) {
	query := `
		SELECT vr.id, vr.market_id, vr.date::text, vr.status
		FROM vendor_roster vr
		WHERE vr.vendor_id = $1 AND vr.deleted_at IS NULL
		ORDER BY vr.market_id, vr.date
	`
	rows, err := r.pool.Query(ctx, query, userID.String())
	if err != nil {
		return nil, fmt.Errorf("get vendor market dates: %w", err)
	}
	defer rows.Close()

	var results []vendor.VendorMarketDateRow
	for rows.Next() {
		var row vendor.VendorMarketDateRow
		if err := rows.Scan(&row.ID, &row.MarketID, &row.Date, &row.Status); err != nil {
			return nil, fmt.Errorf("scan vendor market date: %w", err)
		}
		results = append(results, row)
	}
	return results, nil
}
