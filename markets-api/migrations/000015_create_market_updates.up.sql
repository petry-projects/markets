CREATE TABLE market_updates (
    id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    market_id  UUID        NOT NULL REFERENCES markets(id),
    sender_id  UUID        NOT NULL REFERENCES users(id),
    message    TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_market_updates_market_id ON market_updates(market_id);

CREATE TRIGGER audit_market_updates
    AFTER INSERT OR UPDATE OR DELETE ON market_updates
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
