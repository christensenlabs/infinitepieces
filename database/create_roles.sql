-- Admin role: owns the schema, runs migrations (DDL + DML)
CREATE USER infinitepieces_admin WITH PASSWORD :'db_password';
GRANT ALL PRIVILEGES ON DATABASE infinitepieces TO infinitepieces_admin;

-- App role: read-write only (DML), used by the application at runtime
CREATE USER infinitepieces_app WITH PASSWORD :'db_password';
GRANT CONNECT ON DATABASE infinitepieces TO infinitepieces_app;

-- Admin owns public schema
ALTER SCHEMA public OWNER TO infinitepieces_admin;

-- App gets DML on all current and future tables
ALTER DEFAULT PRIVILEGES FOR ROLE infinitepieces_admin IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO infinitepieces_app;

ALTER DEFAULT PRIVILEGES FOR ROLE infinitepieces_admin IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO infinitepieces_app;
