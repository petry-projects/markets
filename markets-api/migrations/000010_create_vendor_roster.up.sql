-- Migration 000010: Create vendor_roster table
-- Supports Stories 2.2a, 2.2b, 2.3: vendor roster management with per-date attendance

CREATE TABLE vendor_roster (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id       UUID        NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    vendor_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date            DATE        NOT NULL,
    status          TEXT        NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'invited', 'committed', 'not_attending')),
    invited_by      UUID        REFERENCES users(id),
    rejection_reason TEXT,
    rules_acknowledged BOOLEAN  NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(market_id, vendor_id, date)
);

CREATE INDEX idx_vendor_roster_market_date ON vendor_roster(market_id, date) WHERE deleted_at IS NULL;
CREATE INDEX idx_vendor_roster_vendor ON vendor_roster(vendor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vendor_roster_status ON vendor_roster(status) WHERE deleted_at IS NULL;

CREATE TRIGGER audit_vendor_roster
    AFTER INSERT OR UPDATE OR DELETE ON vendor_roster
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
