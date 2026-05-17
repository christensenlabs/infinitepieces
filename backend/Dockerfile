# ---- Build stage ----
FROM amazoncorretto:21-alpine AS build
WORKDIR /app
COPY backend/gradle gradle
COPY backend/gradlew backend/build.gradle.kts backend/settings.gradle.kts ./
RUN --mount=type=cache,target=/root/.gradle ./gradlew dependencies --no-daemon
COPY backend/src src
COPY database/migrations src/main/resources/db/migrations
COPY backend/build/generated-src/jooq build/generated-src/jooq
RUN --mount=type=cache,target=/root/.gradle ./gradlew bootJarOnly --no-daemon

# ---- Runtime stage ----
FROM amazoncorretto:21-alpine
RUN adduser -D -u 1000 appuser
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
USER appuser
EXPOSE 8080 5005

# Default to local profile; ECS overrides to "prod" via environment variable.
# Available profiles: local, prod (see src/main/resources/application-*.yaml)
ENV SPRING_PROFILES_ACTIVE=local

ENTRYPOINT ["java", "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005", "-jar", "app.jar"]
