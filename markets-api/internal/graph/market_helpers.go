package graph

import (
	"context"
	"log/slog"
	"strings"

	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/gqlerr"
	"github.com/petry-projects/markets-api/internal/graph/model"
	"github.com/petry-projects/markets-api/internal/market"
)

// --- Enum mapping helpers (DB lowercase ↔ GraphQL uppercase) ---

// scheduleTypeToModel maps a DB schedule type (lowercase) to the GraphQL enum.
func scheduleTypeToModel(dbVal string) model.ScheduleType {
	switch strings.ToLower(dbVal) {
	case "recurring":
		return model.ScheduleTypeRecurring
	case "one_time":
		return model.ScheduleTypeOneTime
	default:
		return model.ScheduleType(dbVal)
	}
}

// scheduleTypeToDB maps a GraphQL ScheduleType enum to the DB lowercase value.
func scheduleTypeToDB(gqlVal model.ScheduleType) string {
	switch gqlVal {
	case model.ScheduleTypeRecurring:
		return "recurring"
	case model.ScheduleTypeOneTime:
		return "one_time"
	default:
		return strings.ToLower(string(gqlVal))
	}
}

// rosterStatusToModel maps a DB roster status (lowercase) to the GraphQL enum.
func rosterStatusToModel(dbVal string) model.VendorRosterStatus {
	switch strings.ToLower(dbVal) {
	case "pending":
		return model.VendorRosterStatusPending
	case "approved":
		return model.VendorRosterStatusApproved
	case "rejected":
		return model.VendorRosterStatusRejected
	case "invited":
		return model.VendorRosterStatusInvited
	case "committed":
		return model.VendorRosterStatusCommitted
	case "not_attending":
		return model.VendorRosterStatusNotAttending
	default:
		return model.VendorRosterStatus(dbVal)
	}
}

// rosterStatusToDB maps a GraphQL VendorRosterStatus enum to the DB lowercase value.
func rosterStatusToDB(gqlVal model.VendorRosterStatus) string {
	switch gqlVal {
	case model.VendorRosterStatusPending:
		return "pending"
	case model.VendorRosterStatusApproved:
		return "approved"
	case model.VendorRosterStatusRejected:
		return "rejected"
	case model.VendorRosterStatusInvited:
		return "invited"
	case model.VendorRosterStatusCommitted:
		return "committed"
	case model.VendorRosterStatusNotAttending:
		return "not_attending"
	default:
		return strings.ToLower(string(gqlVal))
	}
}

// invitationStatusToModel maps a DB invitation status (lowercase) to the GraphQL enum.
func invitationStatusToModel(dbVal string) model.InvitationStatus {
	switch strings.ToLower(dbVal) {
	case "pending":
		return model.InvitationStatusPending
	case "accepted":
		return model.InvitationStatusAccepted
	case "declined":
		return model.InvitationStatusDeclined
	default:
		return model.InvitationStatus(dbVal)
	}
}

// checkManagerScope verifies that the current user (if role == "manager") is assigned
// to the specified market. Returns a GraphQL error if not authorized, or nil if OK.
func (r *mutationResolver) checkManagerScope(ctx context.Context, marketID domain.MarketID) error {
	role := auth.RoleFromContext(ctx)
	if role != "manager" {
		return nil
	}

	uid := auth.UserIDFromContext(ctx)
	if uid == "" {
		return gqlerr.NewError(gqlerr.CodeUnauthenticated, "authentication required")
	}

	if r.MarketRepo == nil {
		return gqlerr.NewError(gqlerr.CodeInternal, "market repository not configured")
	}

	assigned, err := r.MarketRepo.IsManagerAssigned(ctx, domain.UserID(uid), marketID)
	if err != nil {
		slog.Error("failed to verify market access", "error", err, "userID", uid, "marketID", marketID)
		return gqlerr.NewError(gqlerr.CodeInternal, "failed to verify market access")
	}
	if !assigned {
		return gqlerr.NewError(gqlerr.CodeForbidden, "not authorized for this market")
	}

	return nil
}

// checkQueryManagerScope is the query-resolver equivalent of checkManagerScope.
func (r *queryResolver) checkQueryManagerScope(ctx context.Context, marketID domain.MarketID) error {
	role := auth.RoleFromContext(ctx)
	if role != "manager" {
		return nil
	}

	uid := auth.UserIDFromContext(ctx)
	if uid == "" {
		return gqlerr.NewError(gqlerr.CodeUnauthenticated, "authentication required")
	}

	if r.MarketRepo == nil {
		return gqlerr.NewError(gqlerr.CodeInternal, "market repository not configured")
	}

	assigned, err := r.MarketRepo.IsManagerAssigned(ctx, domain.UserID(uid), marketID)
	if err != nil {
		slog.Error("failed to verify market access", "error", err, "userID", uid, "marketID", marketID)
		return gqlerr.NewError(gqlerr.CodeInternal, "failed to verify market access")
	}
	if !assigned {
		return gqlerr.NewError(gqlerr.CodeForbidden, "not authorized for this market")
	}

	return nil
}

// checkRosterScope looks up a roster entry by ID and verifies the calling manager
// is assigned to the entry's market. Returns the entry's MarketID on success.
func (r *mutationResolver) checkRosterScope(ctx context.Context, rosterEntryID string) (domain.MarketID, error) {
	entry, err := r.MarketRepo.FindRosterEntryByID(ctx, rosterEntryID)
	if err != nil {
		slog.Error("failed to find roster entry", "error", err, "id", rosterEntryID)
		return "", gqlerr.NewError(gqlerr.CodeValidationError, "roster entry not found")
	}
	if err := r.checkManagerScope(ctx, entry.MarketID); err != nil {
		return "", err
	}
	return entry.MarketID, nil
}

// marketToModel converts a domain MarketRecord to a GraphQL model Market.
func marketToModel(m *market.MarketRecord) *model.Market {
	var socialLinks *model.SocialLinks
	if m.SocialLinks.Instagram != "" || m.SocialLinks.Facebook != "" || m.SocialLinks.Website != "" || m.SocialLinks.Twitter != "" {
		socialLinks = &model.SocialLinks{
			Instagram: stringToPtr(m.SocialLinks.Instagram),
			Facebook:  stringToPtr(m.SocialLinks.Facebook),
			Website:   stringToPtr(m.SocialLinks.Website),
			Twitter:   stringToPtr(m.SocialLinks.Twitter),
		}
	}

	var rulesUpdatedAt *string
	if m.RulesUpdatedAt != nil {
		s := m.RulesUpdatedAt.Format("2006-01-02T15:04:05Z07:00")
		rulesUpdatedAt = &s
	}
	var cancelledAt *string
	if m.CancelledAt != nil {
		s := m.CancelledAt.Format("2006-01-02T15:04:05Z07:00")
		cancelledAt = &s
	}

	status := model.MarketStatusActive
	switch m.Status {
	case "cancelled":
		status = model.MarketStatusCancelled
	case "ended_early":
		status = model.MarketStatusEndedEarly
	}

	return &model.Market{
		ID:                  m.ID.String(),
		Name:                m.Name,
		Description:         stringToPtr(m.Description),
		Address:             m.Address,
		Latitude:            m.Latitude,
		Longitude:           m.Longitude,
		ContactEmail:        m.ContactEmail,
		ContactPhone:        stringToPtr(m.ContactPhone),
		SocialLinks:         socialLinks,
		ImageURL:            stringToPtr(m.ImageURL),
		RulesText:           stringToPtr(m.RulesText),
		RulesUpdatedAt:      rulesUpdatedAt,
		Status:              status,
		CancellationReason:  stringToPtr(m.CancellationReason),
		CancellationMessage: stringToPtr(m.CancellationMessage),
		CancelledAt:         cancelledAt,
		Managers:            []*model.User{},
		Schedule:            []*model.MarketSchedule{},
		Vendors:             []*model.VendorRosterEntry{},
		CreatedAt:           m.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:           m.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// scheduleToModel converts a domain ScheduleRecord to a GraphQL model MarketSchedule.
func scheduleToModel(s *market.ScheduleRecord) *model.MarketSchedule {
	return &model.MarketSchedule{
		ID:           s.ID.String(),
		MarketID:     s.MarketID.String(),
		ScheduleType: scheduleTypeToModel(s.ScheduleType),
		DayOfWeek:    s.DayOfWeek,
		Frequency:    stringToPtr(s.Frequency),
		SeasonStart:  stringToPtr(s.SeasonStart),
		SeasonEnd:    stringToPtr(s.SeasonEnd),
		EventName:    stringToPtr(s.EventName),
		EventDate:    stringToPtr(s.EventDate),
		StartTime:    s.StartTime,
		EndTime:      s.EndTime,
		Label:        stringToPtr(s.Label),
		CreatedAt:    s.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:    s.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// rosterEntryToModel converts a domain RosterEntry to a GraphQL model.
func rosterEntryToModel(e *market.RosterEntry) *model.VendorRosterEntry {
	return &model.VendorRosterEntry{
		ID:                e.ID,
		MarketID:          e.MarketID.String(),
		VendorID:          e.VendorID.String(),
		Vendor:            &model.Vendor{ID: e.VendorID.String()},
		Status:            rosterStatusToModel(e.Status),
		Date:              e.Date,
		InvitedBy:         stringToPtr(e.InvitedBy),
		RejectionReason:   stringToPtr(e.RejectionReason),
		RulesAcknowledged: e.RulesAcknowledged,
		CreatedAt:         e.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:         e.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// invitationToModel converts a domain InvitationRecord to a GraphQL model.
func invitationToModel(inv *market.InvitationRecord) *model.VendorInvitation {
	return &model.VendorInvitation{
		ID:          inv.ID,
		MarketID:    inv.MarketID.String(),
		VendorID:    inv.VendorID.String(),
		InvitedBy:   inv.InvitedBy.String(),
		Status:      invitationStatusToModel(inv.Status),
		TargetDates: inv.TargetDates,
		Message:     stringToPtr(inv.Message),
		CreatedAt:   inv.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:   inv.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// ptrToString safely dereferences a *string, returning "" for nil.
func ptrToString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

// stringToPtr returns a pointer to the string if non-empty, otherwise nil.
func stringToPtr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
