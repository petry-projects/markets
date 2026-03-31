package graph

import (
	"strings"

	"github.com/petry-projects/markets-api/internal/graph/model"
	"github.com/petry-projects/markets-api/internal/notify"
)

// notificationPrefsToModel converts a domain NotificationPrefsRecord to a GraphQL model.
func notificationPrefsToModel(p *notify.NotificationPrefsRecord) *model.NotificationPreferences {
	return &model.NotificationPreferences{
		ID:                   p.ID,
		UserID:               p.UserID.String(),
		PushEnabled:          true, // Always true when prefs exist
		VendorCheckInAlerts:  p.CheckInAlerts,
		VendorCheckoutAlerts: p.CheckoutAlerts,
		MarketUpdateAlerts:   p.MarketUpdates,
		ExceptionAlerts:      p.ExceptionAlerts,
		CreatedAt:            p.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:            p.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// activityFeedItemToModel converts a domain ActivityFeedItem to a GraphQL model.
func activityFeedItemToModel(item *notify.ActivityFeedItem) *model.ActivityFeedItem {
	return &model.ActivityFeedItem{
		ID:         item.ID,
		ActorID:    item.ActorID,
		ActionType: item.ActionType,
		TargetType: item.TargetType,
		TargetID:   item.TargetID,
		MarketID:   item.MarketID,
		Message:    item.Message,
		CreatedAt:  item.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// platformToDB maps a GraphQL Platform enum to the DB lowercase value.
func platformToDB(p model.Platform) string {
	return strings.ToLower(string(p))
}
