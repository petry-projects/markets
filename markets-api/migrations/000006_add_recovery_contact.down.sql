-- Rollback migration 000006: Remove recovery_contact from market_managers
ALTER TABLE market_managers DROP COLUMN IF EXISTS recovery_contact;
