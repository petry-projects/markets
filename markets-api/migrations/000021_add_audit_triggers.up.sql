-- Migration 000021: Attach audit triggers to all domain tables
-- Implements Epic 8: Audit, Privacy & Account Governance
-- Uses the existing audit_trigger_func() from migration 000002.

-- Drop any existing triggers to avoid conflicts, then recreate uniformly as BEFORE triggers.
DROP TRIGGER IF EXISTS audit_users ON users;
DROP TRIGGER IF EXISTS audit_markets ON markets;
DROP TRIGGER IF EXISTS audit_market_managers ON market_managers;
DROP TRIGGER IF EXISTS audit_market_schedules ON market_schedules;
DROP TRIGGER IF EXISTS audit_vendor_roster ON vendor_roster;
DROP TRIGGER IF EXISTS audit_vendor_notifications ON vendor_notifications;
DROP TRIGGER IF EXISTS audit_vendor_invitations ON vendor_invitations;
DROP TRIGGER IF EXISTS audit_vendors ON vendors;
DROP TRIGGER IF EXISTS audit_vendor_products ON vendor_products;
DROP TRIGGER IF EXISTS audit_check_ins ON check_ins;
DROP TRIGGER IF EXISTS audit_market_updates ON market_updates;
DROP TRIGGER IF EXISTS audit_customers ON customers;
DROP TRIGGER IF EXISTS audit_follows ON follows;
DROP TRIGGER IF EXISTS audit_device_tokens ON device_tokens;
DROP TRIGGER IF EXISTS audit_notification_prefs ON notification_prefs;
DROP TRIGGER IF EXISTS audit_activity_feed ON activity_feed;
DROP TRIGGER IF EXISTS prevent_audit_log_modification ON audit_log;

CREATE TRIGGER audit_users BEFORE INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_markets BEFORE INSERT OR UPDATE OR DELETE ON markets FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_market_managers BEFORE INSERT OR UPDATE OR DELETE ON market_managers FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_market_schedules BEFORE INSERT OR UPDATE OR DELETE ON market_schedules FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_vendor_roster BEFORE INSERT OR UPDATE OR DELETE ON vendor_roster FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_vendor_notifications BEFORE INSERT OR UPDATE OR DELETE ON vendor_notifications FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_vendor_invitations BEFORE INSERT OR UPDATE OR DELETE ON vendor_invitations FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_vendors BEFORE INSERT OR UPDATE OR DELETE ON vendors FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_vendor_products BEFORE INSERT OR UPDATE OR DELETE ON vendor_products FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_check_ins BEFORE INSERT OR UPDATE OR DELETE ON check_ins FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_market_updates BEFORE INSERT OR UPDATE OR DELETE ON market_updates FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_customers BEFORE INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_follows BEFORE INSERT OR UPDATE OR DELETE ON follows FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_device_tokens BEFORE INSERT OR UPDATE OR DELETE ON device_tokens FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_notification_prefs BEFORE INSERT OR UPDATE OR DELETE ON notification_prefs FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_activity_feed BEFORE INSERT OR UPDATE OR DELETE ON activity_feed FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- Make audit_log immutable (prevent UPDATE/DELETE via trigger)
CREATE OR REPLACE FUNCTION prevent_audit_modification() RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'audit_log is immutable: % operations are not allowed', TG_OP;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_audit_log_modification
    BEFORE UPDATE OR DELETE ON audit_log
    FOR EACH ROW EXECUTE FUNCTION prevent_audit_modification();
