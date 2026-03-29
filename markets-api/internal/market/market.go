// Package market provides the Market aggregate root and domain logic.
package market

import (
	"errors"
	"net/mail"
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

// ErrInvalidMarketName is returned when the market name is empty.
var ErrInvalidMarketName = errors.New("market name is required")

// ErrInvalidAddress is returned when the market address is empty.
var ErrInvalidAddress = errors.New("market address is required")

// ErrInvalidCoordinates is returned when latitude or longitude are out of range.
var ErrInvalidCoordinates = errors.New("invalid coordinates: latitude must be -90..90, longitude -180..180")

// ErrInvalidContactEmail is returned when contact email is missing or invalid.
var ErrInvalidContactEmail = errors.New("a valid contact email is required")

// MinManagers is the minimum number of managers a market must have.
const MinManagers = 2

// SocialLinks holds optional social media links for a market.
type SocialLinks struct {
	Instagram string
	Facebook  string
	Website   string
	Twitter   string
}

// ManagerAssignment represents a manager's assignment to a market.
type ManagerAssignment struct {
	ID              string
	ManagerID       domain.UserID
	MarketID        domain.MarketID
	RecoveryContact string
	CreatedAt       time.Time
}

// Market is the aggregate root for market domain logic.
type Market struct {
	ID       domain.MarketID
	Managers []ManagerAssignment
}

// MarketRecord holds the full persisted state of a market profile.
type MarketRecord struct {
	ID                  domain.MarketID
	Name                string
	Description         string
	Address             string
	Latitude            float64
	Longitude           float64
	ContactEmail        string
	ContactPhone        string
	SocialLinks         SocialLinks
	ImageURL            string
	RulesText           string
	RulesUpdatedAt      *time.Time
	Status              string // "active", "cancelled", "ended_early"
	CancellationReason  string
	CancellationMessage string
	CancelledAt         *time.Time
	CreatedAt           time.Time
	UpdatedAt           time.Time
}

// NotificationRecord represents a sent vendor notification.
type NotificationRecord struct {
	ID       string
	MarketID domain.MarketID
	SenderID domain.UserID
	Message  string
	SentAt   time.Time
}

// NewMarketParams holds parameters for creating a new market.
type NewMarketParams struct {
	Name         string
	Description  string
	Address      string
	Latitude     float64
	Longitude    float64
	ContactEmail string
	ContactPhone string
	SocialLinks  SocialLinks
	ImageURL     string
}

// NewMarket validates inputs and returns a new MarketRecord.
func NewMarket(p NewMarketParams) (*MarketRecord, error) {
	if p.Name == "" {
		return nil, ErrInvalidMarketName
	}
	if p.Address == "" {
		return nil, ErrInvalidAddress
	}
	if p.Latitude < -90 || p.Latitude > 90 || p.Longitude < -180 || p.Longitude > 180 {
		return nil, ErrInvalidCoordinates
	}
	if _, err := mail.ParseAddress(p.ContactEmail); err != nil {
		return nil, ErrInvalidContactEmail
	}

	return &MarketRecord{
		Name:         p.Name,
		Description:  p.Description,
		Address:      p.Address,
		Latitude:     p.Latitude,
		Longitude:    p.Longitude,
		ContactEmail: p.ContactEmail,
		ContactPhone: p.ContactPhone,
		SocialLinks:  p.SocialLinks,
		ImageURL:     p.ImageURL,
	}, nil
}

// UpdateParams holds optional fields for updating a market.
type UpdateParams struct {
	Name         *string
	Description  *string
	Address      *string
	Latitude     *float64
	Longitude    *float64
	ContactEmail *string
	ContactPhone *string
	SocialLinks  *SocialLinks
	ImageURL     *string
}

// Update applies partial updates to a MarketRecord, validating changed fields.
func (m *MarketRecord) Update(p UpdateParams) error {
	if p.Name != nil {
		if *p.Name == "" {
			return ErrInvalidMarketName
		}
		m.Name = *p.Name
	}
	if p.Address != nil {
		if *p.Address == "" {
			return ErrInvalidAddress
		}
		m.Address = *p.Address
	}
	if p.Latitude != nil || p.Longitude != nil {
		lat := m.Latitude
		lng := m.Longitude
		if p.Latitude != nil {
			lat = *p.Latitude
		}
		if p.Longitude != nil {
			lng = *p.Longitude
		}
		if lat < -90 || lat > 90 || lng < -180 || lng > 180 {
			return ErrInvalidCoordinates
		}
		m.Latitude = lat
		m.Longitude = lng
	}
	if p.ContactEmail != nil {
		if _, err := mail.ParseAddress(*p.ContactEmail); err != nil {
			return ErrInvalidContactEmail
		}
		m.ContactEmail = *p.ContactEmail
	}
	if p.ContactPhone != nil {
		m.ContactPhone = *p.ContactPhone
	}
	if p.Description != nil {
		m.Description = *p.Description
	}
	if p.SocialLinks != nil {
		m.SocialLinks = *p.SocialLinks
	}
	if p.ImageURL != nil {
		m.ImageURL = *p.ImageURL
	}
	return nil
}

// ScheduleRecord holds the full persisted state of a market schedule entry.
type ScheduleRecord struct {
	ID           domain.MarketID
	MarketID     domain.MarketID
	ScheduleType string // "recurring" or "one_time"
	DayOfWeek    *int32
	Frequency    string
	SeasonStart  string
	SeasonEnd    string
	EventName    string
	EventDate    string
	StartTime    string
	EndTime      string
	Label        string
	CreatedAt    time.Time
	UpdatedAt    time.Time
}

// NewScheduleParams holds parameters for creating a new schedule.
type NewScheduleParams struct {
	MarketID     domain.MarketID
	ScheduleType string
	DayOfWeek    *int32
	Frequency    string
	SeasonStart  string
	SeasonEnd    string
	EventName    string
	EventDate    string
	StartTime    string
	EndTime      string
	Label        string
}

// ErrInvalidScheduleType is returned when the schedule type is not valid.
var ErrInvalidScheduleType = errors.New("schedule type must be 'recurring' or 'one_time'")

// ErrMissingStartTime is returned when start time is empty.
var ErrMissingStartTime = errors.New("start time is required")

// ErrMissingEndTime is returned when end time is empty.
var ErrMissingEndTime = errors.New("end time is required")

// ErrMissingDayOfWeek is returned when a recurring schedule has no day of week.
var ErrMissingDayOfWeek = errors.New("day of week is required for recurring schedules")

// ErrMissingEventDate is returned when a one-time schedule has no event date.
var ErrMissingEventDate = errors.New("event date is required for one-time schedules")

// NewSchedule validates inputs and returns a new ScheduleRecord.
func NewSchedule(p NewScheduleParams) (*ScheduleRecord, error) {
	if p.ScheduleType != "recurring" && p.ScheduleType != "one_time" {
		return nil, ErrInvalidScheduleType
	}
	if p.StartTime == "" {
		return nil, ErrMissingStartTime
	}
	if p.EndTime == "" {
		return nil, ErrMissingEndTime
	}
	if p.ScheduleType == "recurring" && p.DayOfWeek == nil {
		return nil, ErrMissingDayOfWeek
	}
	if p.ScheduleType == "one_time" && p.EventDate == "" {
		return nil, ErrMissingEventDate
	}

	return &ScheduleRecord{
		MarketID:     p.MarketID,
		ScheduleType: p.ScheduleType,
		DayOfWeek:    p.DayOfWeek,
		Frequency:    p.Frequency,
		SeasonStart:  p.SeasonStart,
		SeasonEnd:    p.SeasonEnd,
		EventName:    p.EventName,
		EventDate:    p.EventDate,
		StartTime:    p.StartTime,
		EndTime:      p.EndTime,
		Label:        p.Label,
	}, nil
}

// UpdateScheduleParams holds optional fields for updating a schedule.
type UpdateScheduleParams struct {
	DayOfWeek   *int32
	Frequency   *string
	SeasonStart *string
	SeasonEnd   *string
	EventName   *string
	EventDate   *string
	StartTime   *string
	EndTime     *string
	Label       *string
}

// UpdateSchedule applies partial updates to a ScheduleRecord.
func (s *ScheduleRecord) UpdateSchedule(p UpdateScheduleParams) {
	if p.DayOfWeek != nil {
		s.DayOfWeek = p.DayOfWeek
	}
	if p.Frequency != nil {
		s.Frequency = *p.Frequency
	}
	if p.SeasonStart != nil {
		s.SeasonStart = *p.SeasonStart
	}
	if p.SeasonEnd != nil {
		s.SeasonEnd = *p.SeasonEnd
	}
	if p.EventName != nil {
		s.EventName = *p.EventName
	}
	if p.EventDate != nil {
		s.EventDate = *p.EventDate
	}
	if p.StartTime != nil {
		s.StartTime = *p.StartTime
	}
	if p.EndTime != nil {
		s.EndTime = *p.EndTime
	}
	if p.Label != nil {
		s.Label = *p.Label
	}
}

// RosterEntry represents a vendor's presence on a market roster for a specific date.
type RosterEntry struct {
	ID                string
	MarketID          domain.MarketID
	VendorID          domain.UserID
	Date              string
	Status            string
	InvitedBy         string
	RejectionReason   string
	RulesAcknowledged bool
	CreatedAt         time.Time
	UpdatedAt         time.Time
}

// InvitationRecord represents a vendor invitation to a market.
type InvitationRecord struct {
	ID          string
	MarketID    domain.MarketID
	VendorID    domain.UserID
	InvitedBy   domain.UserID
	Status      string
	TargetDates []string
	Message     string
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

// DayPlan represents the planning view for a specific market date.
type DayPlan struct {
	Date             string
	VendorCount      int
	CommittedVendors []*RosterEntry
	PendingRequests  []*RosterEntry
}

// VendorSummary is a lightweight vendor representation for search results.
type VendorSummary struct {
	ID           string
	UserID       string
	BusinessName string
	Description  string
	ImageURL     string
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
