DROP TRIGGER IF EXISTS audit_market_schedules ON market_schedules;
DROP INDEX IF EXISTS idx_market_schedules_type;
DROP INDEX IF EXISTS idx_market_schedules_market_id;
DROP TABLE IF EXISTS market_schedules;
