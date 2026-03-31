package vendor

import (
	"errors"
	"time"

	"github.com/petry-projects/markets-api/internal/domain"
)

// CheckInStatus represents the state of a vendor check-in.
type CheckInStatus string

const (
	StatusCheckedIn  CheckInStatus = "checked_in"
	StatusCheckedOut CheckInStatus = "checked_out"
	StatusException  CheckInStatus = "exception"
)

var (
	ErrAlreadyCheckedIn       = errors.New("vendor is already checked in at this market")
	ErrConflictCheckIn        = errors.New("vendor is already checked in at another market")
	ErrCheckInNotFound        = errors.New("check-in not found")
	ErrNotCheckedIn           = errors.New("vendor is not currently checked in")
	ErrInvalidExceptionReason = errors.New("exception reason is required")
)

// CheckInRecord represents a vendor's check-in at a market.
type CheckInRecord struct {
	ID              domain.CheckInID
	VendorID        domain.VendorID
	MarketID        domain.MarketID
	Status          CheckInStatus
	ExceptionReason string
	CheckedInAt     time.Time
	CheckedOutAt    *time.Time
}

// NewCheckInParams holds the input for creating a check-in.
type NewCheckInParams struct {
	VendorID domain.VendorID
	MarketID domain.MarketID
}

// NewCheckIn creates a new check-in record.
func NewCheckIn(p NewCheckInParams) *CheckInRecord {
	return &CheckInRecord{
		VendorID:    p.VendorID,
		MarketID:    p.MarketID,
		Status:      StatusCheckedIn,
		CheckedInAt: time.Now(),
	}
}

// CheckOut transitions this check-in to checked-out status.
func (c *CheckInRecord) CheckOut() error {
	if c.Status != StatusCheckedIn {
		return ErrNotCheckedIn
	}
	now := time.Now()
	c.Status = StatusCheckedOut
	c.CheckedOutAt = &now
	return nil
}

// ReportException transitions this check-in to exception status with a reason.
func (c *CheckInRecord) ReportException(reason string) error {
	if c.Status != StatusCheckedIn {
		return ErrNotCheckedIn
	}
	if reason == "" {
		return ErrInvalidExceptionReason
	}
	now := time.Now()
	c.Status = StatusException
	c.ExceptionReason = reason
	c.CheckedOutAt = &now
	return nil
}

// CheckConflict inspects active check-ins and returns an error if there
// is a conflict (checked in at a different market) or a duplicate (same market).
func CheckConflict(activeCheckIns []*CheckInRecord, targetMarketID domain.MarketID) error {
	for _, ci := range activeCheckIns {
		if ci.Status != StatusCheckedIn {
			continue
		}
		if ci.MarketID == targetMarketID {
			return ErrAlreadyCheckedIn
		}
		return ErrConflictCheckIn
	}
	return nil
}
