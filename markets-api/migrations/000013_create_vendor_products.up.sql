CREATE TABLE vendor_products (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id       UUID        NOT NULL REFERENCES vendors(id),
    name            VARCHAR     NOT NULL,
    description     TEXT        NOT NULL DEFAULT '',
    category        VARCHAR     NOT NULL DEFAULT '',
    image_url       VARCHAR     NOT NULL DEFAULT '',
    is_available    BOOLEAN     NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_vendor_products_vendor_id ON vendor_products(vendor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_vendor_products_category ON vendor_products(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_vendor_products_deleted_at ON vendor_products(deleted_at) WHERE deleted_at IS NULL;

CREATE TRIGGER audit_vendor_products
    AFTER INSERT OR UPDATE OR DELETE ON vendor_products
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
