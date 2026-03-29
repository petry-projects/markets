package graph

import (
	"context"
	"errors"
	"log/slog"
	"strings"

	"github.com/petry-projects/markets-api/internal/customer"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/gqlerr"
	"github.com/petry-projects/markets-api/internal/graph/model"
)

// followTargetTypeToDB maps a GraphQL FollowTargetType enum to the DB lowercase value.
func followTargetTypeToDB(gqlVal model.FollowTargetType) string {
	switch gqlVal {
	case model.FollowTargetTypeVendor:
		return "vendor"
	case model.FollowTargetTypeMarket:
		return "market"
	default:
		return strings.ToLower(string(gqlVal))
	}
}

// followTargetTypeToModel maps a DB follow target type to the GraphQL enum.
func followTargetTypeToModel(dbVal string) model.FollowTargetType {
	switch strings.ToLower(dbVal) {
	case "vendor":
		return model.FollowTargetTypeVendor
	case "market":
		return model.FollowTargetTypeMarket
	default:
		return model.FollowTargetType(dbVal)
	}
}

// followToModel converts a domain FollowRecord to a GraphQL Follow model.
func followToModel(f *customer.FollowRecord) *model.Follow {
	return &model.Follow{
		ID:         f.ID,
		CustomerID: f.CustomerID.String(),
		TargetType: followTargetTypeToModel(f.TargetType),
		TargetID:   f.TargetID,
		CreatedAt:  f.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// customerToModel converts a domain CustomerRecord plus follows to a GraphQL CustomerProfile.
func customerToModel(c *customer.CustomerRecord, follows []*customer.FollowRecord) *model.CustomerProfile {
	var followedVendors []*model.Vendor
	var followedMarkets []*model.Market

	for _, f := range follows {
		switch f.TargetType {
		case "vendor":
			followedVendors = append(followedVendors, &model.Vendor{
				ID:       f.TargetID,
				Products: []*model.Product{},
				CheckIns: []*model.CheckIn{},
			})
		case "market":
			followedMarkets = append(followedMarkets, &model.Market{
				ID:       f.TargetID,
				Managers: []*model.User{},
				Schedule: []*model.MarketSchedule{},
				Vendors:  []*model.VendorRosterEntry{},
			})
		}
	}

	if followedVendors == nil {
		followedVendors = []*model.Vendor{}
	}
	if followedMarkets == nil {
		followedMarkets = []*model.Market{}
	}

	return &model.CustomerProfile{
		ID:              c.ID.String(),
		UserID:          c.UserID.String(),
		DisplayName:     c.DisplayName,
		FollowedVendors: followedVendors,
		FollowedMarkets: followedMarkets,
		CreatedAt:       c.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
		UpdatedAt:       c.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
	}
}

// feedItemToModel converts a domain FollowingFeedItem to a GraphQL model.
func feedItemToModel(item *customer.FollowingFeedItem) *model.FollowingFeedItem {
	result := &model.FollowingFeedItem{
		ID:        item.ID,
		Type:      item.Type,
		Timestamp: item.Timestamp.Format("2006-01-02T15:04:05Z07:00"),
		Message:   item.Message,
	}

	if item.VendorID != nil {
		result.Vendor = &model.Vendor{
			ID:       *item.VendorID,
			Products: []*model.Product{},
			CheckIns: []*model.CheckIn{},
		}
	}

	if item.MarketID != nil {
		result.Market = &model.Market{
			ID:       *item.MarketID,
			Managers: []*model.User{},
			Schedule: []*model.MarketSchedule{},
			Vendors:  []*model.VendorRosterEntry{},
		}
	}

	return result
}

// getOrCreateCustomer finds or auto-creates a customer profile for the given user.
func (r *mutationResolver) getOrCreateCustomer(ctx context.Context, userID domain.UserID) (*customer.CustomerRecord, error) {
	cust, err := r.CustomerRepo.FindCustomerByUserID(ctx, userID)
	if err == nil {
		return cust, nil
	}

	if !errors.Is(err, customer.ErrCustomerNotFound) {
		slog.Error("failed to find customer", "error", err, "userID", userID)
		return nil, gqlerr.Internal("failed to find customer profile")
	}

	// Auto-create customer profile
	newCust, err := customer.NewCustomer(customer.NewCustomerParams{
		UserID: userID,
	})
	if err != nil {
		return nil, gqlerr.NewError(gqlerr.CodeValidationError, err.Error())
	}

	created, err := r.CustomerRepo.CreateCustomer(ctx, newCust)
	if err != nil {
		slog.Error("failed to create customer", "error", err, "userID", userID)
		return nil, gqlerr.Internal("failed to create customer profile")
	}

	return created, nil
}

// discoveredVendorToModel converts a domain DiscoveredVendor to a GraphQL Vendor model.
func discoveredVendorToModel(v *customer.DiscoveredVendor) *model.Vendor {
	return &model.Vendor{
		ID:           v.ID.String(),
		UserID:       v.UserID.String(),
		BusinessName: v.BusinessName,
		Description:  stringToPtr(v.Description),
		ImageURL:     stringToPtr(v.ImageURL),
		Products:     []*model.Product{},
		CheckIns:     []*model.CheckIn{},
	}
}
