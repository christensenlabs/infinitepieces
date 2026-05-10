package com.infinitepieces.config

import org.jooq.conf.RenderQuotedNames
import org.jooq.conf.Settings
import org.jooq.impl.DefaultConfiguration
import org.springframework.boot.autoconfigure.jooq.DefaultConfigurationCustomizer
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class JooqConfig {

    @Bean
    fun jooqConfigurationCustomizer() = DefaultConfigurationCustomizer { config: DefaultConfiguration ->
        config.set(
            Settings()
                .withRenderSchema(false)
                .withRenderQuotedNames(RenderQuotedNames.EXPLICIT_DEFAULT_UNQUOTED)
        )
    }
}
