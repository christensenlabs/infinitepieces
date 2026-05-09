# ---- Build stage ----
FROM amazoncorretto:21-alpine AS build
WORKDIR /app
COPY gradle gradle
COPY gradlew build.gradle.kts settings.gradle.kts ./
RUN ./gradlew dependencies --no-daemon
COPY src src
RUN ./gradlew bootJar --no-daemon

# ---- Runtime stage ----
FROM amazoncorretto:21-alpine
RUN adduser -D -u 1000 appuser
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar
USER appuser
EXPOSE 8080

# Default to local profile; ECS overrides to "prod" via environment variable.
# Available profiles: local, prod (see src/main/resources/application-*.yaml)
ENV SPRING_PROFILES_ACTIVE=local

ENTRYPOINT ["java", "-jar", "app.jar"]
