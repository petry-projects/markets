package graph

import (
	"github.com/petry-projects/markets-api/internal/graph/model"
	"github.com/petry-projects/markets-api/internal/vendor"
)

// vendorToModel converts a domain VendorRecord to a GraphQL model Vendor.
func vendorToModel(v *vendor.VendorRecord) *model.Vendor {
	return &model.Vendor{
		ID:              v.ID.String(),
		UserID:          v.UserID.String(),
		BusinessName:    v.BusinessName,
		Description:     stringToPtr(v.Description),
		ContactInfo:     stringToPtr(v.ContactInfo),
		InstagramHandle: stringToPtr(v.InstagramHandle),
		FacebookURL:     stringToPtr(v.FacebookURL),
		WebsiteURL:      stringToPtr(v.WebsiteURL),
		ImageURL:        stringToPtr(v.ImageURL),
		Products:        []*model.Product{},
		CheckIns:        []*model.CheckIn{},
		CreatedAt:       v.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       v.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// productToModel converts a domain ProductRecord to a GraphQL model Product.
func productToModel(p *vendor.ProductRecord) *model.Product {
	return &model.Product{
		ID:          p.ID.String(),
		VendorID:    p.VendorID.String(),
		Name:        p.Name,
		Description: stringToPtr(p.Description),
		Category:    stringToPtr(p.Category),
		ImageURL:    stringToPtr(p.ImageURL),
		IsAvailable: p.IsAvailable,
		CreatedAt:   p.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   p.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}
