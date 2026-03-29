package market

import (
	"context"

	"github.com/petry-projects/markets-api/internal/domain"
)

// Repository defines the port for market persistence operations.
// Domain code depends only on this interface; the infrastructure adapter
// (PgMarketRepository) implements it in internal/db/.
type Repository interface {
	// IsManagerAssigned checks if a manager is assigned to a specific market.
	IsManagerAssigned(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) (bool, error)

	// AssignManager inserts a manager-market assignment into the junction table.
	AssignManager(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) (*ManagerAssignment, error)

	// RemoveManager deletes a manager-market assignment from the junction table.
	RemoveManager(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) error

	// GetManagersByMarket returns all manager assignments for a given market.
	GetManagersByMarket(ctx context.Context, marketID domain.MarketID) ([]ManagerAssignment, error)
}
