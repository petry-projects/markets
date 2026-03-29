//go:build integration

package db

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Test 1.5.7: Soft-deleted records are excluded from query results.
//
// Inserts a user with deleted_at set, then queries with FindByFirebaseUID.
// The soft-deleted user should NOT be found.
func TestSoftDeleteFilter_ExcludesDeletedUsers(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping integration test")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	repo := NewPgUserRepository(pool)

	// Insert a user with deleted_at set (simulating a soft-deleted user)
	firebaseUID := "soft-delete-test-" + time.Now().Format("20060102150405")
	deletedAt := time.Now().UTC()

	_, err = pool.Exec(ctx, `
		INSERT INTO users (firebase_uid, role, name, email, deleted_at)
		VALUES ($1, $2, $3, $4, $5)
	`, firebaseUID, "customer", "Deleted User", "deleted@example.com", deletedAt)
	if err != nil {
		t.Fatalf("failed to insert soft-deleted user: %v", err)
	}

	// Cleanup after test
	t.Cleanup(func() {
		_, _ = pool.Exec(ctx, "DELETE FROM users WHERE firebase_uid = $1", firebaseUID)
	})

	// Query for the user -- should NOT be found due to soft-delete filter
	_, err = repo.FindByFirebaseUID(ctx, firebaseUID)
	if err == nil {
		t.Fatal("expected ErrUserNotFound for soft-deleted user, got nil")
	}
	if err != ErrUserNotFound {
		t.Fatalf("expected ErrUserNotFound, got: %v", err)
	}
}

// Test 1.5.12: SQL injection in user ID is safely parameterized.
//
// Passes a malicious SQL injection payload as the firebase_uid parameter.
// The parameterized query should safely handle it without executing the injection.
func TestSQLInjection_UserIDSafelyParameterized(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping integration test")
	}

	ctx := context.Background()
	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}
	defer pool.Close()

	repo := NewPgUserRepository(pool)

	// Attempt SQL injection via firebase_uid parameter
	maliciousUID := "'; DROP TABLE users; --"

	// This should simply not find a user, NOT execute the injection
	_, err = repo.FindByFirebaseUID(ctx, maliciousUID)
	if err == nil {
		t.Fatal("expected ErrUserNotFound for injection payload, got nil")
	}
	if err != ErrUserNotFound {
		t.Fatalf("expected ErrUserNotFound, got: %v", err)
	}

	// Verify the users table still exists by running a harmless query
	var count int
	err = pool.QueryRow(ctx, "SELECT COUNT(*) FROM users").Scan(&count)
	if err != nil {
		t.Fatalf("users table appears damaged after SQL injection attempt: %v", err)
	}
}
