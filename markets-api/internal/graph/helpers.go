package graph

import (
	"context"

	"github.com/petry-projects/markets-api/internal/audit"
	"github.com/petry-projects/markets-api/internal/auth"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/gqlerr"
	"github.com/petry-projects/markets-api/internal/graph/model"
)

// resolveUserID extracts the Firebase UID from context and looks up the
// corresponding DB user ID (UUID). This bridge is needed because auth context
// stores the Firebase UID but DB foreign keys reference users.id (UUID).
func (r *Resolver) resolveUserID(ctx context.Context) (domain.UserID, error) {
	firebaseUID := auth.UserIDFromContext(ctx)
	if firebaseUID == "" {
		return "", gqlerr.NewError(gqlerr.CodeUnauthenticated, "authentication required")
	}
	u, err := r.UserRepo.FindByFirebaseUID(ctx, firebaseUID)
	if err != nil {
		return "", gqlerr.Internal("user not found")
	}
	return domain.UserID(u.ID), nil
}

// validRoles maps GraphQL Role enum values to lowercase domain role strings.
var validRoles = map[model.Role]string{
	model.RoleCustomer: "customer",
	model.RoleVendor:   "vendor",
	model.RoleManager:  "manager",
}

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
