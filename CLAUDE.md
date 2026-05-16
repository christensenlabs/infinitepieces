# Infinite Pieces AI — Infinite Suite

Enterprise ABA (Applied Behavior Analysis) clinic management dashboard.

## Project Structure

- `frontend/` — React SPA (all source, config, and dependencies)
- `backend/` — Spring Boot API (Kotlin, Gradle, JOOQ)
- `database/` — Flyway SQL migrations and local Docker Compose for Postgres
- `terraform/` — AWS infrastructure, using OpenTofu (S3, CloudFront, ECS, RDS)
- `scripts/` — Shell helpers (env loading)
- `config/` — Shared config (`config.yaml`, committed) and secrets (`secrets.yaml`, gitignored)

## Commands
Docker (from repo root):

```bash
just docker-up      # Start local backend + database
just docker-reset   # Wipe database and restart fresh
just deploy-all     # Deploy frontend + backend to AWS
```

## Formatting

- All files must end with a single trailing newline.
- No trailing whitespace on any line.

## Security
- Do not hardcode API keys, PINs, or secrets in components. These should come from context, environment variables, or the mock API layer.
- Do not EVER commit secrets to the repo.
- Do not EVER read any file with the word "secret" in its name.
