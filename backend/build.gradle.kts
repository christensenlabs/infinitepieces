plugins {
    kotlin("jvm") version "2.1.20"
    kotlin("plugin.spring") version "2.1.20"
    id("org.springframework.boot") version "3.4.5"
    id("io.spring.dependency-management") version "1.1.7"
    id("nu.studer.jooq") version "9.0"
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
    implementation("org.springframework.boot:spring-boot-starter-jooq")
    implementation("org.flywaydb:flyway-core")
    implementation("org.flywaydb:flyway-database-postgresql")
    implementation("org.postgresql:postgresql")
    implementation("com.fasterxml.jackson.module:jackson-module-kotlin")
    implementation("org.jetbrains.kotlin:kotlin-reflect")

    jooqGenerator("org.jooq:jooq-meta-extensions:3.19.22")

    testImplementation("org.springframework.boot:spring-boot-starter-test")
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

tasks.withType<Test> {
    useJUnitPlatform()
}

// Copy shared migrations into the jar for production use
tasks.processResources {
    from("../database/migrations") {
        into("db/migrations")
    }
}

// JOOQ code generation — parses migration SQL files directly (no live DB needed)
jooq {
    version.set("3.19.22")
    configurations {
        create("main") {
            jooqConfiguration.apply {
                generator.apply {
                    name = "org.jooq.codegen.KotlinGenerator"
                    database.apply {
                        name = "org.jooq.meta.extensions.ddl.DDLDatabase"
                        // Only scan DDL-safe migrations. Files with PL/pgSQL (triggers,
                        // functions) must be excluded since the H2 parser can't handle them.
                        // Convention: name DDL files normally, name PL/pgSQL files with
                        // a __plpgsql_ or __seed_ prefix after the version number.
                        properties.add(org.jooq.meta.jaxb.Property().apply {
                            key = "scripts"
                            value = "../database/migrations/*.sql"
                        })
                        properties.add(org.jooq.meta.jaxb.Property().apply {
                            key = "sort"
                            value = "flyway"
                        })
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
