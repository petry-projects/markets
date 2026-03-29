-- Migration 000003: Create users table
-- Stores user records created after role selection during first sign-in.

CREATE TABLE users (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT        UNIQUE NOT NULL,
    role         TEXT        NOT NULL CHECK (role IN ('customer', 'vendor', 'manager')),
    name         TEXT        NOT NULL,
    email        TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at   TIMESTAMPTZ NULL
);

CREATE INDEX idx_users_firebase_uid ON users(firebase_uid);

-- Attach reusable audit trigger function (created in migration 000002)
CREATE TRIGGER audit_users
    AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
