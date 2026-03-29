package gqlerr

import (
	"github.com/vektah/gqlparser/v2/gqlerror"
)

// NewError creates a GraphQL error with an extension code for use in resolvers.
func NewError(code Code, message string) *gqlerror.Error {
	return &gqlerror.Error{
		Message: message,
		Extensions: map[string]interface{}{
			"code": string(code),
		},
	}
}

// ValidationError creates a VALIDATION_ERROR GraphQL error.
func ValidationError(message string) *gqlerror.Error {
	return NewError(CodeValidationError, message)
}

// Conflict creates a CONFLICT GraphQL error.
func Conflict(message string) *gqlerror.Error {
	return NewError(CodeConflict, message)
}

// Internal creates an INTERNAL GraphQL error.
func Internal(message string) *gqlerror.Error {
	return NewError(CodeInternal, message)
}
