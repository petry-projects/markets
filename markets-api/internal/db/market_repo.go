package db

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/market"
)

// ErrDuplicateAssignment is returned when a manager is already assigned to the market.
var ErrDuplicateAssignment = errors.New("manager already assigned to this market")

// PgMarketRepository implements market.Repository using pgx against Cloud SQL.
type PgMarketRepository struct {
	pool *pgxpool.Pool
}

// NewPgMarketRepository creates a new PgMarketRepository.
func NewPgMarketRepository(pool *pgxpool.Pool) *PgMarketRepository {
	return &PgMarketRepository{pool: pool}
}

// IsManagerAssigned checks if a manager is assigned to a specific market.
func (r *PgMarketRepository) IsManagerAssigned(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM market_managers WHERE manager_id = $1 AND market_id = $2)`

	var exists bool
	err := r.pool.QueryRow(ctx, query, managerID.String(), marketID.String()).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check manager assignment: %w", err)
	}

	return exists, nil
}

// AssignManager inserts a manager-market assignment into the junction table.
func (r *PgMarketRepository) AssignManager(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) (*market.ManagerAssignment, error) {
	query := `
		INSERT INTO market_managers (manager_id, market_id)
		VALUES ($1, $2)
		RETURNING id, created_at
	`

	var id string
	var createdAt time.Time
	err := r.pool.QueryRow(ctx, query, managerID.String(), marketID.String()).Scan(&id, &createdAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrDuplicateAssignment
		}
		return nil, fmt.Errorf("assign manager: %w", err)
	}

	return &market.ManagerAssignment{
		ID:        id,
		ManagerID: managerID,
		MarketID:  marketID,
		CreatedAt: createdAt,
	}, nil
}

// RemoveManager deletes a manager-market assignment from the junction table.
func (r *PgMarketRepository) RemoveManager(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) error {
	query := `DELETE FROM market_managers WHERE manager_id = $1 AND market_id = $2`

	result, err := r.pool.Exec(ctx, query, managerID.String(), marketID.String())
	if err != nil {
		return fmt.Errorf("remove manager: %w", err)
	}

	if result.RowsAffected() == 0 {
		return market.ErrManagerNotAssigned
	}

	return nil
}

// GetManagersByMarket returns all manager assignments for a given market.
func (r *PgMarketRepository) GetManagersByMarket(ctx context.Context, marketID domain.MarketID) ([]market.ManagerAssignment, error) {
	query := `
		SELECT id, manager_id, market_id, created_at
		FROM market_managers
		WHERE market_id = $1
		ORDER BY created_at
	`

	rows, err := r.pool.Query(ctx, query, marketID.String())
	if err != nil {
		return nil, fmt.Errorf("get managers by market: %w", err)
	}
	defer rows.Close()

	var assignments []market.ManagerAssignment
	for rows.Next() {
		var a market.ManagerAssignment
		var id, managerID, mktID string
		if err := rows.Scan(&id, &managerID, &mktID, &a.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan manager assignment: %w", err)
		}
		a.ID = id
		a.ManagerID = domain.UserID(managerID)
		a.MarketID = domain.MarketID(mktID)
		assignments = append(assignments, a)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate manager assignments: %w", err)
	}

	return assignments, nil
}

