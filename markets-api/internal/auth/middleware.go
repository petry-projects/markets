package auth

import (
	"context"
	"net/http"
	"strings"

	firebaseauth "firebase.google.com/go/v4/auth"
)

// TokenVerifier abstracts Firebase token verification for testability.
type TokenVerifier interface {
	VerifyIDToken(ctx context.Context, idToken string) (*firebaseauth.Token, error)
}

// NewMiddleware creates an HTTP middleware that validates Firebase JWT tokens.
// It extracts the bearer token from the Authorization header, validates it,
// and stores the user's UID and role in the request context.
func NewMiddleware(verifier TokenVerifier) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			token := extractBearerToken(r)
			if token == "" {
				http.Error(w,
					`{"errors":[{"message":"missing authorization","extensions":{"code":"UNAUTHENTICATED"}}]}`,
					http.StatusUnauthorized,
				)
				return
			}

			verified, err := verifier.VerifyIDToken(r.Context(), token)
			if err != nil {
				http.Error(w,
					`{"errors":[{"message":"invalid token","extensions":{"code":"UNAUTHENTICATED"}}]}`,
					http.StatusUnauthorized,
				)
				return
			}

			uid := verified.UID
			role, _ := verified.Claims["role"].(string)

			ctx := WithUser(r.Context(), uid, role)
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

	return parts[1]
}
