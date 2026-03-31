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

	// CreateMarket inserts a new market and assigns the creating manager atomically.
	CreateMarket(ctx context.Context, m *MarketRecord, managerID domain.UserID, recoveryContact string) (*MarketRecord, error)

	// UpdateMarket persists changes to an existing market.
	UpdateMarket(ctx context.Context, m *MarketRecord) (*MarketRecord, error)

	// FindMarketByID returns a market by its ID, excluding soft-deleted records.
	FindMarketByID(ctx context.Context, id domain.MarketID) (*MarketRecord, error)

	// FindMarketsByManagerID returns all markets assigned to a manager.
	FindMarketsByManagerID(ctx context.Context, managerID domain.UserID) ([]*MarketRecord, error)

	// ListMarkets returns markets with optional pagination.
	ListMarkets(ctx context.Context, limit *int32, offset *int32) ([]*MarketRecord, error)

	// CreateSchedule inserts a new schedule entry.
	CreateSchedule(ctx context.Context, s *ScheduleRecord) (*ScheduleRecord, error)

	// UpdateSchedule persists changes to a schedule entry.
	UpdateSchedule(ctx context.Context, s *ScheduleRecord) (*ScheduleRecord, error)

	// DeleteSchedule soft-deletes a schedule entry.
	DeleteSchedule(ctx context.Context, id domain.MarketID) error

	// FindScheduleByID returns a schedule by ID.
	FindScheduleByID(ctx context.Context, id domain.MarketID) (*ScheduleRecord, error)

	// FindSchedulesByMarketID returns all schedules for a market.
	FindSchedulesByMarketID(ctx context.Context, marketID domain.MarketID) ([]*ScheduleRecord, error)

	// UpdateMarketRules updates the rules text and timestamp.
	UpdateMarketRules(ctx context.Context, marketID domain.MarketID, rulesText string) (*MarketRecord, error)

	// CancelMarket sets the market status to cancelled/ended_early.
	CancelMarket(ctx context.Context, marketID domain.MarketID, status, reason, message string) (*MarketRecord, error)

	// ReactivateMarket sets the market status back to active.
	ReactivateMarket(ctx context.Context, marketID domain.MarketID) (*MarketRecord, error)

	// CreateNotification inserts a vendor notification record.
	CreateNotification(ctx context.Context, n *NotificationRecord) (*NotificationRecord, error)

	// CreateInvitation creates a vendor invitation.
	CreateInvitation(ctx context.Context, inv *InvitationRecord) (*InvitationRecord, error)

	// UpdateInvitationStatus updates an invitation's status.
	UpdateInvitationStatus(ctx context.Context, id string, status string) (*InvitationRecord, error)

	// GetInvitationsByVendor returns pending invitations for a vendor.
	GetInvitationsByVendor(ctx context.Context, vendorID domain.UserID) ([]*InvitationRecord, error)

	// CreateRosterEntries creates roster entries for a vendor on given dates.
	CreateRosterEntries(ctx context.Context, marketID domain.MarketID, vendorID domain.UserID, dates []string, status string, rulesAcknowledged bool) ([]*RosterEntry, error)

	// UpdateRosterEntryStatus updates a roster entry's status.
	UpdateRosterEntryStatus(ctx context.Context, id string, status string) (*RosterEntry, error)

	// RejectRosterEntry rejects a roster entry with a reason.
	RejectRosterEntry(ctx context.Context, id string, reason string) (*RosterEntry, error)

	// FindRosterEntryByID returns a roster entry by its ID.
	FindRosterEntryByID(ctx context.Context, id string) (*RosterEntry, error)

	// DeleteRosterEntry soft-deletes a roster entry.
	DeleteRosterEntry(ctx context.Context, id string) error

	// GetRosterByDate returns roster entries for a market on a date.
	GetRosterByDate(ctx context.Context, marketID domain.MarketID, date string) ([]*RosterEntry, error)

	// GetDayPlans returns day plans for a date range.
	GetDayPlans(ctx context.Context, marketID domain.MarketID, startDate, endDate string) ([]*DayPlan, error)

	// SearchVendors searches vendors by name or category.
	SearchVendors(ctx context.Context, query, category string, limit *int32) ([]VendorSummary, error)
}
