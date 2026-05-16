package com.infinitepieces.config

import org.springframework.boot.test.context.TestConfiguration
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.context.annotation.Bean
import org.testcontainers.containers.PostgreSQLContainer

@TestConfiguration
class TestContainerConfig {
  companion object {
    @JvmStatic
    @Bean
    @ServiceConnection
    @Suppress("DEPRECATION")
    fun postgres(): PostgreSQLContainer<*> =
      PostgreSQLContainer("postgres:16-alpine")
        .withDatabaseName("infinitepieces")
  }
}
