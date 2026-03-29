package auth

import (
	"testing"

	firebaseauth "firebase.google.com/go/v4/auth"
	"github.com/petry-projects/markets-api/internal/domain"
)

func TestExtractUser_WithRole(t *testing.T) {
	token := &firebaseauth.Token{
		UID: "user-abc-123",
		Claims: map[string]interface{}{
			"role": "vendor",
		},
	}

	uid, role := ExtractUser(token)

	if uid != domain.UserID("user-abc-123") {
		t.Errorf("expected uid 'user-abc-123', got '%s'", uid)
	}
	if role != "vendor" {
		t.Errorf("expected role 'vendor', got '%s'", role)
	}
}

func TestExtractUser_WithoutRole(t *testing.T) {
	token := &firebaseauth.Token{
		UID:    "new-user-456",
		Claims: map[string]interface{}{},
	}

	uid, role := ExtractUser(token)

	if uid != domain.UserID("new-user-456") {
		t.Errorf("expected uid 'new-user-456', got '%s'", uid)
	}
	if role != "" {
		t.Errorf("expected empty role, got '%s'", role)
	}
}

func TestExtractUser_CustomerRole(t *testing.T) {
	token := &firebaseauth.Token{
		UID: "customer-789",
		Claims: map[string]interface{}{
			"role": "customer",
		},
	}

	uid, role := ExtractUser(token)

	if uid != domain.UserID("customer-789") {
		t.Errorf("expected uid 'customer-789', got '%s'", uid)
	}
	if role != "customer" {
		t.Errorf("expected role 'customer', got '%s'", role)
	}
}

func TestExtractUser_ManagerRole(t *testing.T) {
	token := &firebaseauth.Token{
		UID: "manager-101",
		Claims: map[string]interface{}{
			"role": "manager",
		},
	}

	uid, role := ExtractUser(token)

	if uid != domain.UserID("manager-101") {
		t.Errorf("expected uid 'manager-101', got '%s'", uid)
	}
	if role != "manager" {
		t.Errorf("expected role 'manager', got '%s'", role)
	}
}

func TestExtractUser_InvalidRoleType(t *testing.T) {
	token := &firebaseauth.Token{
		UID: "bad-role-user",
		Claims: map[string]interface{}{
			"role": 42, // not a string
		},
	}

	uid, role := ExtractUser(token)

	if uid != domain.UserID("bad-role-user") {
		t.Errorf("expected uid 'bad-role-user', got '%s'", uid)
	}
	if role != "" {
		t.Errorf("expected empty role for non-string claim, got '%s'", role)
	}
}
