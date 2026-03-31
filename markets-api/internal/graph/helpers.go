package graph

import (
	"github.com/petry-projects/markets-api/internal/audit"
	"github.com/petry-projects/markets-api/internal/graph/model"
)

// auditEntryToModel converts an audit.Entry to a GraphQL model AuditLogEntry.
func auditEntryToModel(e *audit.Entry) *model.AuditLogEntry {
	return &model.AuditLogEntry{
		ID:         e.ID,
		ActorID:    e.ActorID,
		ActorRole:  e.ActorRole,
		ActionType: e.ActionType,
		TargetType: e.TargetType,
		TargetID:   e.TargetID,
		MarketID:   e.MarketID,
		Timestamp:  e.Timestamp,
		Payload:    e.Payload,
	}
}

// validRoles maps GraphQL Role enum values to lowercase domain role strings.
var validRoles = map[model.Role]string{
	model.RoleCustomer: "customer",
	model.RoleVendor:   "vendor",
	model.RoleManager:  "manager",
}
