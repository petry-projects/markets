-- Migration 000001: Create audit_log table (append-only)
-- Implements FR35, FR36, NFR12: Immutable audit log for all write operations.

CREATE TABLE audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id    TEXT NOT NULL,
    actor_role  TEXT NOT NULL,
    action_type TEXT NOT NULL,        -- 'INSERT', 'UPDATE', 'DELETE'
    target_type TEXT NOT NULL,        -- table name (e.g., 'vendors', 'check_ins')
    target_id   TEXT NOT NULL,        -- primary key of affected row
    market_id   TEXT,                 -- nullable; set when action is market-scoped
    timestamp   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payload     JSONB                 -- old/new row data as JSON
);

-- Append-only enforcement: revoke UPDATE and DELETE
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;

-- Indexes for common query patterns
CREATE INDEX idx_audit_log_target ON audit_log (target_type, target_id);
CREATE INDEX idx_audit_log_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_log_market ON audit_log (market_id) WHERE market_id IS NOT NULL;
CREATE INDEX idx_audit_log_timestamp ON audit_log (timestamp);
