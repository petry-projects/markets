// Package graph contains the GraphQL resolver implementations.
package graph

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/events"
	"github.com/petry-projects/markets-api/internal/user"
)

// Resolver is the root resolver struct with injected dependencies.
// It serves as the composition root for all GraphQL resolver methods.
type Resolver struct {
	Pool         *pgxpool.Pool
	EventBus     *events.Bus
	UserRepo     user.Repository
	ClaimsSetter auth.ClaimsSetter
}

// NewResolver creates a new Resolver with the provided dependencies.
func NewResolver(pool *pgxpool.Pool, eventBus *events.Bus, userRepo user.Repository, claimsSetter auth.ClaimsSetter) *Resolver {
	return &Resolver{
		Pool:         pool,
		EventBus:     eventBus,
		UserRepo:     userRepo,
		ClaimsSetter: claimsSetter,
	}
}
