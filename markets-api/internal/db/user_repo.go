package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/user"
)

// ErrDuplicateUser is returned when a user with the same firebase_uid already exists.
var ErrDuplicateUser = errors.New("user already exists")

// ErrUserNotFound is returned when a user lookup finds no matching record.
var ErrUserNotFound = errors.New("user not found")

// PgUserRepository implements user.Repository using pgx against Cloud SQL.
type PgUserRepository struct {
	pool *pgxpool.Pool
}

// NewPgUserRepository creates a new PgUserRepository.
func NewPgUserRepository(pool *pgxpool.Pool) *PgUserRepository {
	return &PgUserRepository{pool: pool}
}

// Create inserts a new user record. Returns ErrDuplicateUser if firebase_uid
// already exists (unique constraint violation with code 23505).
func (r *PgUserRepository) Create(ctx context.Context, u *user.User) error {
	query := `
		INSERT INTO users (firebase_uid, role, name, email)
		VALUES ($1, $2, $3, $4)
		RETURNING id, created_at
	`

	err := r.pool.QueryRow(ctx, query,
		u.FirebaseUID,
		u.Role,
		u.Name,
		u.Email,
	).Scan(&u.ID, &u.CreatedAt)

	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return ErrDuplicateUser
		}
		return fmt.Errorf("insert user: %w", err)
	}

	return nil
}

// FindByFirebaseUID looks up a non-deleted user by their Firebase UID.
// Returns ErrUserNotFound if no matching record exists.
func (r *PgUserRepository) FindByFirebaseUID(ctx context.Context, firebaseUID string) (*user.User, error) {
	query := `
		SELECT id, firebase_uid, role, name, email, created_at, deleted_at
		FROM users
		WHERE firebase_uid = $1 AND deleted_at IS NULL
	`

	var u user.User
	var id string
	var deletedAt *time.Time

	err := r.pool.QueryRow(ctx, query, firebaseUID).Scan(
		&id,
		&u.FirebaseUID,
		&u.Role,
		&u.Name,
		&u.Email,
		&u.CreatedAt,
		&deletedAt,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrUserNotFound
		}
		return nil, fmt.Errorf("find user by firebase uid: %w", err)
	}

	u.ID = domain.UserID(id)
	u.DeletedAt = deletedAt

	return &u, nil
}
