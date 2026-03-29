package graph

import "github.com/petry-projects/markets-api/internal/graph/model"

// validRoles maps GraphQL Role enum values to lowercase domain role strings.
var validRoles = map[model.Role]string{
	model.RoleCustomer: "customer",
	model.RoleVendor:   "vendor",
	model.RoleManager:  "manager",
}
