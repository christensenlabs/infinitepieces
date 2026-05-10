-- Trigger function: set created_at and updated_at on insert
CREATE FUNCTION set_created_timestamps() RETURNS TRIGGER AS $$
BEGIN
    NEW.created_at := now();
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger function: update updated_at on every update
CREATE FUNCTION set_updated_timestamp() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_on_create
    BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION set_created_timestamps();

CREATE TRIGGER users_on_update
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_timestamp();
