-- Migration 000021: Attach audit triggers to all domain tables
-- Implements Epic 8: Audit, Privacy & Account Governance
-- Uses the existing audit_trigger_func() from migration 000002.

-- Drop any existing triggers to avoid conflicts, then recreate uniformly as BEFORE triggers.
-- vendor_roster already has an audit trigger from migration 000010; drop it first.
DROP TRIGGER IF EXISTS audit_vendor_roster ON vendor_roster;

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
