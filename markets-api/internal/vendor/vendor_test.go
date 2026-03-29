package vendor

import (
	"testing"

	"github.com/petry-projects/markets-api/internal/domain"
)

func TestNewVendor_ValidInput(t *testing.T) {
	v, err := NewVendor(NewVendorParams{
		UserID:       domain.UserID("user-1"),
		BusinessName: "Farm Fresh",
		Description:  "Organic produce",
		ContactInfo:  "555-0100",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if v.BusinessName != "Farm Fresh" {
		t.Errorf("expected business name 'Farm Fresh', got %q", v.BusinessName)
	}
	if v.UserID != "user-1" {
		t.Errorf("expected user ID 'user-1', got %q", v.UserID)
	}
}

func TestNewVendor_EmptyBusinessName(t *testing.T) {
	_, err := NewVendor(NewVendorParams{
		UserID:       domain.UserID("user-1"),
		BusinessName: "",
	})
	if err != ErrInvalidBusinessName {
		t.Errorf("expected ErrInvalidBusinessName, got %v", err)
	}
}

func TestNewVendor_WhitespaceBusinessName(t *testing.T) {
	_, err := NewVendor(NewVendorParams{
		UserID:       domain.UserID("user-1"),
		BusinessName: "   ",
	})
	if err != ErrInvalidBusinessName {
		t.Errorf("expected ErrInvalidBusinessName, got %v", err)
	}
}

func TestNewVendor_TrimsFields(t *testing.T) {
	v, err := NewVendor(NewVendorParams{
		UserID:          domain.UserID("user-1"),
		BusinessName:    "  Farm Fresh  ",
		Description:     "  desc  ",
		InstagramHandle: "  @farm  ",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if v.BusinessName != "Farm Fresh" {
		t.Errorf("expected trimmed name, got %q", v.BusinessName)
	}
	if v.Description != "desc" {
		t.Errorf("expected trimmed description, got %q", v.Description)
	}
	if v.InstagramHandle != "@farm" {
		t.Errorf("expected trimmed handle, got %q", v.InstagramHandle)
	}
}

func TestVendorUpdate_PartialFields(t *testing.T) {
	v, _ := NewVendor(NewVendorParams{
		UserID:       domain.UserID("user-1"),
		BusinessName: "Original",
		Description:  "Original desc",
	})

	newName := "Updated"
	err := v.Update(UpdateVendorParams{
		BusinessName: &newName,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if v.BusinessName != "Updated" {
		t.Errorf("expected 'Updated', got %q", v.BusinessName)
	}
	if v.Description != "Original desc" {
		t.Errorf("description should be unchanged, got %q", v.Description)
	}
}

func TestVendorUpdate_EmptyBusinessName(t *testing.T) {
	v, _ := NewVendor(NewVendorParams{
		UserID:       domain.UserID("user-1"),
		BusinessName: "Original",
	})

	empty := ""
	err := v.Update(UpdateVendorParams{
		BusinessName: &empty,
	})
	if err != ErrInvalidBusinessName {
		t.Errorf("expected ErrInvalidBusinessName, got %v", err)
	}
}

func TestNewProduct_ValidInput(t *testing.T) {
	p, err := NewProduct(NewProductParams{
		VendorID:    domain.VendorID("v-1"),
		Name:        "Tomatoes",
		Category:    "Produce",
		Description: "Heirloom tomatoes",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Name != "Tomatoes" {
		t.Errorf("expected 'Tomatoes', got %q", p.Name)
	}
	if !p.IsAvailable {
		t.Error("expected new product to be available by default")
	}
}

func TestNewProduct_EmptyName(t *testing.T) {
	_, err := NewProduct(NewProductParams{
		VendorID: domain.VendorID("v-1"),
		Name:     "",
	})
	if err != ErrInvalidProductName {
		t.Errorf("expected ErrInvalidProductName, got %v", err)
	}
}

func TestProductUpdate_PartialFields(t *testing.T) {
	p, _ := NewProduct(NewProductParams{
		VendorID: domain.VendorID("v-1"),
		Name:     "Tomatoes",
		Category: "Produce",
	})

	newDesc := "Fresh organic"
	err := p.Update(UpdateProductParams{
		Description: &newDesc,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.Description != "Fresh organic" {
		t.Errorf("expected 'Fresh organic', got %q", p.Description)
	}
	if p.Name != "Tomatoes" {
		t.Errorf("name should be unchanged, got %q", p.Name)
	}
}

func TestProductUpdate_EmptyName(t *testing.T) {
	p, _ := NewProduct(NewProductParams{
		VendorID: domain.VendorID("v-1"),
		Name:     "Tomatoes",
	})

	empty := ""
	err := p.Update(UpdateProductParams{
		Name: &empty,
	})
	if err != ErrInvalidProductName {
		t.Errorf("expected ErrInvalidProductName, got %v", err)
	}
}

func TestProductUpdate_SetAvailability(t *testing.T) {
	p, _ := NewProduct(NewProductParams{
		VendorID: domain.VendorID("v-1"),
		Name:     "Tomatoes",
	})

	unavailable := false
	err := p.Update(UpdateProductParams{
		IsAvailable: &unavailable,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if p.IsAvailable {
		t.Error("expected product to be unavailable")
	}
}
