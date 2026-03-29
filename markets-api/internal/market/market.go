// Package market provides the Market aggregate root and domain logic.
package market

import (
	"errors"
	"time"

	"github.com/petry-projects/markets-api/internal/domain"
)

// ErrMinimumManagersRequired is returned when removing a manager would leave
// fewer than the required minimum of 2 managers per market.
var ErrMinimumManagersRequired = errors.New("market requires minimum 2 managers")

// ErrManagerAlreadyAssigned is returned when trying to assign a manager
// who is already assigned to the market.
var ErrManagerAlreadyAssigned = errors.New("manager already assigned to this market")

// ErrManagerNotAssigned is returned when trying to remove a manager
// who is not assigned to the market.
var ErrManagerNotAssigned = errors.New("manager not assigned to this market")

// MinManagers is the minimum number of managers a market must have.
const MinManagers = 2

// ManagerAssignment represents a manager's assignment to a market.
type ManagerAssignment struct {
	ID        string
	ManagerID domain.UserID
	MarketID  domain.MarketID
	CreatedAt time.Time
}

// Market is the aggregate root for market domain logic.
type Market struct {
	ID       domain.MarketID
	Managers []ManagerAssignment
}

// RemoveManager removes a manager from the market. Returns
// ErrMinimumManagersRequired if removal would leave fewer than 2 managers.
// Returns ErrManagerNotAssigned if the manager is not assigned.
func (m *Market) RemoveManager(managerID domain.UserID) error {
	if len(m.Managers) <= MinManagers {
		return ErrMinimumManagersRequired
	}

	found := false
	for _, ma := range m.Managers {
		if ma.ManagerID == managerID {
			found = true
			break
		}
	}
	if !found {
		return ErrManagerNotAssigned
	}

	remaining := make([]ManagerAssignment, 0, len(m.Managers)-1)
	for _, ma := range m.Managers {
		if ma.ManagerID != managerID {
			remaining = append(remaining, ma)
		}
	}
	m.Managers = remaining
	return nil
}
