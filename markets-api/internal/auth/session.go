package auth

import (
	"context"

	"github.com/jackc/pgx/v5"
)

// SetSessionVars sets PostgreSQL session variables within a transaction
// so that the audit trigger function can read the actor's identity.
// This must be called at the beginning of every database transaction.
func SetSessionVars(ctx context.Context, tx pgx.Tx, uid string, role string) error {
	_, err := tx.Exec(
		ctx,
		"SELECT set_config('app.actor_id', $1, true), set_config('app.actor_role', $2, true)",
		uid,
		role,
	)
	return err
}
