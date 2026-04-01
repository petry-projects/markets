package db

import (
	"fmt"
	"regexp"
)

// maxLimit is the upper bound for pagination to prevent excessive result sets.
const maxLimit = 1000

// PaginationParams holds pagination parameters for queries.
type PaginationParams struct {
	Limit  int
	Offset int
}

// DefaultPagination returns default pagination values.
func DefaultPagination() PaginationParams {
	return PaginationParams{
		Limit:  20,
		Offset: 0,
	}
}

// validAlias matches simple SQL identifiers (letters, digits, underscores).
var validAlias = regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)

// SoftDeleteFilter returns a SQL fragment for filtering soft-deleted rows.
// All user-facing tables include a deleted_at column.
//
// Safety: The alias parameter is validated against a strict identifier pattern
// (letters, digits, underscores only). If the alias does not match, the function
// panics to prevent SQL injection. When called without an alias, a safe constant
// string is returned.
func SoftDeleteFilter(alias string) string {
	if alias != "" {
		if !validAlias.MatchString(alias) {
			panic(fmt.Sprintf("db.SoftDeleteFilter: invalid alias %q", alias))
		}
		return fmt.Sprintf("%s.deleted_at IS NULL", alias)
	}
	return "deleted_at IS NULL"
}

// SetActorSQL is the parameterized SQL to set the audit session variable.
// Uses set_config() instead of SET LOCAL because SET doesn't support $1 parameters.
const SetActorSQL = "SELECT set_config('app.actor_id', $1, true)"

// SetRoleSQL sets the actor role session variable.
const SetRoleSQL = "SELECT set_config('app.actor_role', $1, true)"

// PaginationClause returns a SQL LIMIT/OFFSET clause.
//
// Safety: limit and offset are Go int values formatted with %d, which guarantees
// integer-only output. Additionally, limit is clamped to [1, maxLimit] and offset
// is clamped to >= 0 to prevent nonsensical queries.
func PaginationClause(p PaginationParams) string {
	limit := p.Limit
	offset := p.Offset

	if limit <= 0 {
		limit = 20
	}
	if limit > maxLimit {
		limit = maxLimit
	}
	if offset < 0 {
		offset = 0
	}

	return fmt.Sprintf("LIMIT %d OFFSET %d", limit, offset)
}
