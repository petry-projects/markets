CREATE TABLE activity_feed (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    actor_id UUID NOT NULL,
    action_type TEXT NOT NULL CHECK (action_type IN ('check_in', 'check_out', 'exception', 'market_update', 'follow', 'status_change')),
    target_type TEXT NOT NULL CHECK (target_type IN ('vendor', 'market')),
    target_id UUID NOT NULL,
    market_id UUID,
    message TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_activity_feed_user ON activity_feed(user_id, created_at DESC);
CREATE INDEX idx_activity_feed_market ON activity_feed(market_id, created_at DESC) WHERE market_id IS NOT NULL;
