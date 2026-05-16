package com.infinitepieces.model.api.v1

import java.util.UUID

data class User(
  val userId: UUID,
  val email: String,
  val firebaseId: String?,
) : ModelV1()
