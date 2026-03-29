package auth

import (
	firebaseauth "firebase.google.com/go/v4/auth"
	"github.com/petry-projects/markets-api/internal/domain"
)

// validRoles is the set of allowed role values.
var validRoles = map[string]bool{
	"customer": true,
	"vendor":   true,
	"manager":  true,
}

// ExtractUser maps Firebase JWT claims to domain types at the auth boundary.
// This is the anti-corruption layer between Firebase and our domain model.
// Unknown or missing roles are returned as empty string.
func ExtractUser(token *firebaseauth.Token) (domain.UserID, string) {
	uid := domain.UserID(token.UID)
	role, _ := token.Claims["role"].(string)
	if !validRoles[role] {
		return uid, ""
	}
	return uid, role
}

// ExtractEmail extracts the email from Firebase JWT claims.
// Returns empty string if no email claim is present.
func ExtractEmail(token *firebaseauth.Token) string {
	email, _ := token.Claims["email"].(string)
	return email
}
