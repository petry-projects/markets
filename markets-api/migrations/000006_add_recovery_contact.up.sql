-- Migration 000006: Add recovery_contact to market_managers
-- Required per FR41b: every manager must provide a recovery contact (email or phone).

ALTER TABLE market_managers
    ADD COLUMN recovery_contact TEXT NOT NULL DEFAULT '';
