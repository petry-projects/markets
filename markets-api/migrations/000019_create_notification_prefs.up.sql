CREATE TABLE notification_prefs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    check_in_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    checkout_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    exception_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    market_updates BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
