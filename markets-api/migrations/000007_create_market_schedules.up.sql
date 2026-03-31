-- Migration 000007: Create market_schedules table
-- Supports both recurring (day-of-week) and one-time (specific date) schedules.

CREATE TABLE market_schedules (
    id              UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id       UUID            NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    schedule_type   TEXT            NOT NULL CHECK (schedule_type IN ('recurring', 'one_time')),
    -- Recurring fields
    day_of_week     INT,            -- 0=Sunday, 6=Saturday (NULL for one_time)
    frequency       TEXT            DEFAULT 'weekly', -- weekly, biweekly, monthly, etc.
    season_start    DATE,           -- Optional seasonal start date
    season_end      DATE,           -- Optional seasonal end date
    -- One-time fields
    event_name      TEXT,           -- Name for one-time events
    event_date      DATE,           -- Specific date for one-time events
    -- Shared fields
    start_time      TIME            NOT NULL,
    end_time        TIME            NOT NULL,
    label           TEXT,           -- Optional label (e.g., "Summer Evening Market")
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_market_schedules_market_id ON market_schedules(market_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_market_schedules_type ON market_schedules(schedule_type) WHERE deleted_at IS NULL;

-- Attach audit trigger
CREATE TRIGGER audit_market_schedules
    AFTER INSERT OR UPDATE OR DELETE ON market_schedules
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
