# Backend

Spring Boot API — Kotlin, Gradle, JOOQ.

## Commands

```bash
./gradlew build                                        # Compile & test
./gradlew bootRun --args='--spring.profiles.active=local'  # Run locally
just lint                                              # ktlint check
just lint-fix                                          # ktlint autofix
just jooq                                              # Generate JOOQ code from migrations
```

Docker:

```bash
just docker-build   # Build image
just docker-up      # Build and run locally (detached, on project network)
```

## Spring Profiles

- `local` — default in Dockerfile, CORS allows `http://localhost:5173`
- `prod` — set by ECS in AWS, CORS allows `https://infinitepieces.christensenlabs.com`
- Profile-specific config lives in `src/main/resources/application-{profile}.yaml`

## Kotlin Conventions

- **Data classes** must be defined in their own file — do not nest them inside controllers, services, or other classes.

## API Controllers

- Annotate controllers with `@ApiController` (defined in the `controller` package) instead of `@RestController`. This automatically applies the `/api` path prefix via `ApiPrefixConfiguration`.
- Controller route mappings should not include `/api` — it is added automatically.

## JOOQ

- Generated code lives in `src/main/kotlin/com/infinitepieces/generated/` — do not edit these files by hand.
- JOOQ uses `DDLDatabase` which parses migration SQL files (no live DB needed). Run `just jooq` after adding or changing migrations.
- **Record mapping**: Define a `RecordMapper<Record, T>` for each domain type and pass it to `fetchOne(mapper)` / `fetch(mapper)`. Do not use `fetchInto()`, inline `.let {}` mapping, or Jackson-based auto-mapping.
