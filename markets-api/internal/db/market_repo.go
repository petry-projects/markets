package db

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/petry-projects/markets-api/internal/domain"
	"github.com/petry-projects/markets-api/internal/market"
)

// ErrDuplicateAssignment is returned when a manager is already assigned to the market.
var ErrDuplicateAssignment = errors.New("manager already assigned to this market")

// ErrMarketNotFound is returned when a market does not exist or is soft-deleted.
var ErrMarketNotFound = errors.New("market not found")

// PgMarketRepository implements market.Repository using pgx against Cloud SQL.
type PgMarketRepository struct {
	pool *pgxpool.Pool
}

// NewPgMarketRepository creates a new PgMarketRepository.
func NewPgMarketRepository(pool *pgxpool.Pool) *PgMarketRepository {
	return &PgMarketRepository{pool: pool}
}

// IsManagerAssigned checks if a manager is assigned to a specific market.
func (r *PgMarketRepository) IsManagerAssigned(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) (bool, error) {
	query := `SELECT EXISTS(SELECT 1 FROM market_managers WHERE manager_id = $1 AND market_id = $2)`

	var exists bool
	err := r.pool.QueryRow(ctx, query, managerID.String(), marketID.String()).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("check manager assignment: %w", err)
	}

	return exists, nil
}

// AssignManager inserts a manager-market assignment into the junction table.
func (r *PgMarketRepository) AssignManager(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) (*market.ManagerAssignment, error) {
	query := `
		INSERT INTO market_managers (manager_id, market_id)
		VALUES ($1, $2)
		RETURNING id, created_at
	`

	var id string
	var createdAt time.Time
	err := r.pool.QueryRow(ctx, query, managerID.String(), marketID.String()).Scan(&id, &createdAt)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) && pgErr.Code == "23505" {
			return nil, ErrDuplicateAssignment
		}
		return nil, fmt.Errorf("assign manager: %w", err)
	}

	return &market.ManagerAssignment{
		ID:        id,
		ManagerID: managerID,
		MarketID:  marketID,
		CreatedAt: createdAt,
	}, nil
}

// RemoveManager deletes a manager-market assignment from the junction table.
func (r *PgMarketRepository) RemoveManager(ctx context.Context, managerID domain.UserID, marketID domain.MarketID) error {
	query := `DELETE FROM market_managers WHERE manager_id = $1 AND market_id = $2`

	result, err := r.pool.Exec(ctx, query, managerID.String(), marketID.String())
	if err != nil {
		return fmt.Errorf("remove manager: %w", err)
	}

	if result.RowsAffected() == 0 {
		return market.ErrManagerNotAssigned
	}

	return nil
}

// GetManagersByMarket returns all manager assignments for a given market.
func (r *PgMarketRepository) GetManagersByMarket(ctx context.Context, marketID domain.MarketID) ([]market.ManagerAssignment, error) {
	query := `
		SELECT id, manager_id, market_id, recovery_contact, created_at
		FROM market_managers
		WHERE market_id = $1
		ORDER BY created_at
	`

	rows, err := r.pool.Query(ctx, query, marketID.String())
	if err != nil {
		return nil, fmt.Errorf("get managers by market: %w", err)
	}
	defer rows.Close()

	var assignments []market.ManagerAssignment
	for rows.Next() {
		var a market.ManagerAssignment
		var id, managerID, mktID, recoveryContact string
		if err := rows.Scan(&id, &managerID, &mktID, &recoveryContact, &a.CreatedAt); err != nil {
			return nil, fmt.Errorf("scan manager assignment: %w", err)
		}
		a.ID = id
		a.ManagerID = domain.UserID(managerID)
		a.MarketID = domain.MarketID(mktID)
		a.RecoveryContact = recoveryContact
		assignments = append(assignments, a)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate manager assignments: %w", err)
	}

	return assignments, nil
}

// CreateMarket inserts a new market and assigns the creating manager atomically.
func (r *PgMarketRepository) CreateMarket(ctx context.Context, m *market.MarketRecord, managerID domain.UserID, recoveryContact string) (*market.MarketRecord, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("begin transaction: %w", err)
	}
	defer tx.Rollback(ctx)

	// Set session variables for audit trigger
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_id = $1", managerID.String()); err != nil {
		return nil, fmt.Errorf("set actor_id: %w", err)
	}
	if _, err := tx.Exec(ctx, "SET LOCAL app.actor_role = 'manager'"); err != nil {
		return nil, fmt.Errorf("set actor_role: %w", err)
	}

	socialLinksJSON, err := json.Marshal(m.SocialLinks)
	if err != nil {
		return nil, fmt.Errorf("marshal social links: %w", err)
	}

	// Insert market
	marketQuery := `
		INSERT INTO markets (name, description, address, latitude, longitude, contact_email, contact_phone, social_links, image_url)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`
	err = tx.QueryRow(ctx, marketQuery,
		m.Name, m.Description, m.Address, m.Latitude, m.Longitude,
		m.ContactEmail, m.ContactPhone, socialLinksJSON, m.ImageURL,
	).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert market: %w", err)
	}

	// Assign creating manager
	assignQuery := `
		INSERT INTO market_managers (manager_id, market_id, recovery_contact)
		VALUES ($1, $2, $3)
	`
	if _, err := tx.Exec(ctx, assignQuery, managerID.String(), m.ID.String(), recoveryContact); err != nil {
		return nil, fmt.Errorf("assign manager: %w", err)
	}

	if err := tx.Commit(ctx); err != nil {
		return nil, fmt.Errorf("commit transaction: %w", err)
	}

	return m, nil
}

// UpdateMarket persists changes to an existing market.
func (r *PgMarketRepository) UpdateMarket(ctx context.Context, m *market.MarketRecord) (*market.MarketRecord, error) {
	socialLinksJSON, err := json.Marshal(m.SocialLinks)
	if err != nil {
		return nil, fmt.Errorf("marshal social links: %w", err)
	}

	query := `
		UPDATE markets
		SET name = $1, description = $2, address = $3, latitude = $4, longitude = $5,
		    contact_email = $6, contact_phone = $7, social_links = $8, image_url = $9,
		    updated_at = NOW()
		WHERE id = $10 AND deleted_at IS NULL
		RETURNING updated_at
	`
	err = r.pool.QueryRow(ctx, query,
		m.Name, m.Description, m.Address, m.Latitude, m.Longitude,
		m.ContactEmail, m.ContactPhone, socialLinksJSON, m.ImageURL,
		m.ID.String(),
	).Scan(&m.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMarketNotFound
		}
		return nil, fmt.Errorf("update market: %w", err)
	}

	return m, nil
}

// FindMarketByID returns a market by its ID, excluding soft-deleted records.
func (r *PgMarketRepository) FindMarketByID(ctx context.Context, id domain.MarketID) (*market.MarketRecord, error) {
	query := `
		SELECT id, name, description, address, latitude, longitude,
		       contact_email, contact_phone, social_links, image_url,
		       created_at, updated_at
		FROM markets
		WHERE id = $1 AND deleted_at IS NULL
	`

	m := &market.MarketRecord{}
	var socialLinksJSON []byte
	var description, contactPhone, imageURL *string

	err := r.pool.QueryRow(ctx, query, id.String()).Scan(
		&m.ID, &m.Name, &description, &m.Address, &m.Latitude, &m.Longitude,
		&m.ContactEmail, &contactPhone, &socialLinksJSON, &imageURL,
		&m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMarketNotFound
		}
		return nil, fmt.Errorf("find market by id: %w", err)
	}

	if description != nil {
		m.Description = *description
	}
	if contactPhone != nil {
		m.ContactPhone = *contactPhone
	}
	if imageURL != nil {
		m.ImageURL = *imageURL
	}
	if err := json.Unmarshal(socialLinksJSON, &m.SocialLinks); err != nil {
		return nil, fmt.Errorf("unmarshal social links: %w", err)
	}

	return m, nil
}

// FindMarketsByManagerID returns all markets assigned to a manager.
func (r *PgMarketRepository) FindMarketsByManagerID(ctx context.Context, managerID domain.UserID) ([]*market.MarketRecord, error) {
	query := `
		SELECT m.id, m.name, m.description, m.address, m.latitude, m.longitude,
		       m.contact_email, m.contact_phone, m.social_links, m.image_url,
		       m.created_at, m.updated_at
		FROM markets m
		INNER JOIN market_managers mm ON mm.market_id = m.id
		WHERE mm.manager_id = $1 AND m.deleted_at IS NULL
		ORDER BY m.created_at DESC
	`

	return r.scanMarkets(ctx, query, managerID.String())
}

// ListMarkets returns markets with optional pagination.
func (r *PgMarketRepository) ListMarkets(ctx context.Context, limit *int32, offset *int32) ([]*market.MarketRecord, error) {
	lim := int32(50)
	off := int32(0)
	if limit != nil {
		lim = *limit
	}
	if offset != nil {
		off = *offset
	}

	query := `
		SELECT id, name, description, address, latitude, longitude,
		       contact_email, contact_phone, social_links, image_url,
		       created_at, updated_at
		FROM markets
		WHERE deleted_at IS NULL
		ORDER BY created_at DESC
		LIMIT $1 OFFSET $2
	`

	return r.scanMarkets(ctx, query, lim, off)
}

// ErrScheduleNotFound is returned when a schedule does not exist or is soft-deleted.
var ErrScheduleNotFound = errors.New("schedule not found")

// CreateSchedule inserts a new schedule entry.
func (r *PgMarketRepository) CreateSchedule(ctx context.Context, s *market.ScheduleRecord) (*market.ScheduleRecord, error) {
	query := `
		INSERT INTO market_schedules (market_id, schedule_type, day_of_week, frequency, season_start, season_end,
		                              event_name, event_date, start_time, end_time, label)
		VALUES ($1, $2, $3, $4, $5::date, $6::date, $7, $8::date, $9::time, $10::time, $11)
		RETURNING id, created_at, updated_at
	`
	err := r.pool.QueryRow(ctx, query,
		s.MarketID.String(), s.ScheduleType, s.DayOfWeek, nullStr(s.Frequency),
		nullStr(s.SeasonStart), nullStr(s.SeasonEnd),
		nullStr(s.EventName), nullStr(s.EventDate),
		s.StartTime, s.EndTime, nullStr(s.Label),
	).Scan(&s.ID, &s.CreatedAt, &s.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert schedule: %w", err)
	}
	return s, nil
}

// UpdateSchedule persists changes to a schedule entry.
func (r *PgMarketRepository) UpdateSchedule(ctx context.Context, s *market.ScheduleRecord) (*market.ScheduleRecord, error) {
	query := `
		UPDATE market_schedules
		SET day_of_week = $1, frequency = $2, season_start = $3::date, season_end = $4::date,
		    event_name = $5, event_date = $6::date, start_time = $7::time, end_time = $8::time,
		    label = $9, updated_at = NOW()
		WHERE id = $10 AND deleted_at IS NULL
		RETURNING updated_at
	`
	err := r.pool.QueryRow(ctx, query,
		s.DayOfWeek, nullStr(s.Frequency), nullStr(s.SeasonStart), nullStr(s.SeasonEnd),
		nullStr(s.EventName), nullStr(s.EventDate),
		s.StartTime, s.EndTime, nullStr(s.Label),
		s.ID.String(),
	).Scan(&s.UpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrScheduleNotFound
		}
		return nil, fmt.Errorf("update schedule: %w", err)
	}
	return s, nil
}

// DeleteSchedule soft-deletes a schedule entry.
func (r *PgMarketRepository) DeleteSchedule(ctx context.Context, id domain.MarketID) error {
	query := `UPDATE market_schedules SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	result, err := r.pool.Exec(ctx, query, id.String())
	if err != nil {
		return fmt.Errorf("delete schedule: %w", err)
	}
	if result.RowsAffected() == 0 {
		return ErrScheduleNotFound
	}
	return nil
}

// FindScheduleByID returns a schedule by ID.
func (r *PgMarketRepository) FindScheduleByID(ctx context.Context, id domain.MarketID) (*market.ScheduleRecord, error) {
	query := `
		SELECT id, market_id, schedule_type, day_of_week, frequency,
		       COALESCE(season_start::text, ''), COALESCE(season_end::text, ''),
		       COALESCE(event_name, ''), COALESCE(event_date::text, ''),
		       start_time::text, end_time::text, COALESCE(label, ''),
		       created_at, updated_at
		FROM market_schedules
		WHERE id = $1 AND deleted_at IS NULL
	`
	s := &market.ScheduleRecord{}
	var frequency *string
	err := r.pool.QueryRow(ctx, query, id.String()).Scan(
		&s.ID, &s.MarketID, &s.ScheduleType, &s.DayOfWeek, &frequency,
		&s.SeasonStart, &s.SeasonEnd,
		&s.EventName, &s.EventDate,
		&s.StartTime, &s.EndTime, &s.Label,
		&s.CreatedAt, &s.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrScheduleNotFound
		}
		return nil, fmt.Errorf("find schedule by id: %w", err)
	}
	if frequency != nil {
		s.Frequency = *frequency
	}
	return s, nil
}

// FindSchedulesByMarketID returns all schedules for a market.
func (r *PgMarketRepository) FindSchedulesByMarketID(ctx context.Context, marketID domain.MarketID) ([]*market.ScheduleRecord, error) {
	query := `
		SELECT id, market_id, schedule_type, day_of_week, frequency,
		       COALESCE(season_start::text, ''), COALESCE(season_end::text, ''),
		       COALESCE(event_name, ''), COALESCE(event_date::text, ''),
		       start_time::text, end_time::text, COALESCE(label, ''),
		       created_at, updated_at
		FROM market_schedules
		WHERE market_id = $1 AND deleted_at IS NULL
		ORDER BY schedule_type, day_of_week, start_time
	`
	rows, err := r.pool.Query(ctx, query, marketID.String())
	if err != nil {
		return nil, fmt.Errorf("query schedules: %w", err)
	}
	defer rows.Close()

	var schedules []*market.ScheduleRecord
	for rows.Next() {
		s := &market.ScheduleRecord{}
		var frequency *string
		if err := rows.Scan(
			&s.ID, &s.MarketID, &s.ScheduleType, &s.DayOfWeek, &frequency,
			&s.SeasonStart, &s.SeasonEnd,
			&s.EventName, &s.EventDate,
			&s.StartTime, &s.EndTime, &s.Label,
			&s.CreatedAt, &s.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan schedule: %w", err)
		}
		if frequency != nil {
			s.Frequency = *frequency
		}
		schedules = append(schedules, s)
	}
	return schedules, rows.Err()
}

// nullStr converts empty string to nil for nullable DB columns.
func nullStr(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}

// UpdateMarketRules updates the rules text and timestamp.
func (r *PgMarketRepository) UpdateMarketRules(ctx context.Context, marketID domain.MarketID, rulesText string) (*market.MarketRecord, error) {
	query := `
		UPDATE markets
		SET rules_text = $1, rules_updated_at = NOW(), updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
		RETURNING id, name, description, address, latitude, longitude,
		          contact_email, contact_phone, social_links, image_url,
		          rules_text, rules_updated_at, status, cancellation_reason,
		          cancellation_message, cancelled_at, created_at, updated_at
	`
	return r.scanSingleMarketFull(ctx, query, rulesText, marketID.String())
}

// CancelMarket sets the market status to cancelled or ended_early.
func (r *PgMarketRepository) CancelMarket(ctx context.Context, marketID domain.MarketID, status, reason, message string) (*market.MarketRecord, error) {
	query := `
		UPDATE markets
		SET status = $1, cancellation_reason = $2, cancellation_message = $3,
		    cancelled_at = NOW(), updated_at = NOW()
		WHERE id = $4 AND deleted_at IS NULL
		RETURNING id, name, description, address, latitude, longitude,
		          contact_email, contact_phone, social_links, image_url,
		          rules_text, rules_updated_at, status, cancellation_reason,
		          cancellation_message, cancelled_at, created_at, updated_at
	`
	return r.scanSingleMarketFull(ctx, query, status, reason, message, marketID.String())
}

// ReactivateMarket sets the market status back to active.
func (r *PgMarketRepository) ReactivateMarket(ctx context.Context, marketID domain.MarketID) (*market.MarketRecord, error) {
	query := `
		UPDATE markets
		SET status = 'active', cancellation_reason = NULL, cancellation_message = NULL,
		    cancelled_at = NULL, updated_at = NOW()
		WHERE id = $1 AND deleted_at IS NULL
		RETURNING id, name, description, address, latitude, longitude,
		          contact_email, contact_phone, social_links, image_url,
		          rules_text, rules_updated_at, status, cancellation_reason,
		          cancellation_message, cancelled_at, created_at, updated_at
	`
	return r.scanSingleMarketFull(ctx, query, marketID.String())
}

// CreateNotification inserts a vendor notification record.
func (r *PgMarketRepository) CreateNotification(ctx context.Context, n *market.NotificationRecord) (*market.NotificationRecord, error) {
	query := `
		INSERT INTO vendor_notifications (market_id, sender_id, message)
		VALUES ($1, $2, $3)
		RETURNING id, sent_at
	`
	err := r.pool.QueryRow(ctx, query,
		n.MarketID.String(), n.SenderID.String(), n.Message,
	).Scan(&n.ID, &n.SentAt)
	if err != nil {
		return nil, fmt.Errorf("insert notification: %w", err)
	}
	return n, nil
}

// scanSingleMarketFull scans a single market row including rules/status fields.
func (r *PgMarketRepository) scanSingleMarketFull(ctx context.Context, query string, args ...any) (*market.MarketRecord, error) {
	m := &market.MarketRecord{}
	var socialLinksJSON []byte
	var description, contactPhone, imageURL, rulesText, cancellationReason, cancellationMessage *string

	err := r.pool.QueryRow(ctx, query, args...).Scan(
		&m.ID, &m.Name, &description, &m.Address, &m.Latitude, &m.Longitude,
		&m.ContactEmail, &contactPhone, &socialLinksJSON, &imageURL,
		&rulesText, &m.RulesUpdatedAt, &m.Status, &cancellationReason,
		&cancellationMessage, &m.CancelledAt, &m.CreatedAt, &m.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrMarketNotFound
		}
		return nil, fmt.Errorf("scan market: %w", err)
	}

	if description != nil {
		m.Description = *description
	}
	if contactPhone != nil {
		m.ContactPhone = *contactPhone
	}
	if imageURL != nil {
		m.ImageURL = *imageURL
	}
	if rulesText != nil {
		m.RulesText = *rulesText
	}
	if cancellationReason != nil {
		m.CancellationReason = *cancellationReason
	}
	if cancellationMessage != nil {
		m.CancellationMessage = *cancellationMessage
	}
	if err := json.Unmarshal(socialLinksJSON, &m.SocialLinks); err != nil {
		return nil, fmt.Errorf("unmarshal social links: %w", err)
	}

	return m, nil
}

// CreateInvitation creates a vendor invitation.
func (r *PgMarketRepository) CreateInvitation(ctx context.Context, inv *market.InvitationRecord) (*market.InvitationRecord, error) {
	query := `
		INSERT INTO vendor_invitations (market_id, vendor_id, invited_by, target_dates, message)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, status, created_at, updated_at
	`
	err := r.pool.QueryRow(ctx, query,
		inv.MarketID.String(), inv.VendorID.String(), inv.InvitedBy.String(),
		inv.TargetDates, nullStr(inv.Message),
	).Scan(&inv.ID, &inv.Status, &inv.CreatedAt, &inv.UpdatedAt)
	if err != nil {
		return nil, fmt.Errorf("insert invitation: %w", err)
	}
	return inv, nil
}

// UpdateInvitationStatus updates an invitation's status.
func (r *PgMarketRepository) UpdateInvitationStatus(ctx context.Context, id string, status string) (*market.InvitationRecord, error) {
	query := `
		UPDATE vendor_invitations SET status = $1, updated_at = NOW() WHERE id = $2
		RETURNING id, market_id, vendor_id, invited_by, status, target_dates, message, created_at, updated_at
	`
	inv := &market.InvitationRecord{}
	var targetDates []string
	var message *string
	err := r.pool.QueryRow(ctx, query, status, id).Scan(
		&inv.ID, &inv.MarketID, &inv.VendorID, &inv.InvitedBy,
		&inv.Status, &targetDates, &message, &inv.CreatedAt, &inv.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("update invitation status: %w", err)
	}
	inv.TargetDates = targetDates
	if message != nil {
		inv.Message = *message
	}
	return inv, nil
}

// GetInvitationsByVendor returns pending invitations for a vendor.
func (r *PgMarketRepository) GetInvitationsByVendor(ctx context.Context, vendorID domain.UserID) ([]*market.InvitationRecord, error) {
	query := `
		SELECT id, market_id, vendor_id, invited_by, status, target_dates, message, created_at, updated_at
		FROM vendor_invitations
		WHERE vendor_id = $1 AND status = 'pending'
		ORDER BY created_at DESC
	`
	rows, err := r.pool.Query(ctx, query, vendorID.String())
	if err != nil {
		return nil, fmt.Errorf("query invitations: %w", err)
	}
	defer rows.Close()

	var invitations []*market.InvitationRecord
	for rows.Next() {
		inv := &market.InvitationRecord{}
		var targetDates []string
		var message *string
		if err := rows.Scan(&inv.ID, &inv.MarketID, &inv.VendorID, &inv.InvitedBy,
			&inv.Status, &targetDates, &message, &inv.CreatedAt, &inv.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan invitation: %w", err)
		}
		inv.TargetDates = targetDates
		if message != nil {
			inv.Message = *message
		}
		invitations = append(invitations, inv)
	}
	return invitations, rows.Err()
}

// CreateRosterEntries creates roster entries for a vendor on given dates.
func (r *PgMarketRepository) CreateRosterEntries(ctx context.Context, marketID domain.MarketID, vendorID domain.UserID, dates []string, status string) ([]*market.RosterEntry, error) {
	var entries []*market.RosterEntry
	for _, date := range dates {
		query := `
			INSERT INTO vendor_roster (market_id, vendor_id, date, status)
			VALUES ($1, $2, $3::date, $4)
			ON CONFLICT (market_id, vendor_id, date) DO UPDATE SET status = $4, updated_at = NOW()
			RETURNING id, created_at, updated_at
		`
		entry := &market.RosterEntry{
			MarketID: marketID,
			VendorID: vendorID,
			Date:     date,
			Status:   status,
		}
		err := r.pool.QueryRow(ctx, query, marketID.String(), vendorID.String(), date, status).
			Scan(&entry.ID, &entry.CreatedAt, &entry.UpdatedAt)
		if err != nil {
			return nil, fmt.Errorf("insert roster entry for %s: %w", date, err)
		}
		entries = append(entries, entry)
	}
	return entries, nil
}

// UpdateRosterEntryStatus updates a roster entry's status.
func (r *PgMarketRepository) UpdateRosterEntryStatus(ctx context.Context, id string, status string) (*market.RosterEntry, error) {
	query := `
		UPDATE vendor_roster SET status = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
		RETURNING id, market_id, vendor_id, date, status, COALESCE(invited_by::text, ''),
		          COALESCE(rejection_reason, ''), rules_acknowledged, created_at, updated_at
	`
	e := &market.RosterEntry{}
	var invitedBy string
	err := r.pool.QueryRow(ctx, query, status, id).Scan(
		&e.ID, &e.MarketID, &e.VendorID, &e.Date, &e.Status,
		&invitedBy, &e.RejectionReason, &e.RulesAcknowledged, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("update roster status: %w", err)
	}
	e.InvitedBy = invitedBy
	return e, nil
}

// RejectRosterEntry rejects a roster entry with a reason.
func (r *PgMarketRepository) RejectRosterEntry(ctx context.Context, id string, reason string) (*market.RosterEntry, error) {
	query := `
		UPDATE vendor_roster SET status = 'rejected', rejection_reason = $1, updated_at = NOW()
		WHERE id = $2 AND deleted_at IS NULL
		RETURNING id, market_id, vendor_id, date, status, COALESCE(invited_by::text, ''),
		          COALESCE(rejection_reason, ''), rules_acknowledged, created_at, updated_at
	`
	e := &market.RosterEntry{}
	var invitedBy string
	err := r.pool.QueryRow(ctx, query, reason, id).Scan(
		&e.ID, &e.MarketID, &e.VendorID, &e.Date, &e.Status,
		&invitedBy, &e.RejectionReason, &e.RulesAcknowledged, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("reject roster entry: %w", err)
	}
	e.InvitedBy = invitedBy
	return e, nil
}

// FindRosterEntryByID returns a roster entry by its ID.
func (r *PgMarketRepository) FindRosterEntryByID(ctx context.Context, id string) (*market.RosterEntry, error) {
	query := `
		SELECT id, market_id, vendor_id, date, status, COALESCE(invited_by::text, ''),
		       COALESCE(rejection_reason, ''), rules_acknowledged, created_at, updated_at
		FROM vendor_roster
		WHERE id = $1 AND deleted_at IS NULL
	`
	e := &market.RosterEntry{}
	var invitedBy string
	err := r.pool.QueryRow(ctx, query, id).Scan(
		&e.ID, &e.MarketID, &e.VendorID, &e.Date, &e.Status,
		&invitedBy, &e.RejectionReason, &e.RulesAcknowledged, &e.CreatedAt, &e.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("find roster entry: %w", err)
	}
	e.InvitedBy = invitedBy
	return e, nil
}

// DeleteRosterEntry soft-deletes a roster entry.
func (r *PgMarketRepository) DeleteRosterEntry(ctx context.Context, id string) error {
	query := `UPDATE vendor_roster SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL`
	result, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("delete roster entry: %w", err)
	}
	if result.RowsAffected() == 0 {
		return fmt.Errorf("roster entry not found")
	}
	return nil
}

// GetRosterByDate returns roster entries for a market on a date.
func (r *PgMarketRepository) GetRosterByDate(ctx context.Context, marketID domain.MarketID, date string) ([]*market.RosterEntry, error) {
	query := `
		SELECT id, market_id, vendor_id, date, status, COALESCE(invited_by::text, ''),
		       COALESCE(rejection_reason, ''), rules_acknowledged, created_at, updated_at
		FROM vendor_roster
		WHERE market_id = $1 AND date = $2::date AND deleted_at IS NULL
		ORDER BY status, created_at
	`
	rows, err := r.pool.Query(ctx, query, marketID.String(), date)
	if err != nil {
		return nil, fmt.Errorf("query roster: %w", err)
	}
	defer rows.Close()

	var entries []*market.RosterEntry
	for rows.Next() {
		e := &market.RosterEntry{}
		if err := rows.Scan(&e.ID, &e.MarketID, &e.VendorID, &e.Date, &e.Status,
			&e.InvitedBy, &e.RejectionReason, &e.RulesAcknowledged, &e.CreatedAt, &e.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan roster entry: %w", err)
		}
		entries = append(entries, e)
	}
	return entries, rows.Err()
}

// GetDayPlans returns day plans for a date range.
func (r *PgMarketRepository) GetDayPlans(ctx context.Context, marketID domain.MarketID, startDate, endDate string) ([]*market.DayPlan, error) {
	query := `
		SELECT date, status, COUNT(*) as cnt
		FROM vendor_roster
		WHERE market_id = $1 AND date BETWEEN $2::date AND $3::date AND deleted_at IS NULL
		GROUP BY date, status
		ORDER BY date
	`
	rows, err := r.pool.Query(ctx, query, marketID.String(), startDate, endDate)
	if err != nil {
		return nil, fmt.Errorf("query day plans: %w", err)
	}
	defer rows.Close()

	planMap := make(map[string]*market.DayPlan)
	for rows.Next() {
		var date, status string
		var count int
		if err := rows.Scan(&date, &status, &count); err != nil {
			return nil, fmt.Errorf("scan day plan: %w", err)
		}
		plan, ok := planMap[date]
		if !ok {
			plan = &market.DayPlan{Date: date}
			planMap[date] = plan
		}
		if status == "approved" || status == "committed" {
			plan.VendorCount += count
		}
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	var plans []*market.DayPlan
	for _, p := range planMap {
		plans = append(plans, p)
	}
	return plans, nil
}

// SearchVendors searches vendors by name or category.
func (r *PgMarketRepository) SearchVendors(ctx context.Context, query, category string, limit *int32) ([]market.VendorSummary, error) {
	lim := int32(20)
	if limit != nil {
		lim = *limit
	}
	// Simple ILIKE search — full-text search can be added later
	sqlQuery := `
		SELECT u.id, u.id as user_id, COALESCE(u.name, '') as business_name, '' as description, '' as image_url
		FROM users u
		WHERE u.role = 'vendor' AND u.deleted_at IS NULL AND u.name ILIKE '%' || $1 || '%'
		LIMIT $2
	`
	rows, err := r.pool.Query(ctx, sqlQuery, query, lim)
	if err != nil {
		return nil, fmt.Errorf("search vendors: %w", err)
	}
	defer rows.Close()

	var vendors []market.VendorSummary
	for rows.Next() {
		var v market.VendorSummary
		if err := rows.Scan(&v.ID, &v.UserID, &v.BusinessName, &v.Description, &v.ImageURL); err != nil {
			return nil, fmt.Errorf("scan vendor: %w", err)
		}
		vendors = append(vendors, v)
	}
	return vendors, rows.Err()
}

// scanMarkets is a helper that scans multiple market rows.
func (r *PgMarketRepository) scanMarkets(ctx context.Context, query string, args ...any) ([]*market.MarketRecord, error) {
	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("query markets: %w", err)
	}
	defer rows.Close()

	var markets []*market.MarketRecord
	for rows.Next() {
		m := &market.MarketRecord{}
		var socialLinksJSON []byte
		var description, contactPhone, imageURL *string

		if err := rows.Scan(
			&m.ID, &m.Name, &description, &m.Address, &m.Latitude, &m.Longitude,
			&m.ContactEmail, &contactPhone, &socialLinksJSON, &imageURL,
			&m.CreatedAt, &m.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("scan market: %w", err)
		}

		if description != nil {
			m.Description = *description
		}
		if contactPhone != nil {
			m.ContactPhone = *contactPhone
		}
		if imageURL != nil {
			m.ImageURL = *imageURL
		}
		if err := json.Unmarshal(socialLinksJSON, &m.SocialLinks); err != nil {
			return nil, fmt.Errorf("unmarshal social links: %w", err)
		}

		markets = append(markets, m)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("iterate markets: %w", err)
	}

	return markets, nil
}
