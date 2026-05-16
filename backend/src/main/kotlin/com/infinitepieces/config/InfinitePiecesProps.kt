package com.infinitepieces.config

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "infinitepieces")
data class InfinitePiecesProps(
  val firebase: FirebaseProps,
) {
  data class FirebaseProps(
    val projectId: String,
    val googleCertsUrl: String,
  )
}
