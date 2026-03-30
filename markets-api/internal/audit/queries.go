// Package audit provides read-only query helpers for the audit_log table.
// Audit writes are handled exclusively by PostgreSQL triggers -- no manual inserts.
package audit

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Entry represents a single audit log entry.
type Entry struct {
	ID         string
	ActorID    string
	ActorRole  string
	ActionType string
	TargetType string
	TargetID   string
	MarketID   *string
	Timestamp  string
	Payload    *string
}

// Filter holds optional filter parameters for querying audit logs.
type Filter struct {
	ActorID    *string
	ActionType *string
	TargetType *string
	TargetID   *string
	MarketID   *string
	StartDate  *string
	EndDate    *string
}

// Querier provides methods for querying the audit_log table.
type Querier struct {
	Pool *pgxpool.Pool
}

// NewQuerier creates a new audit log querier.
func NewQuerier(pool *pgxpool.Pool) *Querier {
	return &Querier{Pool: pool}
}

// Query retrieves audit log entries matching the provided filter with pagination.
func (q *Querier) Query(ctx context.Context, f Filter, limit, offset int) ([]Entry, int, error) {
	conditions := []string{}
	args := []interface{}{}
	argIdx := 1

	if f.ActorID != nil {
		conditions = append(conditions, fmt.Sprintf("actor_id = $%d", argIdx))
		args = append(args, *f.ActorID)
		argIdx++
	}
	if f.ActionType != nil {
		conditions = append(conditions, fmt.Sprintf("action_type = $%d", argIdx))
		args = append(args, *f.ActionType)
		argIdx++
	}
	if f.TargetType != nil {
		conditions = append(conditions, fmt.Sprintf("target_type = $%d", argIdx))
		args = append(args, *f.TargetType)
		argIdx++
	}
	if f.TargetID != nil {
		conditions = append(conditions, fmt.Sprintf("target_id = $%d", argIdx))
		args = append(args, *f.TargetID)
		argIdx++
	}
	if f.MarketID != nil {
		conditions = append(conditions, fmt.Sprintf("market_id = $%d", argIdx))
		args = append(args, *f.MarketID)
		argIdx++
	}
	if f.StartDate != nil {
		conditions = append(conditions, fmt.Sprintf("timestamp >= $%d", argIdx))
		args = append(args, *f.StartDate)
		argIdx++
	}
	if f.EndDate != nil {
		conditions = append(conditions, fmt.Sprintf("timestamp <= $%d", argIdx))
		args = append(args, *f.EndDate)
		argIdx++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM audit_log %s", whereClause)
	var totalCount int
	err := q.Pool.QueryRow(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("count audit log: %w", err)
	}

	// Data query
	dataQuery := fmt.Sprintf(
		"SELECT id, actor_id, actor_role, action_type, target_type, target_id, market_id, timestamp, payload FROM audit_log %s ORDER BY timestamp DESC LIMIT $%d OFFSET $%d",
		whereClause, argIdx, argIdx+1,
	)
	args = append(args, limit, offset)

	rows, err := q.Pool.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query audit log: %w", err)
	}
	defer rows.Close()

	var entries []Entry
	for rows.Next() {
		var e Entry
		if err := rows.Scan(&e.ID, &e.ActorID, &e.ActorRole, &e.ActionType, &e.TargetType, &e.TargetID, &e.MarketID, &e.Timestamp, &e.Payload); err != nil {
			return nil, 0, fmt.Errorf("scan audit log entry: %w", err)
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate audit log: %w", err)
	}

	return entries, totalCount, nil
}

// QueryForManagedMarkets retrieves audit log entries scoped to the given market IDs.
// This is used by the manager audit log query to restrict results to markets
// the manager is assigned to.
func (q *Querier) QueryForManagedMarkets(ctx context.Context, marketIDs []string, f Filter, limit, offset int) ([]Entry, int, error) {
	if len(marketIDs) == 0 {
		return []Entry{}, 0, nil
	}

	conditions := []string{}
	args := []interface{}{}
	argIdx := 1

	// Build market_id IN (...) clause
	placeholders := make([]string, len(marketIDs))
	for i, mid := range marketIDs {
		placeholders[i] = fmt.Sprintf("$%d", argIdx)
		args = append(args, mid)
		argIdx++
	}
	conditions = append(conditions, fmt.Sprintf("market_id IN (%s)", strings.Join(placeholders, ", ")))

	if f.ActorID != nil {
		conditions = append(conditions, fmt.Sprintf("actor_id = $%d", argIdx))
		args = append(args, *f.ActorID)
		argIdx++
	}
	if f.ActionType != nil {
		conditions = append(conditions, fmt.Sprintf("action_type = $%d", argIdx))
		args = append(args, *f.ActionType)
		argIdx++
	}
	if f.TargetType != nil {
		conditions = append(conditions, fmt.Sprintf("target_type = $%d", argIdx))
		args = append(args, *f.TargetType)
		argIdx++
	}
	if f.TargetID != nil {
		conditions = append(conditions, fmt.Sprintf("target_id = $%d", argIdx))
		args = append(args, *f.TargetID)
		argIdx++
	}
	if f.MarketID != nil {
		// Additional market_id filter within the managed set
		conditions = append(conditions, fmt.Sprintf("market_id = $%d", argIdx))
		args = append(args, *f.MarketID)
		argIdx++
	}
	if f.StartDate != nil {
		conditions = append(conditions, fmt.Sprintf("timestamp >= $%d", argIdx))
		args = append(args, *f.StartDate)
		argIdx++
	}
	if f.EndDate != nil {
		conditions = append(conditions, fmt.Sprintf("timestamp <= $%d", argIdx))
		args = append(args, *f.EndDate)
		argIdx++
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	// Count query
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM audit_log %s", whereClause)
	var totalCount int
	err := q.Pool.QueryRow(ctx, countQuery, args...).Scan(&totalCount)
	if err != nil {
		return nil, 0, fmt.Errorf("count audit log (managed): %w", err)
	}

	// Data query
	dataQuery := fmt.Sprintf(
		"SELECT id, actor_id, actor_role, action_type, target_type, target_id, market_id, timestamp, payload FROM audit_log %s ORDER BY timestamp DESC LIMIT $%d OFFSET $%d",
		whereClause, argIdx, argIdx+1,
	)
	args = append(args, limit, offset)

	rows, err := q.Pool.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("query audit log (managed): %w", err)
	}
	defer rows.Close()

	var entries []Entry
	for rows.Next() {
		var e Entry
		if err := rows.Scan(&e.ID, &e.ActorID, &e.ActorRole, &e.ActionType, &e.TargetType, &e.TargetID, &e.MarketID, &e.Timestamp, &e.Payload); err != nil {
			return nil, 0, fmt.Errorf("scan audit log entry (managed): %w", err)
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("iterate audit log (managed): %w", err)
	}

	return entries, totalCount, nil
}

// QueryByActor retrieves audit log entries for a specific actor with optional date filters.
// Used for the myActivityLog query (user-facing activity history).
func (q *Querier) QueryByActor(ctx context.Context, actorID string, startDate, endDate *string, limit, offset int) ([]Entry, error) {
	conditions := []string{fmt.Sprintf("actor_id = $1")}
	args := []interface{}{actorID}
	argIdx := 2

	if startDate != nil {
		conditions = append(conditions, fmt.Sprintf("timestamp >= $%d", argIdx))
		args = append(args, *startDate)
		argIdx++
	}
	if endDate != nil {
		conditions = append(conditions, fmt.Sprintf("timestamp <= $%d", argIdx))
		args = append(args, *endDate)
		argIdx++
	}

	whereClause := "WHERE " + strings.Join(conditions, " AND ")

	dataQuery := fmt.Sprintf(
		"SELECT id, actor_id, actor_role, action_type, target_type, target_id, market_id, timestamp, payload FROM audit_log %s ORDER BY timestamp DESC LIMIT $%d OFFSET $%d",
		whereClause, argIdx, argIdx+1,
	)
	args = append(args, limit, offset)

	rows, err := q.Pool.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, fmt.Errorf("query audit log by actor: %w", err)
	}
	defer rows.Close()

	var entries []Entry
	for rows.Next() {
		var e Entry
		if err := rows.Scan(&e.ID, &e.ActorID, &e.ActorRole, &e.ActionType, &e.TargetType, &e.TargetID, &e.MarketID, &e.Timestamp, &e.Payload); err != nil {
			return nil, fmt.Errorf("scan audit log entry (actor): %w", err)
		}
		entries = append(entries, e)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate audit log (actor): %w", err)
	}

	return entries, nil
}
