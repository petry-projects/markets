CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    target_type TEXT NOT NULL CHECK (target_type IN ('vendor', 'market')),
    target_id UUID NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(customer_id, target_type, target_id)
);
CREATE INDEX idx_follows_customer ON follows(customer_id);
CREATE INDEX idx_follows_target ON follows(target_type, target_id);
