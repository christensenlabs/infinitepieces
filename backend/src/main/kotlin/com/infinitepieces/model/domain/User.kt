package com.infinitepieces.model.domain

import com.infinitepieces.model.V1Binding
import com.infinitepieces.model.api.v1.User
import java.util.UUID

data class User(
  val userId: UUID,
  val email: String,
  val firebaseId: String?,
  val firstName: String?,
  val lastName: String?,
) : V1Binding {
  override fun toModelV1() = User(userId, email, firebaseId, firstName, lastName)
}
