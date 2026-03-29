DROP TRIGGER IF EXISTS audit_vendor_invitations ON vendor_invitations;
DROP INDEX IF EXISTS idx_vendor_invitations_market;
DROP INDEX IF EXISTS idx_vendor_invitations_vendor;
DROP TABLE IF EXISTS vendor_invitations;
