-- Migration 000005: Create markets table
-- Stores market profiles created and managed by market managers.
-- Supports soft-delete via deleted_at column.

CREATE TABLE markets (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT            NOT NULL,
    description     TEXT,
    address         TEXT            NOT NULL,
    latitude        DOUBLE PRECISION NOT NULL,
    longitude       DOUBLE PRECISION NOT NULL,
    contact_email   TEXT            NOT NULL,
    contact_phone   TEXT,
    social_links    JSONB           NOT NULL DEFAULT '{}',
    image_url       TEXT,
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_markets_deleted_at ON markets(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_markets_name ON markets(name);

-- Add the deferred FK constraint on market_managers now that markets table exists
ALTER TABLE market_managers
    ADD CONSTRAINT fk_market_managers_market
    FOREIGN KEY (market_id) REFERENCES markets(id) ON DELETE CASCADE;

-- Attach reusable audit trigger function (created in migration 000002)
CREATE TRIGGER audit_markets
    AFTER INSERT OR UPDATE OR DELETE ON markets
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
