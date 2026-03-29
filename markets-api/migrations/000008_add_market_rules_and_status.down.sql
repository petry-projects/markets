ALTER TABLE markets
    DROP COLUMN IF EXISTS cancelled_at,
    DROP COLUMN IF EXISTS cancellation_message,
    DROP COLUMN IF EXISTS cancellation_reason,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS rules_updated_at,
    DROP COLUMN IF EXISTS rules_text;
