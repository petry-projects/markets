CREATE TABLE check_ins (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id        UUID        NOT NULL REFERENCES vendors(id),
    market_id        UUID        NOT NULL REFERENCES markets(id),
    status           VARCHAR     NOT NULL DEFAULT 'checked_in'
                     CHECK (status IN ('checked_in', 'checked_out', 'exception')),
    exception_reason VARCHAR     NOT NULL DEFAULT '',
    checked_in_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    checked_out_at   TIMESTAMPTZ
);

CREATE INDEX idx_check_ins_vendor_id ON check_ins(vendor_id);
CREATE INDEX idx_check_ins_market_id ON check_ins(market_id);
CREATE INDEX idx_check_ins_vendor_status ON check_ins(vendor_id, status) WHERE status = 'checked_in';

CREATE TRIGGER audit_check_ins
    AFTER INSERT OR UPDATE OR DELETE ON check_ins
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
