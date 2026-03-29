-- Migration 000002: Create reusable audit trigger function
-- This function can be attached to any domain table to automatically
-- insert audit_log rows on INSERT/UPDATE/DELETE.

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    v_actor_id   TEXT;
    v_actor_role TEXT;
    v_target_id  TEXT;
    v_payload    JSONB;
    v_market_id  TEXT;
BEGIN
    -- Read session variables set by Go auth middleware (SET LOCAL)
    v_actor_id   := current_setting('app.actor_id', true);
    v_actor_role := current_setting('app.actor_role', true);

    -- Default to 'system' if session variables are not set (e.g., migrations, cron jobs)
    IF v_actor_id IS NULL OR v_actor_id = '' THEN
        v_actor_id := 'system';
    END IF;
    IF v_actor_role IS NULL OR v_actor_role = '' THEN
        v_actor_role := 'system';
    END IF;

    -- Determine target_id and payload based on operation
    IF TG_OP = 'INSERT' THEN
        v_target_id := NEW.id::TEXT;
        v_payload   := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        v_target_id := NEW.id::TEXT;
        v_payload   := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
    ELSIF TG_OP = 'DELETE' THEN
        v_target_id := OLD.id::TEXT;
        v_payload   := to_jsonb(OLD);
    END IF;

    -- Attempt to extract market_id if the column exists on the source table
    IF TG_OP = 'DELETE' THEN
        BEGIN
            EXECUTE format('SELECT ($1).%I::TEXT', 'market_id') USING OLD INTO v_market_id;
        EXCEPTION WHEN undefined_column THEN
            v_market_id := NULL;
        END;
    ELSE
        BEGIN
            EXECUTE format('SELECT ($1).%I::TEXT', 'market_id') USING NEW INTO v_market_id;
        EXCEPTION WHEN undefined_column THEN
            v_market_id := NULL;
        END;
    END IF;

    INSERT INTO audit_log (actor_id, actor_role, action_type, target_type, target_id, market_id, payload)
    VALUES (v_actor_id, v_actor_role, TG_OP, TG_TABLE_NAME, v_target_id, v_market_id, v_payload);

    -- Always return the appropriate row so the original operation proceeds
    IF TG_OP = 'DELETE' THEN
        RETURN OLD;
    ELSE
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;
