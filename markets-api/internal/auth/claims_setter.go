package auth

import "context"

// ClaimsSetter abstracts setting custom claims on Firebase user tokens.
// This interface allows mocking in tests without the Firebase Admin SDK.
type ClaimsSetter interface {
	SetCustomUserClaims(ctx context.Context, uid string, claims map[string]interface{}) error
}
