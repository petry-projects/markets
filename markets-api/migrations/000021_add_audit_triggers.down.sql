-- Rollback migration 000021: Remove audit triggers from all domain tables

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
DROP FUNCTION IF EXISTS prevent_audit_modification();
