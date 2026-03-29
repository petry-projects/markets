// Package gqlerr provides structured GraphQL error helpers with extension codes.
package gqlerr

import (
	"encoding/json"
	"net/http"
)

// Code represents a GraphQL error extension code.
type Code string

const (
	// CodeUnauthenticated indicates missing or invalid authentication.
	CodeUnauthenticated Code = "UNAUTHENTICATED"
	// CodeForbidden indicates valid auth but insufficient permissions.
	CodeForbidden Code = "FORBIDDEN"
)

// graphQLErrorResponse is the JSON structure for GraphQL error responses.
type graphQLErrorResponse struct {
	Errors []graphQLError `json:"errors"`
}

type graphQLError struct {
	Message    string                 `json:"message"`
	Extensions map[string]interface{} `json:"extensions"`
}

// WriteError writes a structured GraphQL error response with the given code and message.
func WriteError(w http.ResponseWriter, code Code, message string, status int) {
	resp := graphQLErrorResponse{
		Errors: []graphQLError{
			{
				Message: message,
				Extensions: map[string]interface{}{
					"code": string(code),
				},
			},
		},
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)

	// Best-effort write; if encoding fails the status is already sent
	_ = json.NewEncoder(w).Encode(resp)
}

// Unauthenticated writes an UNAUTHENTICATED GraphQL error response.
func Unauthenticated(w http.ResponseWriter, message string) {
	WriteError(w, CodeUnauthenticated, message, http.StatusUnauthorized)
}

// Forbidden writes a FORBIDDEN GraphQL error response.
func Forbidden(w http.ResponseWriter, message string) {
	WriteError(w, CodeForbidden, message, http.StatusForbidden)
}
