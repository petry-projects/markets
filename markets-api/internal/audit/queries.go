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

	return entries, totalCount, nil
}
