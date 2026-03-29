-- Rollback migration 000005: Drop markets table and related constraints
DROP TRIGGER IF EXISTS audit_markets ON markets;
ALTER TABLE market_managers DROP CONSTRAINT IF EXISTS fk_market_managers_market;
DROP INDEX IF EXISTS idx_markets_name;
DROP INDEX IF EXISTS idx_markets_deleted_at;
DROP TABLE IF EXISTS markets;
