package auth

import (
	"context"
	"net/http"
	"strings"

	firebaseauth "firebase.google.com/go/v4/auth"
	"github.com/petry-projects/markets-api/internal/gqlerr"
)

// TokenVerifier abstracts Firebase token verification for testability.
type TokenVerifier interface {
	VerifyIDToken(ctx context.Context, idToken string) (*firebaseauth.Token, error)
}

// NewMiddleware creates an HTTP middleware that validates Firebase JWT tokens.
// It extracts the bearer token from the Authorization header, validates it
// via the Firebase Admin SDK, and stores the user's UID and role in the
// request context for downstream resolver access.
//
// Returns a structured UNAUTHENTICATED GraphQL error for invalid, expired,
// malformed, missing, or wrong-issuer JWTs.
func NewMiddleware(verifier TokenVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractBearerToken(r)
			if token == "" {
				gqlerr.Unauthenticated(w, "missing authorization")
				return
			}

			verified, err := verifier.VerifyIDToken(r.Context(), token)
			if err != nil {
				gqlerr.Unauthenticated(w, "invalid token")
				return
			}

			uid, role := ExtractUser(verified)
			ctx := WithUser(r.Context(), uid.String(), role)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// extractBearerToken extracts the token from the "Authorization: Bearer <token>" header.
func extractBearerToken(r *http.Request) string {
	authHeader := r.Header.Get("Authorization")
	if authHeader == "" {
		return ""
	}

	parts := strings.SplitN(authHeader, " ", 2)
	if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
		return ""
	}

	return strings.TrimSpace(parts[1])
}
