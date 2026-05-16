package com.infinitepieces.objects

import java.util.UUID

data class User(
  val userId: UUID,
  val email: String,
  val firebaseId: String?,
)
