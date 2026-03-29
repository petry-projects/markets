// Package auth provides Firebase JWT authentication middleware and context helpers.
package auth

import "context"

type contextKey string

const (
	userIDKey contextKey = "userID"
	roleKey   contextKey = "role"
)

// UserIDFromContext extracts the authenticated user's UID from the request context.
func UserIDFromContext(ctx context.Context) string {
	uid, _ := ctx.Value(userIDKey).(string)
	return uid
}

// RoleFromContext extracts the authenticated user's role from the request context.
func RoleFromContext(ctx context.Context) string {
	role, _ := ctx.Value(roleKey).(string)
	return role
}

// WithUser adds the user ID and role to the context.
func WithUser(ctx context.Context, uid, role string) context.Context {
	ctx = context.WithValue(ctx, userIDKey, uid)
	ctx = context.WithValue(ctx, roleKey, role)
	return ctx
}
