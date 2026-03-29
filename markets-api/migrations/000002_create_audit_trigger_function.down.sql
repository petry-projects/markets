-- Migration 000002 down: Drop audit trigger function
DROP FUNCTION IF EXISTS audit_trigger_func() CASCADE;
