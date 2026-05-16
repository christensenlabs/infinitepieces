package com.infinitepieces.config

import com.google.auth.oauth2.GoogleCredentials
import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions
import com.google.firebase.auth.FirebaseAuth
import org.slf4j.LoggerFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Profile

@Configuration
@Profile("!test")
class FirebaseConfig {
  private val log = LoggerFactory.getLogger(FirebaseConfig::class.java)

  @Bean
  fun firebaseApp(): FirebaseApp? {
    if (FirebaseApp.getApps().isNotEmpty()) {
      return FirebaseApp.getInstance()
    }
    return try {
      val options =
        FirebaseOptions
          .builder()
          .setCredentials(GoogleCredentials.getApplicationDefault())
          .build()
      FirebaseApp.initializeApp(options)
    } catch (e: Exception) {
      log.warn("Firebase credentials not found — auth disabled. Set GOOGLE_APPLICATION_CREDENTIALS to enable.")
      null
    }
  }

  @Bean
  fun firebaseAuth(firebaseApp: FirebaseApp?): FirebaseAuth? =
    firebaseApp?.let { FirebaseAuth.getInstance(it) }
}
