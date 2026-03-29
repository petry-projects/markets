package graph_test

import (
	"context"
	"testing"
	"time"

	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/events"
	"github.com/petry-projects/markets-api/internal/graph"
	"github.com/petry-projects/markets-api/internal/graph/model"
	"github.com/petry-projects/markets-api/internal/vendor"
)

// --- Mock vendor repository ---

type mockVendorRepo struct {
	vendors  []*vendor.VendorRecord
	products []*vendor.ProductRecord
}

func (m *mockVendorRepo) CreateVendor(_ context.Context, v *vendor.VendorRecord) (*vendor.VendorRecord, error) {
	v.ID = domain.VendorID("generated-vendor-id")
	v.CreatedAt = time.Now()
	v.UpdatedAt = time.Now()
	m.vendors = append(m.vendors, v)
	return v, nil
}

func (m *mockVendorRepo) UpdateVendor(_ context.Context, v *vendor.VendorRecord) (*vendor.VendorRecord, error) {
	v.UpdatedAt = time.Now()
	return v, nil
}

func (m *mockVendorRepo) FindVendorByID(_ context.Context, id domain.VendorID) (*vendor.VendorRecord, error) {
	for _, v := range m.vendors {
		if v.ID == id {
			return v, nil
		}
	}
	return nil, vendor.ErrVendorNotFound
}

func (m *mockVendorRepo) FindVendorByUserID(_ context.Context, userID domain.UserID) (*vendor.VendorRecord, error) {
	for _, v := range m.vendors {
		if v.UserID == userID {
			return v, nil
		}
	}
	return nil, vendor.ErrVendorNotFound
}

func (m *mockVendorRepo) CreateProduct(_ context.Context, p *vendor.ProductRecord) (*vendor.ProductRecord, error) {
	p.ID = domain.ProductID("generated-product-id")
	p.CreatedAt = time.Now()
	p.UpdatedAt = time.Now()
	m.products = append(m.products, p)
	return p, nil
}

func (m *mockVendorRepo) UpdateProduct(_ context.Context, p *vendor.ProductRecord) (*vendor.ProductRecord, error) {
	p.UpdatedAt = time.Now()
	return p, nil
}

func (m *mockVendorRepo) FindProductByID(_ context.Context, id domain.ProductID) (*vendor.ProductRecord, error) {
	for _, p := range m.products {
		if p.ID == id {
			return p, nil
		}
	}
	return nil, vendor.ErrProductNotFound
}

func (m *mockVendorRepo) FindProductsByVendorID(_ context.Context, vendorID domain.VendorID) ([]*vendor.ProductRecord, error) {
	var result []*vendor.ProductRecord
	for _, p := range m.products {
		if p.VendorID == vendorID {
			result = append(result, p)
		}
	}
	return result, nil
}

func (m *mockVendorRepo) DeleteProduct(_ context.Context, id domain.ProductID) error {
	for i, p := range m.products {
		if p.ID == id {
			m.products = append(m.products[:i], m.products[i+1:]...)
			return nil
		}
	}
	return vendor.ErrProductNotFound
}

func (m *mockVendorRepo) SearchMarkets(_ context.Context, _ string, _, _, _ *float64, _, _ *int32) ([]vendor.MarketSearchRow, error) {
	return []vendor.MarketSearchRow{}, nil
}

func (m *mockVendorRepo) GetVendorMarketDates(_ context.Context, _ domain.UserID) ([]vendor.VendorMarketDateRow, error) {
	return []vendor.VendorMarketDateRow{}, nil
}

// --- Tests ---

func vendorCtx(uid, role string) context.Context {
	ctx := context.Background()
	ctx = auth.WithUser(ctx, uid, role)
	return ctx
}

func newVendorResolver(vendorRepo vendor.Repository) *graph.Resolver {
	bus := events.NewBus()
	return graph.NewResolverWithVendorRepo(nil, bus, nil, nil, nil, vendorRepo)
}

func TestCreateVendorProfile_Success(t *testing.T) {
	vendorRepo := &mockVendorRepo{}
	resolver := newVendorResolver(vendorRepo)
	ctx := vendorCtx("user-1", "vendor")

	result, err := resolver.Mutation().CreateVendorProfile(ctx, model.CreateVendorProfileInput{
		BusinessName: "Farm Fresh",
		Description:  strPtr("Organic produce"),
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.BusinessName != "Farm Fresh" {
		t.Errorf("expected 'Farm Fresh', got %q", result.BusinessName)
	}
	if result.ID != "generated-vendor-id" {
		t.Errorf("expected generated ID, got %q", result.ID)
	}
}

func TestCreateVendorProfile_NonVendorForbidden(t *testing.T) {
	vendorRepo := &mockVendorRepo{}
	resolver := newVendorResolver(vendorRepo)
	ctx := vendorCtx("user-1", "customer")

	_, err := resolver.Mutation().CreateVendorProfile(ctx, model.CreateVendorProfileInput{
		BusinessName: "Farm Fresh",
	})
	if err == nil {
		t.Fatal("expected error for non-vendor role")
	}
}

func TestCreateVendorProfile_EmptyNameValidation(t *testing.T) {
	vendorRepo := &mockVendorRepo{}
	resolver := newVendorResolver(vendorRepo)
	ctx := vendorCtx("user-1", "vendor")

	_, err := resolver.Mutation().CreateVendorProfile(ctx, model.CreateVendorProfileInput{
		BusinessName: "",
	})
	if err == nil {
		t.Fatal("expected validation error for empty business name")
	}
}

func TestUpdateVendorProfile_Success(t *testing.T) {
	vendorRepo := &mockVendorRepo{
		vendors: []*vendor.VendorRecord{
			{
				ID:           domain.VendorID("v-1"),
				UserID:       domain.UserID("user-1"),
				BusinessName: "Original",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
		},
	}
	resolver := newVendorResolver(vendorRepo)
	ctx := vendorCtx("user-1", "vendor")

	newName := "Updated Name"
	result, err := resolver.Mutation().UpdateVendorProfile(ctx, model.UpdateVendorProfileInput{
		BusinessName: &newName,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.BusinessName != "Updated Name" {
		t.Errorf("expected 'Updated Name', got %q", result.BusinessName)
	}
}

func TestCreateProduct_Success(t *testing.T) {
	vendorRepo := &mockVendorRepo{
		vendors: []*vendor.VendorRecord{
			{
				ID:           domain.VendorID("v-1"),
				UserID:       domain.UserID("user-1"),
				BusinessName: "Farm",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
		},
	}
	resolver := newVendorResolver(vendorRepo)
	ctx := vendorCtx("user-1", "vendor")

	result, err := resolver.Mutation().CreateProduct(ctx, model.CreateProductInput{
		Name:     "Tomatoes",
		Category: strPtr("Produce"),
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result.Name != "Tomatoes" {
		t.Errorf("expected 'Tomatoes', got %q", result.Name)
	}
	if !result.IsAvailable {
		t.Error("expected product to be available by default")
	}
}

func TestCreateProduct_NonVendorForbidden(t *testing.T) {
	vendorRepo := &mockVendorRepo{}
	resolver := newVendorResolver(vendorRepo)
	ctx := vendorCtx("user-1", "manager")

	_, err := resolver.Mutation().CreateProduct(ctx, model.CreateProductInput{
		Name: "Tomatoes",
	})
	if err == nil {
		t.Fatal("expected error for non-vendor role")
	}
}

func TestDeleteProduct_OwnershipCheck(t *testing.T) {
	vendorRepo := &mockVendorRepo{
		vendors: []*vendor.VendorRecord{
			{
				ID:           domain.VendorID("v-1"),
				UserID:       domain.UserID("user-1"),
				BusinessName: "Farm 1",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
			{
				ID:           domain.VendorID("v-2"),
				UserID:       domain.UserID("user-2"),
				BusinessName: "Farm 2",
				CreatedAt:    time.Now(),
				UpdatedAt:    time.Now(),
			},
		},
		products: []*vendor.ProductRecord{
			{
				ID:       domain.ProductID("p-1"),
				VendorID: domain.VendorID("v-2"), // belongs to user-2
				Name:     "Tomatoes",
			},
		},
	}
	resolver := newVendorResolver(vendorRepo)

	// user-1 tries to delete user-2's product
	ctx := vendorCtx("user-1", "vendor")
	_, err := resolver.Mutation().DeleteProduct(ctx, "p-1")
	if err == nil {
		t.Fatal("expected error when deleting another vendor's product")
	}
}

func TestMyVendorProfile_ReturnsNilWhenNoProfile(t *testing.T) {
	vendorRepo := &mockVendorRepo{}
	resolver := newVendorResolver(vendorRepo)
	ctx := vendorCtx("user-1", "vendor")

	result, err := resolver.Query().MyVendorProfile(ctx)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if result != nil {
		t.Error("expected nil when no profile exists")
	}
}

func TestVendorProducts_ReturnsList(t *testing.T) {
	vendorRepo := &mockVendorRepo{
		products: []*vendor.ProductRecord{
			{ID: domain.ProductID("p-1"), VendorID: domain.VendorID("v-1"), Name: "Tomatoes", IsAvailable: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
			{ID: domain.ProductID("p-2"), VendorID: domain.VendorID("v-1"), Name: "Peppers", IsAvailable: true, CreatedAt: time.Now(), UpdatedAt: time.Now()},
		},
	}
	resolver := newVendorResolver(vendorRepo)
	ctx := vendorCtx("user-1", "vendor")

	result, err := resolver.Query().VendorProducts(ctx, "v-1")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(result) != 2 {
		t.Errorf("expected 2 products, got %d", len(result))
	}
}

// strPtr is a helper for creating *string values in tests.
func strPtr(s string) *string {
	return &s
}
