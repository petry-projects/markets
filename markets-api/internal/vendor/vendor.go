// Package vendor provides the Vendor aggregate root and domain logic.
package vendor

import (
	"errors"
	"strings"
	"time"

	"github.com/petry-projects/markets-api/internal/domain"
)

var (
	ErrInvalidBusinessName = errors.New("business name is required")
	ErrVendorNotFound      = errors.New("vendor not found")
	ErrProductNotFound     = errors.New("product not found")
	ErrInvalidProductName  = errors.New("product name is required")
)

// VendorRecord represents a vendor profile in the system.
type VendorRecord struct {
	ID              domain.VendorID
	UserID          domain.UserID
	BusinessName    string
	Description     string
	ContactInfo     string
	InstagramHandle string
	FacebookURL     string
	WebsiteURL      string
	ImageURL        string
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

// NewVendorParams holds the input for creating a new vendor.
type NewVendorParams struct {
	UserID          domain.UserID
	BusinessName    string
	Description     string
	ContactInfo     string
	InstagramHandle string
	FacebookURL     string
	WebsiteURL      string
	ImageURL        string
}

// NewVendor creates a new VendorRecord with validation.
func NewVendor(p NewVendorParams) (*VendorRecord, error) {
	if strings.TrimSpace(p.BusinessName) == "" {
		return nil, ErrInvalidBusinessName
	}

	return &VendorRecord{
		UserID:          p.UserID,
		BusinessName:    strings.TrimSpace(p.BusinessName),
		Description:     strings.TrimSpace(p.Description),
		ContactInfo:     strings.TrimSpace(p.ContactInfo),
		InstagramHandle: strings.TrimSpace(p.InstagramHandle),
		FacebookURL:     strings.TrimSpace(p.FacebookURL),
		WebsiteURL:      strings.TrimSpace(p.WebsiteURL),
		ImageURL:        strings.TrimSpace(p.ImageURL),
	}, nil
}

// UpdateVendorParams holds the input for updating a vendor profile.
type UpdateVendorParams struct {
	BusinessName    *string
	Description     *string
	ContactInfo     *string
	InstagramHandle *string
	FacebookURL     *string
	WebsiteURL      *string
	ImageURL        *string
}

// Update applies partial updates to the vendor record.
func (v *VendorRecord) Update(p UpdateVendorParams) error {
	if p.BusinessName != nil {
		name := strings.TrimSpace(*p.BusinessName)
		if name == "" {
			return ErrInvalidBusinessName
		}
		v.BusinessName = name
	}
	if p.Description != nil {
		v.Description = strings.TrimSpace(*p.Description)
	}
	if p.ContactInfo != nil {
		v.ContactInfo = strings.TrimSpace(*p.ContactInfo)
	}
	if p.InstagramHandle != nil {
		v.InstagramHandle = strings.TrimSpace(*p.InstagramHandle)
	}
	if p.FacebookURL != nil {
		v.FacebookURL = strings.TrimSpace(*p.FacebookURL)
	}
	if p.WebsiteURL != nil {
		v.WebsiteURL = strings.TrimSpace(*p.WebsiteURL)
	}
	if p.ImageURL != nil {
		v.ImageURL = strings.TrimSpace(*p.ImageURL)
	}
	return nil
}

// ProductRecord represents a product in a vendor's catalog.
type ProductRecord struct {
	ID          domain.ProductID
	VendorID    domain.VendorID
	Name        string
	Description string
	Category    string
	ImageURL    string
	IsAvailable bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// NewProductParams holds the input for creating a new product.
type NewProductParams struct {
	VendorID    domain.VendorID
	Name        string
	Description string
	Category    string
	ImageURL    string
}

// NewProduct creates a new ProductRecord with validation.
func NewProduct(p NewProductParams) (*ProductRecord, error) {
	if strings.TrimSpace(p.Name) == "" {
		return nil, ErrInvalidProductName
	}

	return &ProductRecord{
		VendorID:    p.VendorID,
		Name:        strings.TrimSpace(p.Name),
		Description: strings.TrimSpace(p.Description),
		Category:    strings.TrimSpace(p.Category),
		ImageURL:    strings.TrimSpace(p.ImageURL),
		IsAvailable: true,
	}, nil
}

// UpdateProductParams holds the input for updating a product.
type UpdateProductParams struct {
	Name        *string
	Description *string
	Category    *string
	ImageURL    *string
	IsAvailable *bool
}

// Update applies partial updates to the product record.
func (p *ProductRecord) Update(params UpdateProductParams) error {
	if params.Name != nil {
		name := strings.TrimSpace(*params.Name)
		if name == "" {
			return ErrInvalidProductName
		}
		p.Name = name
	}
	if params.Description != nil {
		p.Description = strings.TrimSpace(*params.Description)
	}
	if params.Category != nil {
		p.Category = strings.TrimSpace(*params.Category)
	}
	if params.ImageURL != nil {
		p.ImageURL = strings.TrimSpace(*params.ImageURL)
	}
	if params.IsAvailable != nil {
		p.IsAvailable = *params.IsAvailable
	}
	return nil
}
