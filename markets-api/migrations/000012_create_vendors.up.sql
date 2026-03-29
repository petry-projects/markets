CREATE TABLE vendors (
    id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID        NOT NULL REFERENCES users(id),
    business_name     VARCHAR     NOT NULL,
    description       TEXT        NOT NULL DEFAULT '',
    contact_info      VARCHAR     NOT NULL DEFAULT '',
    instagram_handle  VARCHAR     NOT NULL DEFAULT '',
    facebook_url      VARCHAR     NOT NULL DEFAULT '',
    website_url       VARCHAR     NOT NULL DEFAULT '',
    image_url         VARCHAR     NOT NULL DEFAULT '',
    created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at        TIMESTAMPTZ
);

CREATE UNIQUE INDEX idx_vendors_user_id ON vendors(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vendors_deleted_at ON vendors(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_vendors_business_name ON vendors(business_name);

CREATE TRIGGER audit_vendors
    AFTER INSERT OR UPDATE OR DELETE ON vendors
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
