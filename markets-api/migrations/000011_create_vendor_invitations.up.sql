-- Migration 000011: Create vendor_invitations table
-- Story 2.2a: Browse & Invite Vendors to Market

CREATE TABLE vendor_invitations (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id       UUID        NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    vendor_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    invited_by      UUID        NOT NULL REFERENCES users(id),
    status          TEXT        NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'accepted', 'declined')),
    target_dates    DATE[],     -- Specific dates the vendor is invited for
    message         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(market_id, vendor_id)
);

CREATE INDEX idx_vendor_invitations_vendor ON vendor_invitations(vendor_id);
CREATE INDEX idx_vendor_invitations_market ON vendor_invitations(market_id);

CREATE TRIGGER audit_vendor_invitations
    AFTER INSERT OR UPDATE OR DELETE ON vendor_invitations
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
