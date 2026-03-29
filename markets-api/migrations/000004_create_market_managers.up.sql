-- Migration 000004: Create market_managers junction table
-- Links managers (users with role='manager') to markets they are authorized to administer.
-- Supports many-to-many: multiple managers per market, multiple markets per manager.

CREATE TABLE market_managers (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    manager_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- TODO: Add FK constraint `REFERENCES markets(id) ON DELETE CASCADE` once
    -- the markets table migration lands (deferred to avoid circular dependency
    -- with the markets schema which is not yet created).
    market_id   UUID        NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_manager_market UNIQUE (manager_id, market_id)
);

CREATE INDEX idx_market_managers_manager_id ON market_managers(manager_id);
CREATE INDEX idx_market_managers_market_id ON market_managers(market_id);

-- Attach reusable audit trigger function (created in migration 000002)
-- Fires on INSERT and DELETE only (rows are immutable: no updates)
CREATE TRIGGER audit_market_managers
    AFTER INSERT OR DELETE ON market_managers
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
