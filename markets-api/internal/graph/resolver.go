// Package graph contains the GraphQL resolver implementations.
package graph

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/customer"
	"github.com/petry-projects/markets-api/internal/events"
	"github.com/petry-projects/markets-api/internal/market"
	"github.com/petry-projects/markets-api/internal/notify"
	"github.com/petry-projects/markets-api/internal/user"
	"github.com/petry-projects/markets-api/internal/vendor"
)

// Resolver is the root resolver struct with injected dependencies.
// It serves as the composition root for all GraphQL resolver methods.
type Resolver struct {
	Pool         *pgxpool.Pool
	EventBus     *events.Bus
	UserRepo     user.Repository
	MarketRepo   market.Repository
	VendorRepo   vendor.Repository
	CustomerRepo customer.Repository
	NotifyRepo   notify.Repository
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

// NewResolverWithMarketRepo creates a new Resolver with all dependencies including market repo.
func NewResolverWithMarketRepo(pool *pgxpool.Pool, eventBus *events.Bus, userRepo user.Repository, claimsSetter auth.ClaimsSetter, marketRepo market.Repository) *Resolver {
	return &Resolver{
		Pool:         pool,
		EventBus:     eventBus,
		UserRepo:     userRepo,
		MarketRepo:   marketRepo,
		ClaimsSetter: claimsSetter,
	}
}

// NewResolverWithVendorRepo creates a new Resolver with all dependencies including vendor repo.
func NewResolverWithVendorRepo(pool *pgxpool.Pool, eventBus *events.Bus, userRepo user.Repository, claimsSetter auth.ClaimsSetter, marketRepo market.Repository, vendorRepo vendor.Repository) *Resolver {
	return &Resolver{
		Pool:         pool,
		EventBus:     eventBus,
		UserRepo:     userRepo,
		MarketRepo:   marketRepo,
		VendorRepo:   vendorRepo,
		ClaimsSetter: claimsSetter,
	}
}
