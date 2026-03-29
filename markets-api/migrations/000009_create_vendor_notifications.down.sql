DROP TRIGGER IF EXISTS audit_vendor_notifications ON vendor_notifications;
DROP INDEX IF EXISTS idx_vendor_notifications_sent_at;
DROP INDEX IF EXISTS idx_vendor_notifications_market_id;
DROP TABLE IF EXISTS vendor_notifications;
