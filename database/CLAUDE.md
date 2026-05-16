# Database

Flyway SQL migrations and local Docker Compose for Postgres.

- Schema is managed via **Flyway** migrations in `migrations/`.
- The same migration files run in both local dev and production.

## Migrations

## Conventions

- **Naming**: `V{datetime}__{description}.sql` for versioned migrations, `R__{description}.sql` for repeatable. Use `YYYYMMDDHHmmss` timestamps from the **current system clock** and snake_case descriptions (e.g. `V20260510143000__add_client_table.sql`). Do not use midnight or placeholder timestamps. Timestamps prevent merge conflicts when multiple developers add migrations concurrently.
- **One concern per migration**: Don't mix unrelated table changes in a single file.

## Column Standards

- **Primary keys**: Use `UUID PRIMARY KEY DEFAULT gen_random_uuid()`, named `{table_singular}_id` (e.g. `user_id`, `client_id`).
- **Foreign keys**: Name the column to match the referenced table's PK (e.g. `user_id UUID REFERENCES users(user_id)`).
- **Timestamps**: Every table must include `created_at`. Tables whose rows are updated should also include `updated_at`. Omit `updated_at` for immutable tables (bridge/junction tables, audit logs, etc.). Include `deleted_at` for tables that support soft deletes.
  ```sql
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),  -- omit for immutable tables
  deleted_at TIMESTAMPTZ                          -- omit if not soft-deletable
  ```
- **Triggers**: Use the shared `set_created_timestamps()` and `set_updated_timestamp()` trigger functions (defined in `V1__initial_schema.sql`) on new tables instead of relying on application code.
- **Soft deletes**: Use `deleted_at IS NULL` to filter active rows. Do not hard-delete data.
- **Text columns**: Use `TEXT` instead of `VARCHAR(n)` unless there is a strict length constraint.
- **Booleans**: Use `BOOLEAN NOT NULL DEFAULT false`, not integers.

## SQL Style

- Keywords in uppercase (`CREATE TABLE`, `NOT NULL`, `DEFAULT`).
- Table names in lowercase plural (`users`, `clients`, `sessions`).
- Column names in lowercase snake_case.
- Indent columns with 4 spaces.
- One column per line.
- Trailing comma after each column except the last.
- End every file with a trailing newline.

## JOOQ Compatibility

- Avoid PL/pgSQL procedural blocks (`DO $$`) in migrations that define schema. The JOOQ DDLDatabase parser cannot handle them.
- Standard DDL (`CREATE TABLE`, `ALTER TABLE`, `CREATE INDEX`, `CREATE VIEW`) works fine.
- If a migration must use Postgres-specific syntax that JOOQ can't parse, move it to a separate file and exclude it from the codegen glob in `build.gradle.kts`.
