package auth

import (
	"context"

	"github.com/petry-projects/markets-api/internal/gqlerr"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// RequireRole checks that the authenticated user's role (from the request context)
// is one of the allowedRoles. Returns nil if authorized, or a FORBIDDEN GraphQL
// error if the user's role is not in the allowed set.
//
// This function is designed to be called at the top of every resolver to enforce
// role-based access control. The role is populated by the JWT middleware (Story 1.2).
func RequireRole(ctx context.Context, allowedRoles ...string) error {
	role := RoleFromContext(ctx)
	if role == "" {
		return gqlerr.NewError(gqlerr.CodeForbidden, "access denied")
	}

	for _, allowed := range allowedRoles {
		if role == allowed {
			return nil
		}
	}

	return gqlerr.NewError(gqlerr.CodeForbidden, "access denied")
}

// RequireAuth checks that the request context contains an authenticated user.
// Returns the user ID if present, or an UNAUTHENTICATED error if not.
func RequireAuth(ctx context.Context) (string, *gqlerror.Error) {
	uid := UserIDFromContext(ctx)
	if uid == "" {
		return "", gqlerr.NewError(gqlerr.CodeUnauthenticated, "authentication required")
	}
	return uid, nil
}
