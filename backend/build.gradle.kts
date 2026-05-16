plugins {
  kotlin("jvm") version "2.1.20"
  kotlin("plugin.spring") version "2.1.20"
  id("org.springframework.boot") version "3.4.5"
  id("io.spring.dependency-management") version "1.1.7"
  id("nu.studer.jooq") version "9.0"
  id("org.jlleitschuh.gradle.ktlint") version "12.3.0"
}

group = "com.infinitepieces"
version = "0.0.1-SNAPSHOT"

java {
  toolchain {
    languageVersion = JavaLanguageVersion.of(21)
  }
}

repositories {
  mavenCentral()
}

dependencies {
  implementation("org.springframework.boot:spring-boot-starter-web")
  implementation("org.springframework.boot:spring-boot-starter-security")
  implementation("org.springframework.boot:spring-boot-starter-jooq")
  implementation("com.google.firebase:firebase-admin:9.4.3")
  implementation("org.flywaydb:flyway-core")
  implementation("org.flywaydb:flyway-database-postgresql")
  implementation("org.postgresql:postgresql")
  implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
  implementation("org.jetbrains.kotlin:kotlin-reflect")

  jooqGenerator("org.postgresql:postgresql")
  jooqGenerator("com.github.sabomichal:jooq-meta-postgres-flyway:1.1.1")
  jooqGenerator("org.flywaydb:flyway-core")
  jooqGenerator("org.flywaydb:flyway-database-postgresql")
  jooqGenerator("org.testcontainers:testcontainers:2.0.2")
  jooqGenerator("org.testcontainers:testcontainers-postgresql:2.0.2")
  jooqGenerator("org.slf4j:slf4j-simple:2.0.17")

  testImplementation("org.springframework.boot:spring-boot-starter-test")
  testImplementation("org.springframework.boot:spring-boot-testcontainers")
  testImplementation("org.testcontainers:testcontainers:2.0.2")
  testImplementation("org.testcontainers:testcontainers-postgresql:2.0.2")
  testImplementation("org.jetbrains.kotlin:kotlin-test-junit5")
  testRuntimeOnly("org.junit.platform:junit-platform-launcher")
}

kotlin {
  compilerOptions {
    freeCompilerArgs.addAll("-Xjsr305=strict")
  }
}

sourceSets {
  main {
    kotlin.srcDir("build/generated-src/jooq/main")
  }
}

ktlint {
  version.set("1.6.0")
  filter {
    exclude("**/generated/**")
  }
}

tasks.withType<Test> {
  useJUnitPlatform()
}

// Copy shared migrations into the jar for production use
tasks.processResources {
  from("../database/migrations") {
    into("db/migrations")
  }
}

// JOOQ codegen: uses jooq-meta-postgres-flyway to spin up a Testcontainers
// Postgres, run Flyway migrations, and generate Kotlin code from the schema.
jooq {
  version.set("3.19.22")
  configurations {
    create("main") {
      jooqConfiguration.apply {
        generator.apply {
          name = "org.jooq.codegen.KotlinGenerator"
          database.apply {
            name = "com.github.sabomichal.jooq.PostgresDDLDatabase"
            inputSchema = "public"
            isOutputSchemaToDefault = true
            properties.addAll(
              listOf(
                org.jooq.meta.jaxb
                  .Property()
                  .withKey("locations")
                  .withValue("../database/migrations"),
                org.jooq.meta.jaxb
                  .Property()
                  .withKey("dockerImage")
                  .withValue("postgres:16-alpine"),
              ),
            )
            excludes = "flyway_schema_history"
          }
          generate.apply {
            isDeprecated = false
            isRecords = true
            isPojos = true
            isFluentSetters = true
          }
          target.apply {
            packageName = "com.infinitepieces.generated"
            directory = "build/generated-src/jooq/main"
          }
        }
      }
    }
  }
}
