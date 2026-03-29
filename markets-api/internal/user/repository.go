// Package user provides domain types and repository interfaces for user management.
package user

import (
	"context"
	"time"

	"github.com/petry-projects/markets-api/internal/domain"
)

// User represents a user in the domain model.
type User struct {
	ID          domain.UserID
	FirebaseUID string
	Role        string
	Name        string
	Email       string
	CreatedAt   time.Time
	DeletedAt   *time.Time
}

// Repository defines the port for user persistence operations.
// Domain code depends only on this interface; the infrastructure adapter
// (PgUserRepository) implements it in internal/db/.
type Repository interface {
	Create(ctx context.Context, user *User) error
	FindByFirebaseUID(ctx context.Context, firebaseUID string) (*User, error)
}
