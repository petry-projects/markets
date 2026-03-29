-- Migration 000009: Create vendor_notifications table
-- Story 2.2d: Send Vendor Notifications

CREATE TABLE vendor_notifications (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id   UUID        NOT NULL REFERENCES markets(id) ON DELETE CASCADE,
    sender_id   UUID        NOT NULL REFERENCES users(id),
    message     TEXT        NOT NULL,
    sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_vendor_notifications_market_id ON vendor_notifications(market_id);
CREATE INDEX idx_vendor_notifications_sent_at ON vendor_notifications(sent_at);

CREATE TRIGGER audit_vendor_notifications
    AFTER INSERT OR UPDATE OR DELETE ON vendor_notifications
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
