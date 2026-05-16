package com.infinitepieces.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.infinitepieces.filter.FirebaseAuthFilter
import jakarta.servlet.http.HttpServletResponse
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.CorsConfigurationSource
import org.springframework.web.cors.UrlBasedCorsConfigurationSource

@Configuration
@EnableMethodSecurity
@Profile("!test")
class SecurityConfig(
  private val firebaseAuthFilter: FirebaseAuthFilter,
  private val objectMapper: ObjectMapper,
) {
  @Value("\${cors.allowed-origins}")
  private lateinit var allowedOrigins: String

  @Bean
  fun corsConfigurationSource(): CorsConfigurationSource {
    val config = CorsConfiguration()
    allowedOrigins.split(",").forEach { config.addAllowedOrigin(it.trim()) }
    config.addAllowedHeader("*")
    config.addAllowedMethod("*")
    config.allowCredentials = true
    val source = UrlBasedCorsConfigurationSource()
    source.registerCorsConfiguration("/**", config)
    return source
  }

  @Bean
  fun securityFilterChain(http: HttpSecurity): SecurityFilterChain =
    http
      .cors { it.configurationSource(corsConfigurationSource()) }
      .csrf { it.disable() }
      .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
      .authorizeHttpRequests {
        it
          // /api/health is public
          .requestMatchers("/api/health")
          .permitAll()
          // Everything else requires auth
          .anyRequest()
          .authenticated()
      }.exceptionHandling {
        it.authenticationEntryPoint { _, response, _ ->
          writeJsonError(response, 401, "Unauthorized")
        }
        it.accessDeniedHandler { _, response, _ ->
          writeJsonError(response, 403, "Forbidden")
        }
      }.addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter::class.java)
      .build()

  private fun writeJsonError(response: HttpServletResponse, status: Int, message: String) {
    response.status = status
    response.contentType = MediaType.APPLICATION_JSON_VALUE
    objectMapper.writeValue(response.outputStream, mapOf("status" to status, "message" to message))
  }
}
