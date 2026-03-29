//go:build integration

package auth_test

import (
	"context"
	"os"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/petry-projects/markets-api/internal/auth"
)

// Test case 1.2.7: Session variables set (app.actor_id, app.actor_role)
// This integration test requires a running PostgreSQL database.
// Run with: go test -tags=integration ./internal/auth/
func TestSetSessionVars_SetsPostgresVariables(t *testing.T) {
	dsn := os.Getenv("TEST_DATABASE_URL")
	if dsn == "" {
		t.Skip("TEST_DATABASE_URL not set; skipping integration test")
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, dsn)
	if err != nil {
		t.Fatalf("failed to connect to database: %v", err)
	}
	defer conn.Close(ctx)

	tx, err := conn.Begin(ctx)
	if err != nil {
		t.Fatalf("failed to begin transaction: %v", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	// Set session variables
	err = auth.SetSessionVars(ctx, tx, "test-user-123", "vendor")
	if err != nil {
		t.Fatalf("SetSessionVars failed: %v", err)
	}

	// Verify actor_id was set
	var actorID string
	err = tx.QueryRow(ctx, "SELECT current_setting('app.actor_id')").Scan(&actorID)
	if err != nil {
		t.Fatalf("failed to read app.actor_id: %v", err)
	}
	if actorID != "test-user-123" {
		t.Errorf("expected actor_id 'test-user-123', got '%s'", actorID)
	}

	// Verify actor_role was set
	var actorRole string
	err = tx.QueryRow(ctx, "SELECT current_setting('app.actor_role')").Scan(&actorRole)
	if err != nil {
		t.Fatalf("failed to read app.actor_role: %v", err)
	}
	if actorRole != "vendor" {
		t.Errorf("expected actor_role 'vendor', got '%s'", actorRole)
	}
}
