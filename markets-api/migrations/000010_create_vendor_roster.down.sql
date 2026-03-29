DROP TRIGGER IF EXISTS audit_vendor_roster ON vendor_roster;
DROP INDEX IF EXISTS idx_vendor_roster_status;
DROP INDEX IF EXISTS idx_vendor_roster_vendor;
DROP INDEX IF EXISTS idx_vendor_roster_market_date;
DROP TABLE IF EXISTS vendor_roster;
