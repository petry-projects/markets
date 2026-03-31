-- Migration 000008: Add market rules, status, and cancellation fields
-- Story 2.2c: Market Rules & Expectations
-- Story 2.2e: Cancel or End Market Early

ALTER TABLE markets
    ADD COLUMN rules_text         TEXT,
    ADD COLUMN rules_updated_at   TIMESTAMPTZ,
    ADD COLUMN status             TEXT NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'cancelled', 'ended_early')),
    ADD COLUMN cancellation_reason TEXT,
    ADD COLUMN cancellation_message TEXT,
    ADD COLUMN cancelled_at       TIMESTAMPTZ;
