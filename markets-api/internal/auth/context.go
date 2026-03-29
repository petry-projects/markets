// Package auth provides Firebase JWT authentication middleware and context helpers.
package auth

import "context"

type contextKey string

const (
	userIDKey contextKey = "userID"
	roleKey   contextKey = "role"
	emailKey  contextKey = "email"
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

// EmailFromContext extracts the authenticated user's email from the request context.
func EmailFromContext(ctx context.Context) string {
	email, _ := ctx.Value(emailKey).(string)
	return email
}

// WithUser adds the user ID and role to the context.
func WithUser(ctx context.Context, uid, role string) context.Context {
	ctx = context.WithValue(ctx, userIDKey, uid)
	ctx = context.WithValue(ctx, roleKey, role)
	return ctx
}

// WithEmail adds the user's email to the context.
func WithEmail(ctx context.Context, email string) context.Context {
	return context.WithValue(ctx, emailKey, email)
}
